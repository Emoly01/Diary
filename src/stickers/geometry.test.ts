import { describe, expect, it } from 'vitest';
import type { Sticker } from '../data/pages';
import {
  baseSize,
  bottomZ,
  clampLength,
  clampPosition,
  clampScale,
  newSticker,
  normaliseAngle,
  resizeWashi,
  stickerBottom,
  stretchWashi,
  topZ,
} from './geometry';

const s = (o: Partial<Sticker>): Sticker => ({ id: 'a', kind: 'preset', ref: 'star', x: 0, y: 0, rotation: 0, scale: 1, z: 1, ...o });

describe('sticker geometry', () => {
  it('knows each kind’s box', () => {
    expect(baseSize({ kind: 'preset', ref: 'word-good-day' })).toEqual({ w: 190, h: 50 });
    expect(baseSize({ kind: 'preset', ref: 'moon-3' })).toEqual({ w: 72, h: 72 });
    // Old names take their new art's size.
    expect(baseSize({ kind: 'preset', ref: 'rainbow' })).toEqual({ w: 110, h: 110 });
    expect(baseSize({ kind: 'washi', ref: 'pink-dots' })).toEqual({ w: 170, h: 38 });
    expect(baseSize({ kind: 'photo', ref: 'p1' })).toEqual({ w: 230, h: 212 });
    expect(baseSize({ kind: 'preset', ref: 'unknown' })).toEqual({ w: 110, h: 110 });
  });

  it('keeps stickers at least half on the page', () => {
    expect(clampPosition(s({ x: -500, y: -500 }))).toMatchObject({ x: -55, y: -55 });
    expect(clampPosition(s({ x: 2000 }))).toMatchObject({ x: 585 });
    expect(clampPosition(s({ x: 2000, scale: 2 }))).toMatchObject({ x: 530 });
    expect(clampPosition(s({ x: 100.4, y: 200.6 }))).toMatchObject({ x: 100, y: 201 });
  });

  it('bounds scale and angle', () => {
    expect(clampScale(0.01)).toBe(0.3);
    expect(clampScale(9)).toBe(4);
    expect(normaliseAngle(190)).toBe(-170);
    expect(normaliseAngle(-190)).toBe(170);
    expect(normaliseAngle(720 + 12.34)).toBe(12.3);
  });

  it('stacks', () => {
    const list = [s({ z: 3 }), s({ z: -2 }), s({ z: 7 })];
    expect(topZ(list)).toBe(8);
    expect(bottomZ(list)).toBe(-3);
    expect(topZ([])).toBe(1);
  });

  it('measures how far down a sticker reaches', () => {
    expect(stickerBottom(s({ y: 100, scale: 2 }))).toBe(320);
  });

  it('places a new sticker centred, tilted a little, on top', () => {
    const n = newSticker('preset', 'star', { x: 480, y: 300 }, [s({ z: 4 })], () => 0.5);
    expect(n).toMatchObject({ x: 425, y: 245, rotation: 0, scale: 1, z: 5, kind: 'preset', ref: 'star' });
    const tape = newSticker('washi', 'pink-dots', { x: 480, y: 300 }, [], () => 1);
    expect(Math.abs(tape.rotation)).toBeLessThanOrEqual(5);
  });

  it('never gives a new tape a length key', () => {
    expect('length' in newSticker('washi', 'night-sky', { x: 320, y: 300 }, [])).toBe(false);
  });

  it('steps a new sticker off one already in the middle', () => {
    const first = newSticker('preset', 'star', { x: 480, y: 300 }, [], () => 0.5);
    const second = newSticker('preset', 'heart', { x: 480, y: 300 }, [first], () => 0.5);
    const third = newSticker('photo', 'p1', { x: 480, y: 300 }, [first, second], () => 0.5);
    const mid = (s: Sticker) => [s.x + (baseSize(s).w * s.scale) / 2, s.y + (baseSize(s).h * s.scale) / 2];
    expect(mid(first)).toEqual([480, 300]);
    expect(mid(second)).toEqual([516, 336]);
    expect(mid(third)).toEqual([552, 372]);
  });
});

describe('stretching washi', () => {
  const tape = (o: Partial<Sticker>): Sticker => s({ kind: 'washi', ref: 'night-sky', x: 100, y: 200, ...o });
  // Where the middle of each end of the tape is on the page, after rotation about its centre.
  const ends = (t: Sticker) => {
    const { w, h } = baseSize(t);
    const half = (w * t.scale) / 2;
    const cx = t.x + half;
    const cy = t.y + (h * t.scale) / 2;
    const r = (t.rotation * Math.PI) / 180;
    return {
      start: [cx - Math.cos(r) * half, cy - Math.sin(r) * half],
      end: [cx + Math.cos(r) * half, cy + Math.sin(r) * half],
    };
  };
  const near = (a: number[], b: number[]) => {
    expect(a[0]).toBeCloseTo(b[0], 6);
    expect(a[1]).toBeCloseTo(b[1], 6);
  };

  it('uses the stretched length for the box, the default without one', () => {
    expect(baseSize({ kind: 'washi', ref: 'night-sky' })).toEqual({ w: 170, h: 38 });
    expect(baseSize({ kind: 'washi', ref: 'night-sky', length: 400 })).toEqual({ w: 400, h: 38 });
    expect(stickerBottom(tape({ y: 0, length: 400, scale: 2 }))).toBe(76);
  });

  it('clamps the length between a fingertip and twice the page', () => {
    expect(clampLength(10)).toBe(60);
    expect(clampLength(5000)).toBe(1280);
    expect(clampLength(250.4)).toBe(250);
  });

  it.each([0, 90, 30, -135])('keeps the other end where it was at %i°', (rotation) => {
    const t = tape({ rotation, scale: 1.5 });
    const before = ends(t);
    const longer = resizeWashi(t, 320, 'start');
    expect(longer.length).toBe(320);
    near(ends(longer).start, before.start);
    const shorter = resizeWashi(t, 90, 'end');
    near(ends(shorter).end, before.end);
    // Thickness never changes.
    expect(baseSize(longer).h * longer.scale).toBe(baseSize(t).h * t.scale);
  });

  it('stretches by how far the pointer moves along the tape, not across it', () => {
    const flat = tape({});
    expect(stretchWashi(flat, 'end', 50, 0).length).toBe(220);
    expect(stretchWashi(flat, 'end', 0, 80).length).toBe(170);
    expect(stretchWashi(flat, 'start', -50, 0).length).toBe(220);
    // Turned 90°: along the tape is down the page.
    expect(stretchWashi(tape({ rotation: 90 }), 'end', 0, 50).length).toBe(220);
    // At double scale the same pointer move adds half as much unscaled tape.
    expect(stretchWashi(tape({ scale: 2 }), 'end', 50, 0).length).toBe(195);
    near(ends(stretchWashi(flat, 'end', 50, 0)).start, ends(flat).start);
  });
});
