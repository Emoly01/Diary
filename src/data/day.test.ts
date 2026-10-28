import { describe, expect, it } from 'vitest';
import { bookDay, formatMoment, formatStamp, parseDayStart } from './day';

const BERLIN = 'Europe/Berlin';
// Build a Date from Berlin wall-clock time (CET = UTC+1, CEST = UTC+2).
const berlin = (iso: string, offset: '+01:00' | '+02:00') => new Date(`${iso}${offset}`);

describe('bookDay', () => {
  it('puts 02:30 on the previous day', () => {
    expect(bookDay(berlin('2026-10-27T02:30:00', '+01:00'), '04:00', BERLIN)).toBe('2026-10-26');
  });

  it('starts the new day at exactly 04:00', () => {
    expect(bookDay(berlin('2026-10-27T03:59:00', '+01:00'), '04:00', BERLIN)).toBe('2026-10-26');
    expect(bookDay(berlin('2026-10-27T04:00:00', '+01:00'), '04:00', BERLIN)).toBe('2026-10-27');
  });

  it('keeps late evening on the same day', () => {
    expect(bookDay(berlin('2026-10-27T23:59:00', '+01:00'), '04:00', BERLIN)).toBe('2026-10-27');
  });

  it('uses the owner timezone, not UTC', () => {
    // 23:30 UTC on the 27th is 00:30 on the 28th in Berlin: still the 27th's book day.
    expect(bookDay(new Date('2026-10-27T23:30:00Z'), '04:00', BERLIN)).toBe('2026-10-27');
    // 03:30 UTC is 04:30 in Berlin: the 28th has started.
    expect(bookDay(new Date('2026-10-28T03:30:00Z'), '04:00', BERLIN)).toBe('2026-10-28');
    expect(bookDay(new Date('2026-10-28T03:30:00Z'), '04:00', 'UTC')).toBe('2026-10-27');
  });

  it('steps back across month and year boundaries', () => {
    expect(bookDay(berlin('2027-01-01T01:00:00', '+01:00'), '04:00', BERLIN)).toBe('2026-12-31');
    expect(bookDay(berlin('2026-03-01T03:00:00', '+01:00'), '04:00', BERLIN)).toBe('2026-02-28');
    expect(bookDay(berlin('2028-03-01T03:00:00', '+01:00'), '04:00', BERLIN)).toBe('2028-02-29');
  });

  it('survives the DST change night', () => {
    // 25 Oct 2026: clocks go from 03:00 CEST back to 02:00 CET.
    expect(bookDay(berlin('2026-10-25T02:30:00', '+02:00'), '04:00', BERLIN)).toBe('2026-10-24');
    expect(bookDay(berlin('2026-10-25T02:30:00', '+01:00'), '04:00', BERLIN)).toBe('2026-10-24');
    expect(bookDay(berlin('2026-10-25T04:00:00', '+01:00'), '04:00', BERLIN)).toBe('2026-10-25');
  });

  it('honours a custom day start', () => {
    const at = berlin('2026-10-27T00:30:00', '+01:00');
    expect(bookDay(at, '00:00', BERLIN)).toBe('2026-10-27');
    expect(bookDay(at, '01:00', BERLIN)).toBe('2026-10-26');
  });

  it('falls back to the device timezone for a bad one', () => {
    expect(() => bookDay(new Date(), '04:00', 'Not/AZone')).not.toThrow();
  });
});

describe('parseDayStart', () => {
  it('reads HH:MM and falls back to 04:00', () => {
    expect(parseDayStart('04:00')).toBe(240);
    expect(parseDayStart('6:30')).toBe(390);
    expect(parseDayStart('25:00')).toBe(240);
    expect(parseDayStart('nonsense')).toBe(240);
  });
});

describe('formatting', () => {
  const at = berlin('2026-10-26T16:45:00', '+01:00');
  it('formats like the boards', () => {
    expect(formatMoment(at, BERLIN)).toBe('Mon 26 Oct · 16:45');
    expect(formatStamp(at, BERLIN)).toBe('Mon · 16:45');
  });
});

describe('formatDayLong', () => {
  it('reads like the page header', async () => {
    const { formatDayLong, isBookDay } = await import('./day');
    expect(formatDayLong('2026-10-26')).toBe('Monday · 26 October 2026');
    expect(isBookDay('2026-10-26')).toBe(true);
    expect(isBookDay('2026-13-40')).toBe(false);
    expect(isBookDay('yesterday')).toBe(false);
  });
});
