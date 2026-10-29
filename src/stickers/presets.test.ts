import { describe, expect, it } from 'vitest';
import { GROUPS, PRESET_ALIASES, PRESETS, presetsIn, resolvePreset } from './presets';
import { resolveWashi, WASHI, WASHI_ALIASES, WASHI_NAMES, washiPath } from './washi';

// Every caption on the cabinet board (design/redesign/StickerCabinet.dc.html), by its id.
const BOARD = {
  grimoire: {
    moth: 'moth',
    'moon-star': 'moon & star',
    candle: 'candle',
    crystals: 'crystals',
    potion: 'potion',
    'tarot-moon': 'tarot · the moon',
    mushroom: 'mushroom',
    'crow-feather': 'crow feather',
    d20: 'd20 · nat 20',
    'old-key': 'old key',
  },
  herbarium: {
    fern: 'fern',
    lavender: 'lavender',
    'pressed-rose': 'pressed rose',
    ginkgo: 'ginkgo',
    'oak-leaf': 'oak leaf',
    rowan: 'rowan berries',
  },
  hearth: {
    teacup: 'teacup',
    'black-cat': 'black cat',
    'sleeping-tabby': 'sleeping tabby',
    'yarn-hook': 'yarn & hook',
    'glazed-vase': 'glazed vase',
    'heart-anatomical': 'heart, anatomical',
    rain: 'rain',
    sun: 'sun',
    'sealed-letter': 'sealed letter',
    star: 'star',
    heart: 'heart',
  },
  words: {
    'word-good-day': 'a good day',
    'word-rough-one': 'rough one',
    'word-small-win': 'small win',
    'word-remember-this': 'remember this',
    'word-night-shift': 'night shift',
    'word-session-night': 'session night',
    'word-tea-blanket': 'tea & blanket',
    'stamp-survived': 'survived',
  },
  moods: { 'moon-1': 'rough', 'moon-2': 'meh', 'moon-3': 'okay', 'moon-4': 'good', 'moon-5': 'great' },
} as const;

const WASHI_BOARD = {
  'ember-stripe': 'ember stripe',
  'night-sky': 'night sky',
  'fern-print': 'fern print',
  'moonstone-moths': 'moonstone moths',
  'moss-gingham': 'moss gingham',
  'oxblood-gold': 'oxblood & gold',
  manuscript: 'manuscript',
  'moon-phases': 'moon phases',
  'gilded-vine': 'gilded vine',
  mulberry: 'mulberry paper',
};

describe('presets', () => {
  it('has every sticker, label and moon on the board, in board order, under its caption', () => {
    for (const { id } of GROUPS) {
      const board = BOARD[id];
      expect(presetsIn(id)).toEqual(Object.keys(board));
      for (const [name, caption] of Object.entries(board)) expect(PRESETS[name].caption).toBe(caption);
    }
    expect(Object.keys(PRESETS)).toHaveLength(27 + 8 + 5);
  });

  it('shows old pages’ stickers as their new art', () => {
    expect(PRESET_ALIASES).toEqual({ cat: 'black-cat', moon: 'moon-star', yay: 'word-good-day', sparkle: 'star', rainbow: 'sun' });
    for (const old of ['cat', 'moon', 'yay', 'sparkle', 'rainbow']) expect(PRESETS[resolvePreset(old)]).toBeDefined();
    for (const kept of ['teacup', 'star', 'heart']) expect(resolvePreset(kept)).toBe(kept);
  });

  it('falls back to the star', () => {
    expect(resolvePreset('unicorn')).toBe('star');
    expect(resolvePreset('')).toBe('star');
  });
});

describe('washi', () => {
  it('has the ten board tapes under their captions', () => {
    expect(WASHI_NAMES).toEqual(Object.keys(WASHI_BOARD));
    for (const [name, caption] of Object.entries(WASHI_BOARD)) expect(WASHI[name].caption).toBe(caption);
  });

  it('shows old tapes as their new pattern', () => {
    expect(WASHI_ALIASES).toEqual({
      'pink-dots': 'oxblood-gold',
      'lilac-dots': 'night-sky',
      'peach-dots': 'ember-stripe',
      'mint-gingham': 'moss-gingham',
      'butter-gingham': 'mulberry',
      'pink-gingham': 'manuscript',
    });
    expect(resolveWashi('pink-dots')).toBe('oxblood-gold');
    expect(resolveWashi('night-sky')).toBe('night-sky');
  });

  it('draws the board’s outline at the board’s width, and keeps the torn ends when longer', () => {
    expect(washiPath('a', 320)).toBe('M5 2L315 0L311 7L318 14L312 22L319 30L313 37L317 44L2 44L6 37L0 30L5 22L1 14L6 7Z');
    expect(washiPath('b', 320)).toBe('M3 0L317 2L312 9L319 16L313 24L318 31L312 38L316 44L4 44L0 38L6 31L1 23L6 15L0 8Z');
    // 100 units longer: only the right end moves.
    expect(washiPath('a', 420)).toBe('M5 2L415 0L411 7L418 14L412 22L419 30L413 37L417 44L2 44L6 37L0 30L5 22L1 14L6 7Z');
  });
});
