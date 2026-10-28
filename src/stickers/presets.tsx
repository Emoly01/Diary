import type { ReactNode } from 'react';

// The preset stickers from the "C · Pastel planner" board. Each is drawn
// twice: once stroked white (the die-cut edge), once in colour on top.

type Preset = { label: string; w: number; h: number; viewBox: string; art: ReactNode };

const cut = { fill: '#FFFFFF', stroke: '#FFFFFF', strokeWidth: 14, strokeLinejoin: 'round' as const };

const STAR = 'M50 14L60 38.3L86.1 40.3L66.2 57.3L72.3 82.7L50 69L27.7 82.7L33.8 57.3L13.9 40.3L40 38.3Z';
const HEART = 'M50 84C20 64 12 48 16 36C20 22 38 18 50 32C62 18 80 22 84 36C88 48 80 64 50 84Z';
const MOON = 'M60 14C36 16 20 36 22 58C24 80 46 92 68 86C50 80 40 64 42 48C44 32 52 20 60 14Z';
const CAT = 'M20 70C20 52 25 41 30 35L27 14L45 27C48 26.5 52 26.5 55 27L73 14L70 35C75 41 80 52 80 70C80 83 66 89 50 89C34 89 20 83 20 70Z';
const CUP = 'M24 42h44v12c0 13-10 23-22 23s-22-10-22-23z';
const HANDLE = 'M68 47h5a8 8 0 0 1 0 16h-6';
const SPARKLE = 'M12 2C13 9 15 11 22 12C15 13 13 15 12 22C11 15 9 13 2 12C9 11 11 9 12 2Z';
const BUBBLE = 'M14 8h92a10 10 0 0 1 10 10v34a10 10 0 0 1-10 10H34l-16 12 3-12h-7A10 10 0 0 1 4 52V18A10 10 0 0 1 14 8z';

export const PRESETS: Record<string, Preset> = {
  teacup: {
    label: 'Tea cup',
    w: 110,
    h: 110,
    viewBox: '0 0 100 100',
    art: (
      <>
        <g {...cut} strokeLinecap="round">
          <path d={CUP} />
          <path d={HANDLE} fill="none" />
          <rect x="14" y="76" width="64" height="9" rx="4.5" />
        </g>
        <path d={CUP} fill="#9ED9C5" />
        <path d={HANDLE} fill="none" stroke="#9ED9C5" strokeWidth="5" strokeLinecap="round" />
        <rect x="14" y="76" width="64" height="9" rx="4.5" fill="#7CC4AC" />
      </>
    ),
  },
  cat: {
    label: 'Cat',
    w: 110,
    h: 110,
    viewBox: '0 0 100 100',
    art: (
      <>
        <path d={CAT} {...cut} />
        <path d={CAT} fill="#FFC9A8" />
        <path d="M31 31L30 20L40 28Z" fill="#FF9EC0" />
        <path d="M69 31L70 20L60 28Z" fill="#FF9EC0" />
        <ellipse cx="39" cy="57" rx="3.6" ry="5" fill="#2E2A3B" />
        <ellipse cx="61" cy="57" rx="3.6" ry="5" fill="#2E2A3B" />
        <circle cx="40.5" cy="55" r="1.3" fill="#FFFFFF" />
        <circle cx="62.5" cy="55" r="1.3" fill="#FFFFFF" />
        <circle cx="31" cy="68" r="5" fill="#FF9EC0" />
        <circle cx="69" cy="68" r="5" fill="#FF9EC0" />
        <path d="M44 69q3 4 6 0q3 4 6 0" fill="none" stroke="#2E2A3B" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  star: {
    label: 'Star',
    w: 110,
    h: 110,
    viewBox: '0 0 100 100',
    art: (
      <>
        <path d={STAR} {...cut} />
        <path d={STAR} fill="#FFE38A" stroke="#FFE38A" strokeWidth="4" strokeLinejoin="round" />
      </>
    ),
  },
  heart: {
    label: 'Heart',
    w: 100,
    h: 100,
    viewBox: '0 0 100 100',
    art: (
      <>
        <path d={HEART} {...cut} />
        <path d={HEART} fill="#FF9EC0" />
        <ellipse cx="30" cy="38" rx="7" ry="4.5" fill="#FFFFFF" fillOpacity="0.7" transform="rotate(-30 30 38)" />
      </>
    ),
  },
  moon: {
    label: 'Moon',
    w: 100,
    h: 100,
    viewBox: '0 0 100 100',
    art: (
      <>
        <path d={MOON} {...cut} />
        <path d={MOON} fill="#C9B8F5" />
      </>
    ),
  },
  yay: {
    label: 'Yay speech bubble',
    w: 120,
    h: 78,
    viewBox: '0 0 120 78',
    art: (
      <>
        <path d={BUBBLE} {...cut} strokeWidth={10} />
        <path d={BUBBLE} fill="#FFD3E2" />
        <text x="60" y="44" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="600" fontSize="28" fill="#2E2A3B">
          yay!
        </text>
      </>
    ),
  },
  sparkle: {
    label: 'Sparkle',
    w: 80,
    h: 80,
    viewBox: '0 0 24 24',
    art: <path d={SPARKLE} fill="#FFE38A" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />,
  },
  rainbow: {
    label: 'Rainbow',
    w: 140,
    h: 94,
    viewBox: '0 0 60 40',
    art: (
      <>
        <path d="M8 34a22 22 0 0 1 44 0" fill="none" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />
        <path d="M10 34a20 20 0 0 1 40 0" fill="none" stroke="#FF9EC0" strokeWidth="5" strokeLinecap="round" />
        <path d="M16 34a14 14 0 0 1 28 0" fill="none" stroke="#FFE38A" strokeWidth="5" strokeLinecap="round" />
        <path d="M22 34a8 8 0 0 1 16 0" fill="none" stroke="#9ED9C5" strokeWidth="5" strokeLinecap="round" />
      </>
    ),
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

/** A preset sticker's artwork, filling its box. */
export function PresetArt({ name }: { name: string }) {
  const p = PRESETS[name] ?? PRESETS.star;
  return (
    <svg viewBox={p.viewBox} width="100%" height="100%" aria-hidden="true" className="sticker-svg" preserveAspectRatio="xMidYMid meet">
      {p.art}
    </svg>
  );
}
