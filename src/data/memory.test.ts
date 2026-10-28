import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { makeSearch, sameDayInEarlierYears, snippet, toJson, type PageSummary } from './memory';

describe('sameDayInEarlierYears', () => {
  it('walks back a year at a time', () => {
    expect(sameDayInEarlierYears('2026-10-26', 3)).toEqual([
      { years: 1, day: '2025-10-26' },
      { years: 2, day: '2024-10-26' },
      { years: 3, day: '2023-10-26' },
    ]);
  });
  it('only finds 29 February in leap years', () => {
    expect(sameDayInEarlierYears('2028-02-29', 8).map((x) => x.day)).toEqual(['2024-02-29', '2020-02-29']);
  });
});

const page = (day: string, title: string, plainText: string): PageSummary => ({ day, title, plainText, mood: null, wordCount: 0, stickers: [] });

describe('search', () => {
  const pages = [
    page('2026-10-26', 'Cold pasta, warm sky', 'Finally ate lunch at ten past two.'),
    page('2026-10-20', 'Market day', 'Bought way too many apples at the farmers market.'),
    page('2026-09-01', 'Rain', 'Stayed in. Tea. Blanket.'),
  ];
  const search = makeSearch(pages);
  it('finds words in the text and in titles', () => {
    expect(search('apples').map((r) => r.item.day)).toEqual(['2026-10-20']);
    expect(search('pasta')[0].item.day).toBe('2026-10-26');
  });
  it('forgives a typo', () => {
    expect(search('blankit')[0].item.day).toBe('2026-09-01');
  });
  it('ignores one-letter queries', () => {
    expect(search('a')).toEqual([]);
  });
});

describe('snippet', () => {
  it('marks the match', () => {
    expect(snippet('Bought way too many apples today', [[20, 25]])).toEqual([
      { text: 'Bought way too many ', mark: false },
      { text: 'apples', mark: true },
      { text: ' today', mark: false },
    ]);
  });
  it('trims long text around the match', () => {
    const text = `${'word '.repeat(40)}apples${' word'.repeat(40)}`;
    const parts = snippet(text, [[200, 205]], 20);
    expect(parts.find((p) => p.mark)?.text).toBe('apples');
    expect(parts[0].text.startsWith('…')).toBe(true);
    expect(parts[parts.length - 1].text.endsWith('…')).toBe(true);
  });
  it('falls back to the opening when nothing in the text matched', () => {
    expect(snippet('Short text')).toEqual([{ text: 'Short text', mark: false }]);
  });
});

describe('toJson', () => {
  it('turns Timestamps into ISO strings, deeply', () => {
    const t = Timestamp.fromDate(new Date('2026-10-26T12:00:00Z'));
    expect(toJson({ a: t, b: [{ c: t }], d: 1, e: null })).toEqual({
      a: '2026-10-26T12:00:00.000Z',
      b: [{ c: '2026-10-26T12:00:00.000Z' }],
      d: 1,
      e: null,
    });
  });
});
