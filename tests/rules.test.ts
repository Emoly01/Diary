import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const rules = readFileSync('firestore.rules', 'utf8');

// Test against whatever UID is written into the rules, placeholder or real.
const OWNER = rules.match(/uid == '([^']+)'/)?.[1];
if (!OWNER) throw new Error('Could not find the owner UID in firestore.rules');
const STRANGER = 'someone-else';

// One path per collection in the data model.
const OWNER_DOCS = [
  ['settings', 'main'],
  ['scraps', 's1'],
  ['pages', '2026-10-27'],
  ['photos', 'p1'],
  ['customStickers', 'c1'],
] as const;

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-daybook',
    firestore: { rules },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Seed the owner's book with rules switched off.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const [col, id] of OWNER_DOCS) {
      await setDoc(doc(db, 'users', OWNER, col, id), { seeded: true });
    }
    await setDoc(doc(db, 'users', STRANGER, 'pages', '2026-10-27'), { seeded: true });
    await setDoc(doc(db, 'elsewhere', 'x'), { seeded: true });
  });
});

describe('the owner', () => {
  it('can read, write and delete everything in their book', async () => {
    const db = env.authenticatedContext(OWNER).firestore();
    for (const [col, id] of OWNER_DOCS) {
      const ref = doc(db, 'users', OWNER, col, id);
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(setDoc(ref, { edited: true }));
      await assertSucceeds(deleteDoc(ref));
    }
    await assertSucceeds(getDocs(collection(db, 'users', OWNER, 'scraps')));
  });

  it("can't touch another uid's tree or anything outside users/", async () => {
    const db = env.authenticatedContext(OWNER).firestore();
    await assertFails(getDoc(doc(db, 'users', STRANGER, 'pages', '2026-10-27')));
    await assertFails(setDoc(doc(db, 'users', STRANGER, 'pages', 'x'), { a: 1 }));
    await assertFails(getDoc(doc(db, 'elsewhere', 'x')));
    await assertFails(setDoc(doc(db, 'elsewhere', 'y'), { a: 1 }));
  });
});

describe('another signed-in Google account', () => {
  it("is denied every read and write in the owner's book", async () => {
    const db = env.authenticatedContext(STRANGER).firestore();
    for (const [col, id] of OWNER_DOCS) {
      const ref = doc(db, 'users', OWNER, col, id);
      await assertFails(getDoc(ref));
      await assertFails(setDoc(ref, { hacked: true }));
      await assertFails(deleteDoc(ref));
      await assertFails(getDocs(collection(db, 'users', OWNER, col)));
    }
  });

  it('is denied even under its own uid', async () => {
    const db = env.authenticatedContext(STRANGER).firestore();
    await assertFails(getDoc(doc(db, 'users', STRANGER, 'pages', '2026-10-27')));
    await assertFails(setDoc(doc(db, 'users', STRANGER, 'pages', 'new'), { a: 1 }));
    await assertFails(getDoc(doc(db, 'elsewhere', 'x')));
  });
});

describe('a signed-out visitor', () => {
  it('is denied everywhere', async () => {
    const db = env.unauthenticatedContext().firestore();
    for (const [col, id] of OWNER_DOCS) {
      const ref = doc(db, 'users', OWNER, col, id);
      await assertFails(getDoc(ref));
      await assertFails(setDoc(ref, { hacked: true }));
      await assertFails(getDocs(collection(db, 'users', OWNER, col)));
    }
    await assertFails(getDoc(doc(db, 'elsewhere', 'x')));
    await assertFails(setDoc(doc(db, 'elsewhere', 'y'), { a: 1 }));
  });
});
