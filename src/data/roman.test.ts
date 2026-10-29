import { describe, expect, it } from 'vitest';
import { bookLine, countWord, dateLine, dayOfYear, folio, isoWeek, ordinalWord, roman, runningHead, stampDate, weekHead } from './roman';

describe('roman', () => {
  it('writes lower-case numerals', () => {
    expect(roman(1)).toBe('i');
    expect(roman(4)).toBe('iv');
    expect(roman(10)).toBe('x');
    expect(roman(44)).toBe('xliv');
    expect(roman(299)).toBe('ccxcix');
    expect(roman(366)).toBe('ccclxvi');
    expect(roman(2026)).toBe('mmxxvi');
    expect(roman(0)).toBe('0');
  });

  it('spells counts up to twelve', () => {
    expect(countWord(0)).toBe('zero');
    expect(countWord(6)).toBe('six');
    expect(countWord(12)).toBe('twelve');
    expect(countWord(13)).toBe('13');
  });

  it('spells days of the month as ordinals', () => {
    expect(ordinalWord(1)).toBe('first');
    expect(ordinalWord(12)).toBe('twelfth');
    expect(ordinalWord(20)).toBe('twentieth');
    expect(ordinalWord(26)).toBe('twenty-sixth');
    expect(ordinalWord(30)).toBe('thirtieth');
    expect(ordinalWord(31)).toBe('thirty-first');
  });
});

describe('book dates', () => {
  it('numbers ISO weeks, across the year boundary too', () => {
    expect(isoWeek('2026-10-26')).toBe(44);
    expect(isoWeek('2026-01-01')).toBe(1);
    expect(isoWeek('2027-01-01')).toBe(53);
    expect(isoWeek('2024-12-30')).toBe(1);
    expect(weekHead('2026-10-26')).toBe('Week xliv');
  });

  it('numbers folios by the day of the year', () => {
    expect(dayOfYear('2026-01-01')).toBe(1);
    expect(dayOfYear('2026-10-26')).toBe(299);
    expect(dayOfYear('2024-12-31')).toBe(366);
    expect(folio('2026-10-26')).toBe('ccxcix');
  });

  it('writes the running head, the stamp date and the date line', () => {
    expect(runningHead('2026-10-26')).toBe('Monday · 26 · x · 2026');
    expect(stampDate('2025-10-26')).toBe('26 x 2025');
    expect(dateLine('2026-10-26')).toBe('Monday, the twenty-sixth of October');
    expect(dateLine('2026-11-01')).toBe('Sunday, the first of November');
  });

  it('counts the book’s years from when it was started', () => {
    expect(bookLine('2026-10-26', new Date('2026-03-01'))).toBe('Book one · MMXXVI');
    expect(bookLine('2027-10-26', new Date('2026-03-01'))).toBe('Book two · MMXXVII');
    expect(bookLine('2026-10-26', null)).toBe('Book one · MMXXVI');
  });
});
