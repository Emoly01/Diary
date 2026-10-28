import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  type Query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { bookDay } from './day';
import { isMood, type Mood } from './moods';
import { photosCol, photoDoc, scrapDoc, scrapsCol } from './paths';
import type { PreparedPhoto } from './photos';
import { addToOutbox, removeFromOutbox, replayOutbox, type OutboxEntry } from './outbox';
import type { Settings } from './settings';

export type Scrap = {
  id: string;
  text: string;
  mood: Mood | null;
  photoId: string | null;
  capturedAt: Date;
  /** The book day it was caught on (YYYY-MM-DD, 04:00 rollover). */
  day: string;
  /** null while it waits in the tray; the page's day once filed. */
  pageDay: string | null;
  /** Saved on this device but not yet on the server. */
  pending: boolean;
};

/** What to do with a scrap's photo when saving. */
export type PhotoChange =
  | { kind: 'keep' }
  | { kind: 'remove' }
  | { kind: 'replace'; photo: PreparedPhoto };

function fromSnapshot(snap: QueryDocumentSnapshot): Scrap {
  const d = snap.data();
  const captured = d.capturedAt instanceof Timestamp ? d.capturedAt.toDate() : new Date(0);
  return {
    id: snap.id,
    text: typeof d.text === 'string' ? d.text : '',
    mood: isMood(d.mood) ? d.mood : null,
    photoId: typeof d.photoId === 'string' ? d.photoId : null,
    capturedAt: captured,
    day: typeof d.day === 'string' ? d.day : '',
    pageDay: typeof d.pageDay === 'string' ? d.pageDay : null,
    pending: snap.metadata.hasPendingWrites,
  };
}

// Writes never wait on the network. The batch goes into the offline queue at
// once and the returned promise settles when the server confirms (or refuses);
// callers should listen for failure, never await success.

export function createScrap(
  uid: string,
  input: { text: string; mood: Mood | null; photo: PreparedPhoto | null },
  settings: Settings,
  now = new Date(),
): { id: string; synced: Promise<void> } {
  const entry: OutboxEntry = {
    id: doc(scrapsCol(uid)).id,
    photoId: input.photo ? doc(photosCol(uid)).id : null,
    text: input.text,
    mood: input.mood,
    capturedAt: now.getTime(),
    day: bookDay(now, settings.dayStartsAt, settings.timezone),
    photo: input.photo,
  };
  // Copied synchronously first: see outbox.ts for why.
  addToOutbox(uid, entry);
  const synced = writeScrap(uid, entry);
  synced.then(() => removeFromOutbox(uid, entry.id), () => {});
  return { id: entry.id, synced };
}

/** One batch for a new scrap and its photo. Idempotent: the ids are fixed. */
function writeScrap(uid: string, e: OutboxEntry): Promise<void> {
  const batch = writeBatch(db);
  if (e.photo && e.photoId) {
    batch.set(photoDoc(uid, e.photoId), { ...e.photo, createdAt: serverTimestamp() });
  }
  batch.set(scrapDoc(uid, e.id), {
    text: e.text,
    mood: e.mood,
    photoId: e.photo ? e.photoId : null,
    capturedAt: Timestamp.fromMillis(e.capturedAt),
    day: e.day,
    pageDay: null,
    createdAt: serverTimestamp(),
  });
  return batch.commit();
}

/** On start: write again any new scrap the app was closed on too quickly. */
export function resendLostScraps(uid: string): Promise<number> {
  return replayOutbox(uid, (e) => writeScrap(uid, e));
}

export function updateScrap(
  uid: string,
  scrap: Scrap,
  input: { text: string; mood: Mood | null; photo: PhotoChange },
): Promise<void> {
  // An edit supersedes the outbox copy; replaying it would undo the edit.
  removeFromOutbox(uid, scrap.id);
  const batch = writeBatch(db);
  let photoId = scrap.photoId;

  if (input.photo.kind !== 'keep') {
    if (scrap.photoId) batch.delete(photoDoc(uid, scrap.photoId));
    photoId = null;
  }
  if (input.photo.kind === 'replace') {
    const photoRef = doc(photosCol(uid));
    photoId = photoRef.id;
    batch.set(photoRef, { ...input.photo.photo, createdAt: serverTimestamp() });
  }

  batch.update(scrapDoc(uid, scrap.id), { text: input.text, mood: input.mood, photoId });
  return batch.commit();
}

export function deleteScrap(uid: string, scrap: Scrap): Promise<void> {
  // Or a replay would bring the deleted scrap back.
  removeFromOutbox(uid, scrap.id);
  const batch = writeBatch(db);
  batch.delete(scrapDoc(uid, scrap.id));
  if (scrap.photoId) batch.delete(photoDoc(uid, scrap.photoId));
  return batch.commit();
}

/**
 * Live scraps for a query, newest first. Sorted here, so the queries need no
 * composite index. `key` identifies the query; it re-subscribes when it changes.
 */
function useScrapQuery(key: string, build: () => Query): Scrap[] {
  const [scraps, setScraps] = useState<Scrap[]>([]);

  useEffect(() => {
    return onSnapshot(
      build(),
      { includeMetadataChanges: true },
      (snap) => {
        const list = snap.docs.map(fromSnapshot);
        list.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
        setScraps(list);
      },
      (err) => console.error(err),
    );
    // `build` is a fresh closure each render; `key` says when it really changed.
  }, [key]);

  return scraps;
}

/** Scraps caught on the given book day, filed or not. */
export function useDayScraps(uid: string, day: string): Scrap[] {
  return useScrapQuery(`day:${uid}:${day}`, () => query(scrapsCol(uid), where('day', '==', day)));
}

/** Unfiled scraps waiting in the tray. */
export function useTrayScraps(uid: string): Scrap[] {
  return useScrapQuery(`tray:${uid}`, () => query(scrapsCol(uid), where('pageDay', '==', null)));
}

/** Scraps filed onto the page for `day`. */
export function usePageScraps(uid: string, day: string): Scrap[] {
  return useScrapQuery(`page:${uid}:${day}`, () => query(scrapsCol(uid), where('pageDay', '==', day)));
}
