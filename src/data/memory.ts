import { useEffect, useState } from 'react';
import { collection, getDoc, getDocs, onSnapshot, Timestamp, type DocumentData } from 'firebase/firestore';
import Fuse, { type FuseResult, type RangeTuple } from 'fuse.js';
import { db } from '../firebase';
import { pageDoc, settingsDoc } from './paths';
import { isMood, type Mood } from './moods';
import { pageFromData, type Page } from './pages';

/** The same date 1, 2, 3… years back. A 29 February only looks at leap years. */
export function sameDayInEarlierYears(day: string, maxYears = 10): { years: number; day: string }[] {
  const [y, m, d] = day.split('-').map(Number);
  const out: { years: number; day: string }[] = [];
  for (let n = 1; n <= maxYears; n++) {
    const date = new Date(Date.UTC(y - n, m - 1, d));
    if (date.getUTCMonth() !== m - 1) continue; // 29 Feb rolled into March: no such day that year
    out.push({ years: n, day: `${y - n}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  return out;
}

export type Memory = { years: number; page: Page & { plainText: string } };

/** Pages written on this date in earlier years, nearest year first. One direct read per year. */
export function useOnThisDay(uid: string, day: string): { loading: boolean; memories: Memory[] } {
  const [state, setState] = useState<{ loading: boolean; memories: Memory[] }>({ loading: true, memories: [] });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, memories: [] });
    Promise.all(
      sameDayInEarlierYears(day).map(async ({ years, day: past }) => {
        try {
          const snap = await getDoc(pageDoc(uid, past));
          const data = snap.data();
          return data ? { years, page: { ...pageFromData(past, data), plainText: String(data.plainText ?? '') } } : null;
        } catch {
          return null; // offline and not cached: nothing to show for that year
        }
      }),
    ).then((found) => {
      if (!cancelled) setState({ loading: false, memories: found.filter((m): m is Memory => m !== null) });
    });
    return () => {
      cancelled = true;
    };
  }, [uid, day]);
  return state;
}

/** What the archive and search need from a page: never the body JSON's details. */
export type PageSummary = {
  day: string;
  title: string;
  plainText: string;
  mood: Mood | null;
  wordCount: number;
  stickers: Page['stickers'];
};

function summary(day: string, d: DocumentData): PageSummary {
  const p = pageFromData(day, d);
  return {
    day,
    title: p.title,
    plainText: typeof d.plainText === 'string' ? d.plainText : '',
    mood: isMood(d.mood) ? d.mood : null,
    wordCount: typeof d.wordCount === 'number' ? d.wordCount : 0,
    stickers: p.stickers,
  };
}

type AllPages = {
  loading: boolean;
  pages: PageSummary[];
  /** Showing this device's offline copy, which may lack pages opened elsewhere. */
  fromCache: boolean;
};

/** Every page, newest first. The offline copy shows at once; the server's full list follows. */
export function useAllPages(uid: string): AllPages {
  const [state, setState] = useState<AllPages>({ loading: true, pages: [], fromCache: true });
  useEffect(
    () =>
      onSnapshot(
        collection(db, 'users', uid, 'pages'),
        { includeMetadataChanges: true },
        (snap) => {
          const pages = snap.docs.map((d) => summary(d.id, d.data()));
          pages.sort((a, b) => (a.day < b.day ? 1 : -1));
          setState({ loading: false, pages, fromCache: snap.metadata.fromCache });
        },
        () => setState({ loading: false, pages: [], fromCache: true }),
      ),
    [uid],
  );
  return state;
}

/** Fuzzy search over titles and text. Titles count double. */
export function makeSearch(pages: PageSummary[]) {
  const fuse = new Fuse(pages, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'plainText', weight: 1 },
    ],
    includeMatches: true,
    ignoreLocation: true,
    threshold: 0.3,
    minMatchCharLength: 2,
  });
  return (q: string): FuseResult<PageSummary>[] => (q.trim().length < 2 ? [] : fuse.search(q.trim(), { limit: 50 }));
}

export type SnippetPart = { text: string; mark: boolean };

/** A short piece of `text` around its longest match, split into marked and plain parts. */
export function snippet(text: string, ranges: readonly RangeTuple[] = [], radius = 70): SnippetPart[] {
  if (!text) return [];
  if (ranges.length === 0) return [{ text: text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text, mark: false }];
  const [s, e] = [...ranges].sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];
  const from = Math.max(0, s - radius);
  const to = Math.min(text.length, e + 1 + radius);
  const parts: SnippetPart[] = [];
  let at = from;
  for (const [rs, re] of [...ranges].sort((a, b) => a[0] - b[0])) {
    if (re < from || rs >= to || rs < at) continue;
    if (rs > at) parts.push({ text: text.slice(at, rs), mark: false });
    parts.push({ text: text.slice(rs, re + 1), mark: true });
    at = re + 1;
  }
  if (at < to) parts.push({ text: text.slice(at, to), mark: false });
  if (from > 0) parts[0] = { ...parts[0], text: `…${parts[0].text.replace(/^\S*\s/, '')}` };
  if (to < text.length) parts[parts.length - 1] = { ...parts[parts.length - 1], text: `${parts[parts.length - 1].text}…` };
  return parts.map((p) => ({ ...p, text: p.text.replace(/\n+/g, ' ') }));
}

/** Firestore values as plain JSON: Timestamps become ISO strings. */
export function toJson(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(toJson);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toJson(x)]));
  return v;
}

export type ExportFile = {
  app: 'Daybook';
  version: 1;
  exportedAt: string;
  /** False if some of it came from this device's offline copy, not the server. */
  fromServer: boolean;
  settings: unknown;
  pages: unknown[];
  scraps: unknown[];
  photos: unknown[];
  customStickers: unknown[];
};

/** Everything in the book: settings, every page, scrap and photo. */
export async function exportBook(uid: string): Promise<ExportFile> {
  const col = (name: string) => getDocs(collection(db, 'users', uid, name));
  const [settings, pages, scraps, photos, custom] = await Promise.all([
    getDoc(settingsDoc(uid)),
    col('pages'),
    col('scraps'),
    col('photos'),
    col('customStickers'),
  ]);
  const rows = (s: Awaited<ReturnType<typeof col>>) => s.docs.map((d) => ({ id: d.id, ...(toJson(d.data()) as object) }));
  return {
    app: 'Daybook',
    version: 1,
    exportedAt: new Date().toISOString(),
    fromServer: ![settings, pages, scraps, photos, custom].some((s) => s.metadata.fromCache),
    settings: toJson(settings.data() ?? null),
    pages: rows(pages),
    scraps: rows(scraps),
    photos: rows(photos),
    customStickers: rows(custom),
  };
}
