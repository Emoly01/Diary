import { describe, expect, it } from 'vitest';
import { DEFAULT_RECENT, recentList } from './recent';

describe('recent stickers', () => {
  it('starts with the board’s five', () => {
    expect(recentList(null)).toEqual(['moth', 'black-cat', 'fern', 'teacup', 'moon-star']);
  });
  it('puts the newest first, keeps five, and drops repeats and unknown names', () => {
    expect(recentList(['candle', 'nope', 'moth', 'candle'])).toEqual(['candle', 'moth', 'black-cat', 'fern', 'teacup']);
    expect(recentList(['a', 1, {}])).toEqual(DEFAULT_RECENT);
  });
});
