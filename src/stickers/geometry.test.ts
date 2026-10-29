import { describe, expect, it } from 'vitest';
import type { Sticker } from '../data/pages';
import { baseSize, bottomZ, clampPosition, clampScale, newSticker, normaliseAngle, stickerBottom, topZ } from './geometry';

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
    expect(clampPosition(s({ x: 2000 }))).toMatchObject({ x: 905 });
    expect(clampPosition(s({ x: 2000, scale: 2 }))).toMatchObject({ x: 850 });
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
