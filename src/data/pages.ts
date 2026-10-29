import { useEffect, useState } from 'react';
import { onSnapshot, serverTimestamp, Timestamp, writeBatch, type DocumentData } from 'firebase/firestore';
import type { JSONContent } from '@tiptap/react';
import { db } from '../firebase';
import { isMood, type Mood } from './moods';
import { pageDoc, photoDoc, scrapDoc } from './paths';
import type { PreparedPhoto } from './photos';

export type StickerKind = 'preset' | 'washi' | 'custom' | 'photo' | 'link';

/** Positions are logical px on the 640 px page, so they hold on every screen. */
export type Sticker = {
  id: string;
  kind: StickerKind;
  /** Preset name, photoId, or image URL for `link`. */
  ref: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z: number;
  /**
   * Washi only: the tape's unscaled length in logical px, once it has been
   * stretched. Absent means the default length. Never stored as undefined.
   */
  length?: number;
};

/** What the owner edits on a page. */
export type PageContent = {
  title: string;
  body: JSONContent;
  mood: Mood | null;
  stickers: Sticker[];
  scrapIds: string[];
};

export type Page = PageContent & {
  day: string;
  /** Read from a page saved before layout 2: its stickers were converted on the way in, and it wants saving. */
  migrated: boolean;
  /** Client clock (ms) of the last edit. Decides between a draft and the saved page. */
  editedAt: number;
  createdAt: Timestamp | null;
};

export const PAGE_WIDTH = 640;

/**
 * Pages saved before the redesign kept sticker positions on a 960 px page.
 * `layout: 2` marks the 640 px page. Old pages are converted when read, so
 * every screen sees 640-space; the desk then saves them with `layout: 2`.
 */
export const LAYOUT = 2;
const FROM_960 = 640 / 960;

/** A sticker list from the 960 px page, on the 640 px page. A washi `length` is unscaled, so it stays. */
export function toLayout2(stickers: Sticker[]): Sticker[] {
  return stickers.map((s) => ({
    ...s,
    x: Math.round(s.x * FROM_960 * 10) / 10,
    y: Math.round(s.y * FROM_960 * 10) / 10,
    scale: Math.round(s.scale * FROM_960 * 1000) / 1000,
  }));
}

export const emptyBody = (): JSONContent => ({ type: 'doc', content: [{ type: 'paragraph' }] });

export const emptyContent = (): PageContent => ({
  title: '',
  body: emptyBody(),
  mood: null,
  stickers: [],
  scrapIds: [],
});

const BLOCKS = new Set(['paragraph', 'heading', 'listItem', 'blockquote', 'codeBlock']);

/** The page body as plain text, one line per block. Kept for search. */
export function plainTextOf(node: JSONContent): string {
  const lines: string[] = [];
  let line = '';
  const walk = (n: JSONContent) => {
    if (n.type === 'text') line += n.text ?? '';
    else if (n.type === 'hardBreak') line += '\n';
    for (const child of n.content ?? []) walk(child);
    if (n.type && BLOCKS.has(n.type) && !(n.content ?? []).some((c) => c.type && BLOCKS.has(c.type))) {
      lines.push(line);
      line = '';
    }
  };
  walk(node);
  if (line) lines.push(line);
  return lines.join('\n').trim();
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function isSticker(v: unknown): v is Sticker {
  const s = v as Sticker;
  return !!s && typeof s.id === 'string' && typeof s.kind === 'string' && typeof s.ref === 'string'
    && [s.x, s.y, s.rotation, s.scale, s.z].every((n) => typeof n === 'number')
    && (s.length === undefined || typeof s.length === 'number');
}

/** Stickers as stored: only the fields a sticker has, and no `length` key unless it was stretched. */
export function stickersFromData(raw: unknown, layout: unknown): Sticker[] {
  const list: Sticker[] = (Array.isArray(raw) ? raw.filter(isSticker) : []).map(
    ({ id, kind, ref, x, y, rotation, scale, z, length }: Sticker) =>
      length === undefined ? { id, kind, ref, x, y, rotation, scale, z } : { id, kind, ref, x, y, rotation, scale, z, length },
  );
  return layout === LAYOUT ? list : toLayout2(list);
}

export function pageFromData(day: string, d: DocumentData): Page {
  return {
    day,
    title: typeof d.title === 'string' ? d.title : '',
    body: d.body && typeof d.body === 'object' ? (d.body as JSONContent) : emptyBody(),
    mood: isMood(d.mood) ? d.mood : null,
    stickers: stickersFromData(d.stickers, d.layout),
    scrapIds: Array.isArray(d.scrapIds) ? d.scrapIds.filter((x: unknown) => typeof x === 'string') : [],
    editedAt: typeof d.editedAt === 'number' ? d.editedAt : 0,
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt : null,
    migrated: d.layout !== LAYOUT,
  };
}

export type PageState =
  | { status: 'loading' }
  | { status: 'ready'; page: Page | null; pending: boolean; error?: undefined }
  | { status: 'error'; error: string };

/** Live page for a day; `page` is null until it's first saved. */
export function usePage(uid: string, day: string): PageState {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  useEffect(() => {
    setState({ status: 'loading' });
    return onSnapshot(
      pageDoc(uid, day),
      { includeMetadataChanges: true },
      (snap) => {
        const data = snap.data();
        setState({
          status: 'ready',
          page: data ? pageFromData(day, data) : null,
          pending: snap.metadata.hasPendingWrites,
        });
      },
      (err) => setState({ status: 'error', error: (err as { code?: string }).code ?? 'unknown' }),
    );
  }, [uid, day]);
  return state;
}

/** Writes that ride along with a page save, in the same batch. */
export type SaveExtras = {
  /** Scraps to mark as filed onto this page. */
  file?: string[];
  /** Photos added at the desk. */
  addPhotos?: { id: string; photo: PreparedPhoto }[];
  /** Photos whose last sticker was removed. */
  deletePhotos?: string[];
};

/**
 * Writes the whole page (never a merge: a merge would deep-merge the editor
 * JSON), plus any `extras`, in one batch. Queued offline at once; the
 * promise settles when the server answers.
 */
export function savePage(
  uid: string,
  day: string,
  content: PageContent,
  meta: { editedAt: number; createdAt: Timestamp },
  extras: SaveExtras = {},
): Promise<void> {
  const plainText = plainTextOf(content.body);
  const batch = writeBatch(db);
  batch.set(pageDoc(uid, day), {
    day,
    title: content.title,
    body: content.body,
    plainText,
    mood: content.mood,
    stickers: content.stickers,
    layout: LAYOUT,
    scrapIds: content.scrapIds,
    wordCount: countWords(plainText),
    editedAt: meta.editedAt,
    createdAt: meta.createdAt,
    updatedAt: serverTimestamp(),
  });
  for (const id of extras.file ?? []) batch.update(scrapDoc(uid, id), { pageDay: day });
  for (const { id, photo } of extras.addPhotos ?? []) {
    batch.set(photoDoc(uid, id), { ...photo, createdAt: serverTimestamp() });
  }
  for (const id of extras.deletePhotos ?? []) batch.delete(photoDoc(uid, id));
  return batch.commit();
}
