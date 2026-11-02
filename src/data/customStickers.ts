import { useEffect, useState } from 'react';
import { onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { unzipSync } from 'fflate';
import { db } from '../firebase';
import { customStickerDoc, customStickersCol, photoDoc } from './paths';

/**
 * The owner's own stickers: bought packs and loose pictures, kept in the
 * book behind the same lock as everything else. Each one is a
 * `customStickers/{id}` entry ({ name, pack, photoId, width, height }) and a
 * `photos/{photoId}` holding the picture. Unlike a photo, the picture stays
 * PNG, WebP or GIF, so the transparent edges stay transparent.
 *
 * The id is a hash of the file, so adding the same pack twice adds nothing.
 */
export type CustomSticker = {
  id: string;
  name: string;
  pack: string;
  photoId: string;
  /** The stored picture's size in px. */
  width: number;
  height: number;
};

/** A picture taken out of what the owner picked, not yet stored. */
export type StickerFile = { name: string; pack: string; bytes: Uint8Array };

export class StickerError extends Error {}

const TYPES: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};
/** Types kept as they are when small enough. A JPEG has no see-through edge, but it still works. */
const KEEP = new Set(Object.values(TYPES));

/** The longest side a stored sticker keeps. The page shows it at 200 logical px, up to 4× that. */
const MAX_SIDE = 800;
/** Base64 size a sticker may keep as it is, well under Firestore's 1 MiB document cap. */
const MAX_BASE64 = 400_000;
/** Base64 size after shrinking. Above this, it's refused. */
const HARD_MAX_BASE64 = 900_000;
/** One zip entry larger than this is skipped, unpacked. */
const MAX_ENTRY_BYTES = 25 * 1024 * 1024;
/** Stickers in one go. */
export const MAX_AT_ONCE = 400;
/** Firestore takes about 10 MiB per batch; stay well under it. */
const BATCH_BYTES = 4_000_000;

const extOf = (name: string) => name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
export const typeOf = (name: string): string | null => TYPES[extOf(name)] ?? null;

const baseName = (path: string) => path.split('/').pop() ?? path;
const stripExt = (name: string) => name.replace(/\.[^.]+$/, '');

/** Pack names read better without "PNG" or "stickers" tacked on the end. */
export function tidyPackName(raw: string): string {
  const t = stripExt(raw)
    .replace(/[_]+/g, ' ')
    .replace(/(\s*[-–·]?\s*\b(png|pngs|webp|transparent)\b)+\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t || 'My stickers';
}

/** Sorts "2" before "10". */
export const naturalCompare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/** Mac zips carry a shadow folder and dot files that aren't pictures. */
const isJunk = (path: string) => path.split('/').some((part) => part === '__MACOSX' || part.startsWith('.'));

/**
 * The pictures in a zip. The pack is named after the folder they're in,
 * or after the zip when they sit at its top.
 */
export function picturesInZip(zipName: string, data: Uint8Array): StickerFile[] {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(data, {
      filter: (f) => !isJunk(f.name) && typeOf(f.name) !== null && f.originalSize <= MAX_ENTRY_BYTES,
    });
  } catch {
    throw new StickerError(`${zipName} couldn’t be opened. Is it a whole zip?`);
  }
  const fallback = tidyPackName(zipName);
  return Object.entries(entries)
    .filter(([, bytes]) => bytes.length > 0)
    .map(([path, bytes]) => {
      const folders = path.split('/').slice(0, -1);
      const pack = folders.length ? tidyPackName(folders[folders.length - 1]) : fallback;
      return { name: stripExt(baseName(path)), pack, bytes };
    });
}

/** Everything picked: zips are opened, loose pictures go in a pack called "Loose". */
export async function picturesIn(files: File[]): Promise<StickerFile[]> {
  const out: StickerFile[] = [];
  for (const f of files) {
    if (extOf(f.name) === 'zip') {
      out.push(...picturesInZip(f.name, new Uint8Array(await f.arrayBuffer())));
    } else if (typeOf(f.name) || f.type.startsWith('image/')) {
      out.push({ name: stripExt(f.name), pack: 'Loose', bytes: new Uint8Array(await f.arrayBuffer()) });
    }
  }
  return out.sort((a, b) => naturalCompare(a.pack, b.pack) || naturalCompare(a.name, b.name));
}

