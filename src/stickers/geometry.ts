import { PAGE_WIDTH, type Sticker, type StickerKind } from '../data/pages';
import { presetFor } from './presets';
import { WASHI_HEIGHT, WASHI_LENGTH } from './washi';

export const MIN_SCALE = 0.3;
export const MAX_SCALE = 4;

/** A washi tape's unscaled length: from a fingertip of tape to corner to corner (twice the page). */
export const MIN_WASHI_LENGTH = 60;
export const MAX_WASHI_LENGTH = PAGE_WIDTH * 2;

export const clampLength = (n: number) => Math.round(Math.min(MAX_WASHI_LENGTH, Math.max(MIN_WASHI_LENGTH, n)));

/** The unscaled box of a sticker, in logical px. */
export function baseSize(s: { kind: StickerKind; ref: string; length?: number }): { w: number; h: number } {
  switch (s.kind) {
    case 'preset': {
      const p = presetFor(s.ref);
      return { w: p.w, h: p.h };
    }
    case 'washi':
      return { w: s.length ?? WASHI_LENGTH, h: WASHI_HEIGHT };
    default:
      // Polaroid: 10 px frame, a 5:4 photo, a deeper bottom edge.
      return { w: 230, h: 212 };
  }
}

export const clampScale = (n: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));

/** Keep at least half of a sticker on the page sideways, and below its top edge. */
export function clampPosition(s: Sticker): Sticker {
  const { w, h } = baseSize(s);
  const sw = w * s.scale;
  const sh = h * s.scale;
  const x = Math.min(PAGE_WIDTH - sw / 2, Math.max(-sw / 2, s.x));
  const y = Math.min(4000, Math.max(-sh / 2, s.y));
  return { ...s, x: Math.round(x), y: Math.round(y) };
}

/**
 * A tape at a new unscaled `length`, with one end held where it is. The
 * box turns about its centre, so the centre moves along the tape's own axis
 * and `x`/`y` follow it. `anchor` is the end that stays put: "start" is the
 * left end at 0°.
 */
export function resizeWashi(s: Sticker, length: number, anchor: 'start' | 'end'): Sticker {
  const { w, h } = baseSize(s);
  const next = clampLength(length);
  const rad = (s.rotation * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const half = (w * s.scale) / 2;
  const cx = s.x + half;
  const cy = s.y + (h * s.scale) / 2;
  // The end that stays, then the new centre half the new width away from it.
  const sign = anchor === 'start' ? -1 : 1;
  const ax = cx + sign * ux * half;
  const ay = cy + sign * uy * half;
  const nextHalf = (next * s.scale) / 2;
  const ncx = ax - sign * ux * nextHalf;
  const ncy = ay - sign * uy * nextHalf;
  return { ...s, length: next, x: ncx - nextHalf, y: ncy - (h * s.scale) / 2 };
}

/**
 * Stretching from one end: the pointer moved `dx`, `dy` logical px since the
 * drag began on `from`. Only the part along the tape counts.
 */
export function stretchWashi(from: Sticker, end: 'start' | 'end', dx: number, dy: number): Sticker {
  const rad = (from.rotation * Math.PI) / 180;
  const along = dx * Math.cos(rad) + dy * Math.sin(rad);
  const grow = (end === 'end' ? along : -along) / from.scale;
  return resizeWashi(from, baseSize(from).w + grow, end === 'end' ? 'start' : 'end');
}

/** Normalise to (-180, 180]. */
export function normaliseAngle(deg: number): number {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return Math.round(a * 10) / 10;
}

export const topZ = (stickers: Sticker[]) => stickers.reduce((m, s) => Math.max(m, s.z), 0) + 1;
export const bottomZ = (stickers: Sticker[]) => stickers.reduce((m, s) => Math.min(m, s.z), 1) - 1;

/** How far down the page a sticker reaches. */
export const stickerBottom = (s: Sticker) => s.y + baseSize(s).h * s.scale;

const CASCADE = 36;

/**
 * A new sticker centred on (cx, cy), with a slight tilt, on top of the rest.
 * If another sticker already sits there, it steps down and right so it
 * doesn't hide that one.
 */
export function newSticker(
  kind: StickerKind,
  ref: string,
  center: { x: number; y: number },
  stickers: Sticker[],
  random = Math.random,
): Sticker {
  const { w, h } = baseSize({ kind, ref });
  const tilt = kind === 'washi' ? (random() * 2 - 1) * 5 : (random() * 2 - 1) * 8;
  // Compare centres, so stickers of different sizes count as overlapping too.
  const mid = (s: Sticker) => ({ x: s.x + (baseSize(s).w * s.scale) / 2, y: s.y + (baseSize(s).h * s.scale) / 2 });
  let { x: cx, y: cy } = center;
  for (let i = 0; i < 8 && stickers.some((s) => Math.hypot(mid(s).x - cx, mid(s).y - cy) < CASCADE); i++) {
    cx += CASCADE;
    cy += CASCADE;
  }
  return clampPosition({
    id: crypto.randomUUID(),
    kind,
    ref,
    x: cx - w / 2 + (random() * 2 - 1) * 8,
    y: cy - h / 2 + (random() * 2 - 1) * 8,
    rotation: normaliseAngle(tilt),
    scale: 1,
    z: topZ(stickers),
  });
}
