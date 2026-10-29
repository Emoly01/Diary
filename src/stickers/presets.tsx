import type { ReactNode } from 'react';
import { BOARD_ART } from './boardArt';
import { STAMP, WORDS } from './words';

// The preset stickers from the cabinet board (design/redesign/StickerCabinet.dc.html):
// watercolour stickers, word labels and mood moons. Sizes are logical px on
// the 640 px page.

export type PresetGroup = 'grimoire' | 'herbarium' | 'hearth' | 'words' | 'moods';

export type Preset = {
  /** The board's caption: what the cabinet shows under it. */
  caption: string;
  /** For screen readers: "{label} sticker". */
  label: string;
  group: PresetGroup;
  /** How the board tilts it in the cabinet. */
  tilt: number;
  w: number;
  h: number;
  viewBox: string;
  /** SVG art, or HTML for a word label. */
  art: ReactNode;
  html?: boolean;
};

export const GROUPS: { id: PresetGroup; title: string }[] = [
  { id: 'grimoire', title: 'Grimoire' },
  { id: 'herbarium', title: 'Herbarium' },
  { id: 'hearth', title: 'Hearth & home' },
  { id: 'words', title: 'Words' },
  { id: 'moods', title: 'Moods' },
];

const IN_GROUP: Record<Exclude<PresetGroup, 'words'>, string[]> = {
  grimoire: ['moth', 'moon-star', 'candle', 'crystals', 'potion', 'tarot-moon', 'mushroom', 'crow-feather', 'd20', 'old-key'],
  herbarium: ['fern', 'lavender', 'pressed-rose', 'ginkgo', 'oak-leaf', 'rowan'],
  hearth: ['teacup', 'black-cat', 'sleeping-tabby', 'yarn-hook', 'glazed-vase', 'heart-anatomical', 'rain', 'sun', 'sealed-letter', 'star', 'heart'],
  moods: ['moon-1', 'moon-2', 'moon-3', 'moon-4', 'moon-5'],
};

// Stickers draw at 110 px, as on the desk board; moons a little smaller.
const STICKER = 110;
const MOON = 72;

function build(): Record<string, Preset> {
  const out: Record<string, Preset> = {};
  for (const [group, names] of Object.entries(IN_GROUP) as [PresetGroup, string[]][]) {
    for (const name of names) {
      const a = BOARD_ART[name];
      const size = group === 'moods' ? MOON : STICKER;
      out[name] = { caption: a.caption, label: a.label, group, tilt: a.tilt, w: size, h: size, viewBox: '0 0 100 100', art: a.art };
    }
  }
  for (const [name, word] of Object.entries(WORDS)) {
    out[name] = { ...word, group: 'words', viewBox: `0 0 ${word.w} ${word.h}`, art: word.html, html: true };
  }
  out['stamp-survived'] = { ...STAMP, group: 'words', w: 98, h: 98, viewBox: '0 0 100 100' };
  return out;
}

export const PRESETS: Record<string, Preset> = build();

export const PRESET_NAMES = Object.keys(PRESETS);

/** Presets in a cabinet group, in board order. */
export const presetsIn = (group: PresetGroup) => PRESET_NAMES.filter((n) => PRESETS[n].group === group);

/** v1 preset names on pages saved before the redesign. They show the new art; the data stays as it is. */
export const PRESET_ALIASES: Record<string, string> = {
  cat: 'black-cat',
  moon: 'moon-star',
  yay: 'word-good-day',
  sparkle: 'star',
  rainbow: 'sun',
};

/** The preset a stored ref shows: itself, its new name, or the star. */
export function resolvePreset(ref: string): string {
  if (PRESETS[ref]) return ref;
  const alias = PRESET_ALIASES[ref];
  return alias && PRESETS[alias] ? alias : 'star';
}

export const presetFor = (ref: string): Preset => PRESETS[resolvePreset(ref)];

/** A preset sticker's artwork, filling its box. */
export function PresetArt({ name }: { name: string }) {
  const p = presetFor(name);
  return (
    <svg
      viewBox={p.viewBox}
      width="100%"
      height="100%"
      aria-hidden="true"
      className={`sticker-svg${p.html ? ' sticker-word' : ''}`}
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
    >
      {p.html ? (
        <foreignObject x="0" y="0" width={p.w} height={p.h} overflow="visible">
          <div className="sticker-word-box">{p.art}</div>
        </foreignObject>
      ) : (
        p.art
      )}
    </svg>
  );
}
