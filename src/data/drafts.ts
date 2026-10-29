import { LAYOUT, stickersFromData, type Page, type PageContent } from './pages';

// The safety net for "a quick reload never loses text": every keystroke is
// copied here synchronously, and the page is saved to Firestore a second
// after typing stops (or at once when the tab hides). On load, a draft newer
// than the saved page wins.

/** `layout` as on pages: drafts written before the redesign hold 960 px positions. */
export type Draft = PageContent & { editedAt: number; layout?: number };

const key = (uid: string, day: string) => `daybook:draft:${uid}:${day}`;

export function readDraft(uid: string, day: string): Draft | null {
  try {
    const raw = localStorage.getItem(key(uid, day));
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (typeof d.editedAt !== 'number' || !d.body) return null;
    return { ...d, stickers: stickersFromData(d.stickers, d.layout), layout: LAYOUT };
  } catch {
    return null;
  }
}

export function writeDraft(uid: string, day: string, draft: Draft): void {
  try {
    localStorage.setItem(key(uid, day), JSON.stringify({ ...draft, layout: LAYOUT }));
  } catch {
    // Storage full or disabled: Firestore's own queue still has the last save.
  }
}

export function clearDraft(uid: string, day: string): void {
  try {
    localStorage.removeItem(key(uid, day));
  } catch {
    // Nothing to clear.
  }
}

/** Which version to open: the saved page, or a draft that's newer than it. */
export function pickStart(page: Page | null, draft: Draft | null): { from: 'draft' | 'page' | 'empty'; editedAt: number } {
  if (draft && draft.editedAt > (page?.editedAt ?? 0)) return { from: 'draft', editedAt: draft.editedAt };
  if (page) return { from: 'page', editedAt: page.editedAt };
  return { from: 'empty', editedAt: 0 };
}
