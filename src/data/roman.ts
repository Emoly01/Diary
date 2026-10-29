// The book's way of writing dates and numbers: Roman numerals for weeks,
// folios and years, words for small counts and the date line.

const NUMERALS: [number, string][] = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'],
  [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

/** Lower-case Roman numerals: 44 → "xliv". Anything below 1 stays a digit. */
export function roman(n: number): string {
  if (!Number.isInteger(n) || n < 1) return String(n);
  let out = '';
  let rest = n;
  for (const [value, letters] of NUMERALS) {
    while (rest >= value) {
      out += letters;
      rest -= value;
    }
  }
  return out;
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** "six" up to twelve, then digits: "six scraps, waiting", "14 scraps, waiting". */
export const countWord = (n: number) => WORDS[n] ?? String(n);

const ORDINALS = [
  '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth',
  'nineteenth', 'twentieth',
];
const TENS: Record<number, string> = { 2: 'twenty', 3: 'thirty' };

/** 26 → "twenty-sixth", for days of the month. */
export function ordinalWord(n: number): string {
  if (n <= 20) return ORDINALS[n] ?? String(n);
  if (n % 10 === 0) return n === 30 ? 'thirtieth' : 'twentieth';
  return `${TENS[Math.floor(n / 10)]}-${ORDINALS[n % 10]}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parts = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return { y, m, d, date: new Date(Date.UTC(y, m - 1, d)) };
};

export const monthName = (day: string) => MONTHS[parts(day).m - 1];

/** ISO week number of a YYYY-MM-DD day. */
export function isoWeek(day: string): number {
  const { date } = parts(day);
  // The Thursday of this week decides which year the week belongs to.
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const jan1 = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  return Math.floor((thursday.getTime() - jan1) / 86_400_000 / 7) + 1;
}

/** 1 for 1 January. */
export function dayOfYear(day: string): number {
  const { y, date } = parts(day);
  return Math.round((date.getTime() - Date.UTC(y, 0, 1)) / 86_400_000) + 1;
}

/** "Week xliv" */
export const weekHead = (day: string) => `Week ${roman(isoWeek(day))}`;

/** "Folio ccxcix": the day of the year, as the page number. */
export const folio = (day: string) => roman(dayOfYear(day));

/** "Monday · 26 · x · 2026" */
export function runningHead(day: string): string {
  const { y, m, d, date } = parts(day);
  return `${WEEKDAYS[date.getUTCDay()]} · ${d} · ${roman(m)} · ${y}`;
}

/** "26 x 2025", for seals and stamps. */
export function stampDate(day: string): string {
  const { y, m, d } = parts(day);
  return `${d} ${roman(m)} ${y}`;
}

/** "Monday, the twenty-sixth of October" */
export function dateLine(day: string): string {
  const { m, d, date } = parts(day);
  return `${WEEKDAYS[date.getUTCDay()]}, the ${ordinalWord(d)} of ${MONTHS[m - 1]}`;
}

/** "Book one · MMXXVI": which year of the book this is, and the year. */
export function bookLine(day: string, startedAt: Date | null): string {
  const { y } = parts(day);
  const n = startedAt ? Math.max(1, y - startedAt.getUTCFullYear() + 1) : 1;
  return `Book ${countWord(n)} · ${roman(y).toUpperCase()}`;
}
