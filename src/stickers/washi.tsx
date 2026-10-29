// Washi tape from the cabinet board (design/redesign/StickerCabinet.dc.html):
// ten SVG patterns (in <SvgDefs>) filling a strip with torn ends.

type Washi = { caption: string; label: string; opacity: number; ends: 'a' | 'b' };

export const WASHI: Record<string, Washi> = {
  'ember-stripe': { caption: 'ember stripe', label: 'Ember stripe washi tape', opacity: 0.85, ends: 'a' },
  'night-sky': { caption: 'night sky', label: 'Night sky washi tape with gold stars and moons', opacity: 0.92, ends: 'b' },
  'fern-print': { caption: 'fern print', label: 'Fern print washi tape', opacity: 0.88, ends: 'a' },
  'moonstone-moths': { caption: 'moonstone moths', label: 'Moonstone moths washi tape', opacity: 0.88, ends: 'b' },
  'moss-gingham': { caption: 'moss gingham', label: 'Moss gingham washi tape', opacity: 0.85, ends: 'a' },
  'oxblood-gold': { caption: 'oxblood & gold', label: 'Oxblood with gold dots washi tape', opacity: 0.9, ends: 'b' },
  manuscript: { caption: 'manuscript', label: 'Manuscript script washi tape', opacity: 0.9, ends: 'a' },
  'moon-phases': { caption: 'moon phases', label: 'Moon phases washi tape', opacity: 0.92, ends: 'b' },
  'gilded-vine': { caption: 'gilded vine', label: 'Gilded vine washi tape', opacity: 0.92, ends: 'a' },
  mulberry: { caption: 'mulberry paper', label: 'Plain mulberry paper washi tape', opacity: 0.92, ends: 'b' },
};

export const WASHI_NAMES = Object.keys(WASHI);

/** v1 tape names on pages saved before the redesign. */
export const WASHI_ALIASES: Record<string, string> = {
  'pink-dots': 'oxblood-gold',
  'lilac-dots': 'night-sky',
  'peach-dots': 'ember-stripe',
  'mint-gingham': 'moss-gingham',
  'butter-gingham': 'mulberry',
  'pink-gingham': 'manuscript',
};

export function resolveWashi(ref: string): string {
  if (WASHI[ref]) return ref;
  const alias = WASHI_ALIASES[ref];
  return alias && WASHI[alias] ? alias : 'ember-stripe';
}

/** A tape's unscaled size in logical px. `length` stretches it; the height never changes. */
export const WASHI_HEIGHT = 38;
export const WASHI_LENGTH = 170;

// The board draws every strip at 320 × 44. Its two outlines, as [x, y] corners:
// the left torn end, then the right one (x measured from the strip's right end).
const BOARD_W = 320;
const BOARD_H = 44;
const OUTLINES: Record<Washi['ends'], { left: [number, number][]; right: [number, number][] }> = {
  // M5 2L315 0L311 7L318 14L312 22L319 30L313 37L317 44L2 44L6 37L0 30L5 22L1 14L6 7Z
  a: {
    left: [[2, 44], [6, 37], [0, 30], [5, 22], [1, 14], [6, 7], [5, 2]],
    right: [[315, 0], [311, 7], [318, 14], [312, 22], [319, 30], [313, 37], [317, 44]],
  },
  // M3 0L317 2L312 9L319 16L313 24L318 31L312 38L316 44L4 44L0 38L6 31L1 23L6 15L0 8Z
  b: {
    left: [[4, 44], [0, 38], [6, 31], [1, 23], [6, 15], [0, 8], [3, 0]],
    right: [[317, 2], [312, 9], [319, 16], [313, 24], [318, 31], [312, 38], [316, 44]],
  },
};

/**
 * The strip's outline for a drawn width `w` (in board units): the board's
 * torn ends at their own size, straight edges in between. The board's
 * strips are stretched with preserveAspectRatio="none"; building the path
 * instead keeps the pattern from smearing when the tape gets longer.
 */
export function washiPath(ends: Washi['ends'], w: number): string {
  const { left, right } = OUTLINES[ends];
  const shift = w - BOARD_W;
  const pts = [left[left.length - 1], ...right.map(([x, y]) => [x + shift, y]), ...left.slice(0, -1)];
  return `M${pts.map(([x, y]) => `${+x.toFixed(2)} ${y}`).join('L')}Z`;
}

/** A strip of tape filling its box. `length` is the tape's unscaled length in logical px. */
export function WashiStrip({ name, length = WASHI_LENGTH }: { name: string; length?: number }) {
  const id = resolveWashi(name);
  const t = WASHI[id];
  // Board units: the strip is always 44 high, so a longer tape gets more pattern, not wider pattern.
  const w = (length * BOARD_H) / WASHI_HEIGHT;
  return (
    <svg
      viewBox={`0 0 ${+w.toFixed(2)} ${BOARD_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="washi-strip"
      overflow="visible"
    >
      <path d={washiPath(t.ends, w)} fill={`url(#db-washi-${id})`} opacity={t.opacity} />
    </svg>
  );
}