/** A short, stable id from the file's bytes. */
export async function stickerId(bytes: Uint8Array): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as BufferSource));
  return `st-${Array.from(hash.slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));

/** A picture ready to store. */
export type PreparedSticker = { data: string; type: string; width: number; height: number; bytes: number };

/**
 * Keeps a small sticker exactly as it came. A big one is shrunk to 800 px on
 * its longer side, as WebP where the browser can write it, else PNG: both
 * keep the transparent edge.
 */
export async function prepareSticker(file: StickerFile): Promise<PreparedSticker> {
  const realType = sniffType(file.bytes);
  const blob = new Blob([file.bytes as BlobPart], { type: realType ?? '' });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new StickerError(`${file.name} isn’t a picture this browser can read.`);
  }
  const { width, height } = bitmap;

  if (realType && KEEP.has(realType) && Math.max(width, height) <= MAX_SIDE && file.bytes.length * 1.37 <= MAX_BASE64) {
    bitmap.close();
    return { data: toBase64(file.bytes), type: realType, width, height, bytes: file.bytes.length };
  }

  try {
    for (const side of [MAX_SIDE, 600, 400]) {
      const k = Math.min(1, side / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * k));
      canvas.height = Math.max(1, Math.round(height * k));
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      // Safari may hand back PNG when asked for WebP; either keeps the edge.
      const out = (await toBlob(canvas, 'image/webp')) ?? (await toBlob(canvas, 'image/png'));
      if (!out) continue;
      const bytes = new Uint8Array(await out.arrayBuffer());
      const data = toBase64(bytes);
      if (data.length <= HARD_MAX_BASE64) {
        return { data, type: out.type || 'image/png', width: canvas.width, height: canvas.height, bytes: bytes.length };
      }
    }
  } finally {
    bitmap.close();
  }
  throw new StickerError(`${file.name} is too big to keep, even shrunk.`);
}

/** The picture's real type from its first bytes, whatever its name says. */
export function sniffType(b: Uint8Array): string | null {
  const at = (i: number, ...xs: number[]) => xs.every((x, j) => b[i + j] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  return null;
}

export type AddResult = { added: number; already: number; failed: string[]; packs: string[] };

/**
 * Stores the pictures. Each sticker and its picture land in the same batch;
 * batches are queued offline at once, like every other write in the book.
 */
export async function addCustomStickers(
  uid: string,
  files: StickerFile[],
  known: Set<string>,
  onProgress: (done: number, total: number) => void,
): Promise<AddResult> {
  if (files.length > MAX_AT_ONCE) {
    throw new StickerError(`That’s ${files.length} pictures. Add up to ${MAX_AT_ONCE} at a time.`);
  }
  const result: AddResult = { added: 0, already: 0, failed: [], packs: [] };
  const commits: Promise<void>[] = [];
  const seen = new Set(known);
  let batch = writeBatch(db);
  let size = 0;
  let ops = 0;
  const send = () => {
    if (ops) commits.push(batch.commit());
    batch = writeBatch(db);
    size = 0;
    ops = 0;
  };

  for (const [i, file] of files.entries()) {
    onProgress(i, files.length);
    const id = await stickerId(file.bytes);
    if (seen.has(id)) {
      result.already++;
      continue;
    }
    seen.add(id);
    let prepared: PreparedSticker;
    try {
      prepared = await prepareSticker(file);
    } catch (err) {
      result.failed.push(err instanceof StickerError ? err.message : `${file.name} couldn’t be read.`);
      continue;
    }
    if (size + prepared.data.length > BATCH_BYTES || ops >= 400) send();
    batch.set(photoDoc(uid, id), { ...prepared, createdAt: serverTimestamp() });
    batch.set(customStickerDoc(uid, id), {
      name: file.name,
      pack: file.pack,
      photoId: id,
      width: prepared.width,
      height: prepared.height,
      createdAt: serverTimestamp(),
    });
    size += prepared.data.length;
    ops += 2;
    result.added++;
    if (!result.packs.includes(file.pack)) result.packs.push(file.pack);
  }
  send();
  onProgress(files.length, files.length);
  // The stickers show at once from the local copy; a refused write is still worth hearing about.
  void Promise.all(commits).catch((err) => console.error('Storing stickers failed', err));
  return result;
}

/**
 * Takes stickers out of the drawer. Their pictures stay, for the pages
 * they're already on. Queued offline at once; settles when the server answers.
 */
export function putAway(uid: string, ids: string[]): Promise<void> {
  const commits: Promise<void>[] = [];
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db);
    for (const id of ids.slice(i, i + 400)) batch.delete(customStickerDoc(uid, id));
    commits.push(batch.commit());
  }
  return Promise.all(commits).then(() => {});
}

export type CustomStickersState = { status: 'loading' } | { status: 'ready'; stickers: CustomSticker[] } | { status: 'error' };

function fromData(id: string, d: Record<string, unknown>): CustomSticker | null {
  const { name, pack, photoId, width, height } = d;
  if (typeof photoId !== 'string' || typeof width !== 'number' || typeof height !== 'number') return null;
  return {
    id,
    name: typeof name === 'string' ? name : 'Sticker',
    pack: typeof pack === 'string' && pack ? pack : 'My stickers',
    photoId,
    width,
    height,
  };
}

/** Every sticker in the drawer, by pack, then by name. No picture bytes: those load as they come into view. */
export function useCustomStickers(uid: string): CustomStickersState {
  const [state, setState] = useState<CustomStickersState>({ status: 'loading' });
  useEffect(
    () =>
      onSnapshot(
        customStickersCol(uid),
        (snap) => {
          const stickers = snap.docs
            .map((d) => fromData(d.id, d.data()))
            .filter((s): s is CustomSticker => s !== null)
            .sort((a, b) => naturalCompare(a.pack, b.pack) || naturalCompare(a.name, b.name));
          setState({ status: 'ready', stickers });
        },
        (err) => {
          console.error(err);
          setState({ status: 'error' });
        },
      ),
    [uid],
  );
  return state;
}

/** Stickers grouped by pack, in order. */
export function byPack(stickers: CustomSticker[]): { pack: string; stickers: CustomSticker[] }[] {
  const groups = new Map<string, CustomSticker[]>();
  for (const s of stickers) groups.set(s.pack, [...(groups.get(s.pack) ?? []), s]);
  return [...groups].map(([pack, list]) => ({ pack, stickers: list }));
}
