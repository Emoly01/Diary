import { describe, expect, it, vi } from 'vitest';
import { countWords, emptyContent, pageFromData, plainTextOf, toLayout2, type Page, type Sticker } from './pages';
import { pickStart, readDraft, writeDraft, type Draft } from './drafts';

const doc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Morning' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Cold ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'pasta' }, { type: 'text', text: ', zero regrets.' }] },
    { type: 'bulletList', content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'tea' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'blanket' }] }] },
    ] },
    { type: 'paragraph' },
    { type: 'paragraph', content: [{ type: 'text', text: 'line one' }, { type: 'hardBreak' }, { type: 'text', text: 'line two' }] },
  ],
};

describe('plainTextOf', () => {
  it('flattens blocks into lines, marks into text', () => {
    expect(plainTextOf(doc)).toBe('Morning\nCold pasta, zero regrets.\ntea\nblanket\n\nline one\nline two');
  });
  it('is empty for an empty page', () => {
    expect(plainTextOf(emptyContent().body)).toBe('');
  });
});

describe('countWords', () => {
  it('counts words across lines', () => {
    expect(countWords(plainTextOf(doc))).toBe(11);
    expect(countWords('   ')).toBe(0);
  });
});

describe('pickStart', () => {
  const page = { ...emptyContent(), day: '2026-10-28', editedAt: 1000, createdAt: null } as Page;
  const draft = (editedAt: number): Draft => ({ ...emptyContent(), editedAt });

  it('prefers a draft newer than the saved page', () => {
    expect(pickStart(page, draft(1500)).from).toBe('draft');
  });
  it('ignores a draft the page already caught up with', () => {
    expect(pickStart(page, draft(1000)).from).toBe('page');
    expect(pickStart(page, draft(500)).from).toBe('page');
  });
  it('uses a draft when nothing is saved yet', () => {
    expect(pickStart(null, draft(1)).from).toBe('draft');
    expect(pickStart(null, null).from).toBe('empty');
  });
});

describe('layout 2: the 640 px page', () => {
  const old = [
    { id: 'a', kind: 'preset', ref: 'cat', x: 480, y: 300, rotation: 4, scale: 1.5, z: 2 },
    { id: 'b', kind: 'washi', ref: 'pink-dots', x: 96, y: 33, rotation: -3, scale: 1, z: 3, length: 300 },
  ];

  it('scales positions and size by 2/3, keeping the rest', () => {
    expect(toLayout2(old as Sticker[])).toEqual([
      { id: 'a', kind: 'preset', ref: 'cat', x: 320, y: 200, rotation: 4, scale: 1, z: 2 },
      // A tape's length is unscaled, so it stays.
      { id: 'b', kind: 'washi', ref: 'pink-dots', x: 64, y: 22, rotation: -3, scale: 0.667, z: 3, length: 300 },
    ]);
  });

  it('converts a page saved before layout 2 and marks it for saving', () => {
    const p = pageFromData('2025-10-29', { title: 'Old', stickers: old });
    expect(p.migrated).toBe(true);
    expect(p.stickers[0]).toMatchObject({ x: 320, y: 200, scale: 1 });
  });

  it('leaves a layout 2 page as it is', () => {
    const p = pageFromData('2026-10-29', { stickers: old, layout: 2 });
    expect(p.migrated).toBe(false);
    expect(p.stickers).toEqual(old);
  });

  it('drops anything that isn’t a sticker field, and never adds a length key', () => {
    const p = pageFromData('2026-10-29', { stickers: [{ ...old[0], extra: 1 }, { id: 'x' }], layout: 2 });
    expect(p.stickers).toEqual([old[0]]);
    expect('length' in p.stickers[0]).toBe(false);
  });

  it('converts a draft written before layout 2, once', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    store.set('daybook:draft:u:2026-10-29', JSON.stringify({ ...emptyContent(), stickers: old, editedAt: 5 }));
    const first = readDraft('u', '2026-10-29')!;
    expect(first.stickers[0]).toMatchObject({ x: 320, y: 200, scale: 1 });
    writeDraft('u', '2026-10-29', first);
    expect(readDraft('u', '2026-10-29')!.stickers[0]).toMatchObject({ x: 320, y: 200, scale: 1 });
    vi.unstubAllGlobals();
  });
});
