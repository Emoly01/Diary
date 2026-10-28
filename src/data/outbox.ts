import { getDoc } from 'firebase/firestore';
import { scrapDoc } from './paths';
import type { Mood } from './moods';
import type { PreparedPhoto } from './photos';

// Firestore records a write in its offline store a few milliseconds after
// it's made. If the app is closed inside that window, a fresh scrap would be
// lost. So each new scrap is also copied here, synchronously, until the
// server has it; on the next start, anything left that isn't in the book is
// written again under the same ids.

export type OutboxEntry = {
  id: string;
  photoId: string | null;
  text: string;
  mood: Mood | null;
  capturedAt: number;
  day: string;
  photo: PreparedPhoto | null;
};

const key = (uid: string) => `daybook:outbox:${uid}`;

function read(uid: string): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as OutboxEntry[]) : [];
  } catch {
    return [];
  }
}

function write(uid: string, entries: OutboxEntry[]): void {
  try {
    if (entries.length) localStorage.setItem(key(uid), JSON.stringify(entries));
    else localStorage.removeItem(key(uid));
  } catch {
    // Full (photos are big): Firestore's own queue still has the write.
  }
}

export function addToOutbox(uid: string, entry: OutboxEntry): void {
  write(uid, [...read(uid).filter((e) => e.id !== entry.id), entry]);
}

export function removeFromOutbox(uid: string, id: string): void {
  const entries = read(uid);
  if (entries.some((e) => e.id === id)) write(uid, entries.filter((e) => e.id !== id));
}

/**
 * Re-sends scraps that never made it. `getDoc` sees the server and this
 * device's pending writes, so a scrap that's merely waiting to sync is left alone.
 */
export async function replayOutbox(uid: string, resend: (entry: OutboxEntry) => Promise<void>): Promise<number> {
  let resent = 0;
  for (const entry of read(uid)) {
    let exists = false;
    try {
      exists = (await getDoc(scrapDoc(uid, entry.id))).exists();
    } catch {
      exists = false; // offline and not on this device: it was lost
    }
    if (exists) {
      removeFromOutbox(uid, entry.id);
      continue;
    }
    resent++;
    resend(entry).then(
      () => removeFromOutbox(uid, entry.id),
      (err) => console.error(err),
    );
  }
  return resent;
}
