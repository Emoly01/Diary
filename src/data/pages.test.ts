import { describe, expect, it } from 'vitest';
import { countWords, emptyContent, plainTextOf, type Page } from './pages';
import { pickStart, type Draft } from './drafts';

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
