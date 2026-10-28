import { useEffect, useState } from 'react';
import { onSnapshot, serverTimestamp, Timestamp, writeBatch, type DocumentData } from 'firebase/firestore';
import type { JSONContent } from '@tiptap/react';
import { db } from '../firebase';
import { isMood, type Mood } from './moods';
import { pageDoc, scrapDoc } from './paths';

export type StickerKind = 'preset' | 'washi' | 'custom' | 'photo' | 'link';

/** Positions are logical px on the 960 px page, so they hold on every screen. */
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
  /** Client clock (ms) of the last edit. Decides between a draft and the saved page. */
  editedAt: number;
  createdAt: Timestamp | null;
};

export const PAGE_WIDTH = 960;

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
    && [s.x, s.y, s.rotation, s.scale, s.z].every((n) => typeof n === 'number');
}

export function pageFromData(day: string, d: DocumentData): Page {
  return {
    day,
    title: typeof d.title === 'string' ? d.title : '',
    body: d.body && typeof d.body === 'object' ? (d.body as JSONContent) : emptyBody(),
    mood: isMood(d.mood) ? d.mood : null,
    stickers: Array.isArray(d.stickers) ? d.stickers.filter(isSticker) : [],
    scrapIds: Array.isArray(d.scrapIds) ? d.scrapIds.filter((x: unknown) => typeof x === 'string') : [],
    editedAt: typeof d.editedAt === 'number' ? d.editedAt : 0,
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt : null,
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

/**
 * Writes the whole page (never a merge: a merge would deep-merge the editor
 * JSON). `fileScrapIds` are marked as filed onto this page in the same batch.
 * Queued offline at once; the promise settles when the server answers.
 */
export function savePage(
  uid: string,
  day: string,
  content: PageContent,
  meta: { editedAt: number; createdAt: Timestamp },
  fileScrapIds: string[] = [],
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
    scrapIds: content.scrapIds,
    wordCount: countWords(plainText),
    editedAt: meta.editedAt,
    createdAt: meta.createdAt,
    updatedAt: serverTimestamp(),
  });
  for (const id of fileScrapIds) batch.update(scrapDoc(uid, id), { pageDay: day });
  return batch.commit();
}
