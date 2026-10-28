// A book day is YYYY-MM-DD in the owner's timezone, but it starts at
// `dayStartsAt` (default 04:00), not midnight: a scrap caught at 02:30
// belongs to the day just lived.

export const DEFAULT_DAY_STARTS_AT = '04:00';

export function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number };

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function zonedParts(date: Date, timezone: string): ZonedParts {
  let fmt = partsFormatters.get(timezone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    partsFormatters.set(timezone, fmt);
  }
  const out: Record<string, number> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  return { year: out.year, month: out.month, day: out.day, hour: out.hour, minute: out.minute };
}

/** Minutes after midnight for "HH:MM"; falls back to 04:00 for anything else. */
export function parseDayStart(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return 4 * 60;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return 4 * 60;
  return h * 60 + min;
}

/** A timezone the runtime understands, else the device's. */
export function safeTimezone(timezone: string | undefined): string {
  if (!timezone) return deviceTimezone();
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone });
    return timezone;
  } catch {
    return deviceTimezone();
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The book day `date` belongs to. */
export function bookDay(date: Date, dayStartsAt: string, timezone: string): string {
  const p = zonedParts(date, safeTimezone(timezone));
  let { year, month, day } = p;
  if (p.hour * 60 + p.minute < parseDayStart(dayStartsAt)) {
    // Calendar arithmetic in UTC: no DST surprises when stepping back a day.
    const prev = new Date(Date.UTC(year, month - 1, day - 1));
    year = prev.getUTCFullYear();
    month = prev.getUTCMonth() + 1;
    day = prev.getUTCDate();
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

function format(date: Date, timezone: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: safeTimezone(timezone), ...opts }).format(date);
}

/** "16:45" */
export function formatClock(date: Date, timezone: string): string {
  return format(date, timezone, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

/** "Mon 26 Oct · 16:45" */
export function formatMoment(date: Date, timezone: string): string {
  const d = format(date, timezone, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${d.replace(',', '')} · ${formatClock(date, timezone)}`;
}

/** "Mon · 14:10" */
export function formatStamp(date: Date, timezone: string): string {
  return `${format(date, timezone, { weekday: 'short' })} · ${formatClock(date, timezone)}`;
}

/** "Wednesday · 28 October 2026" for a YYYY-MM-DD book day. */
export function formatDayLong(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long' }).format(date);
  const rest = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return `${weekday} · ${rest}`;
}

export const isBookDay = (s: string | undefined): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
