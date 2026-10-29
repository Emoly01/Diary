import type { CSSProperties, ReactNode } from 'react';

// The word labels from the cabinet board (design/redesign/StickerCabinet.dc.html),
// drawn as on the board: HTML with fixed text. `w` × `h` is each label's own
// size on the board (measured without its tilt); the cream die-cut edge and
// the shadow spill outside it, as they do there.

const display = "'Cormorant Garamond', Georgia, serif";
const mono = "'IBM Plex Mono', ui-monospace, monospace";

const chip: CSSProperties = { display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', boxSizing: 'border-box' };
const monoText: CSSProperties = { fontFamily: mono, fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' };

type Word = { caption: string; label: string; tilt: number; w: number; h: number; html: ReactNode };

export const WORDS: Record<string, Word> = {
  'word-good-day': {
    caption: 'a good day',
    label: 'A good day banner',
    tilt: -4,
    w: 190,
    h: 50,
    html: (
      <div style={{ position: 'relative', filter: 'drop-shadow(0 4px 5px rgba(43,31,25,0.22))' }}>
        <svg viewBox="0 0 200 52" width="190" height="50" aria-hidden="true" style={{ display: 'block' }}>
          <path d="M0 12h22l-8 14 8 14H0zM200 12h-22l8 14-8 14h22z" fill="#8E2A14" />
          <path d="M18 6h164v40H18z" fill="#B4402A" />
          <path d="M24 11h152v30H24z" fill="none" stroke="#D9B46A" strokeWidth="0.8" />
        </svg>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: display,
            fontSize: 22,
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#FBF3E4',
            whiteSpace: 'nowrap',
          }}
        >
          a good day
        </span>
      </div>
    ),
  },
  'word-rough-one': {
    caption: 'rough one',
    label: 'Rough one label',
    tilt: 3,
    w: 121,
    h: 44,
    html: (
      <span
        style={{
          ...chip,
          padding: '8px 22px 10px',
          borderRadius: 999,
          background: '#6A2018',
          color: '#F3E6D3',
          boxShadow: 'inset 0 0 0 3px #6A2018, inset 0 0 0 4px #D9B46A, 0 0 0 4px #FFFBF3, 0 5px 8px rgba(43,31,25,0.22)',
          fontFamily: display,
          fontSize: 22,
          fontStyle: 'italic',
          fontWeight: 600,
        }}
      >
        rough one
      </span>
    ),
  },
  'word-small-win': {
    caption: 'small win',
    label: 'Small win tag',
    tilt: -3,
    w: 132,
    h: 35,
    html: (
      <span
        style={{
          ...chip,
          ...monoText,
          position: 'relative',
          gap: 10,
          padding: '9px 18px 9px 30px',
          background: '#9DB38D',
          color: '#1A1411',
          clipPath: 'polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%)',
          filter: 'drop-shadow(0 4px 5px rgba(43,31,25,0.22))',
        }}
      >
        <span
          aria-hidden="true"
          style={{ position: 'absolute', left: 14, top: '50%', width: 7, height: 7, marginTop: -3.5, borderRadius: 999, background: '#F4ECDD' }}
        />
        small win
      </span>
    ),
  },
  'word-remember-this': {
    caption: 'remember this',
    label: 'Remember this label',
    tilt: 2,
    w: 168,
    h: 46,
    html: (
      <span
        style={{
          ...chip,
          padding: '10px 18px',
          background: 'linear-gradient(135deg, #F0D99A, #C9A45C 50%, #E6C680)',
          color: '#6A2018',
          boxShadow: '0 0 0 4px #FFFBF3, 0 5px 8px rgba(43,31,25,0.22)',
          fontFamily: display,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
      >
        remember this
      </span>
    ),
  },
  'word-night-shift': {
    caption: 'night shift',
    label: 'Night shift label',
    tilt: -2,
    w: 163,
    h: 35,
    html: (
      <span
        style={{
          ...chip,
          ...monoText,
          gap: 8,
          padding: '9px 18px',
          borderRadius: 6,
          background: '#2B1F19',
          color: '#F3E6D3',
          boxShadow: '0 0 0 4px #FFFBF3, 0 5px 8px rgba(43,31,25,0.25)',
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M15 3c-5 .5-8 4.5-8 9s3 8.5 8 9c-3-2-4.5-5.4-4.5-9S12 5 15 3z" fill="#D9B46A" />
        </svg>
        night shift
      </span>
    ),
  },
  'word-session-night': {
    caption: 'session night',
    label: 'Session night label',
    tilt: 4,
    w: 184,
    h: 36,
    html: (
      <span
        style={{
          ...chip,
          ...monoText,
          gap: 8,
          padding: '9px 18px',
          borderRadius: 6,
          background: '#B3C2CF',
          color: '#1A1411',
          boxShadow: '0 0 0 4px #FFFBF3, 0 5px 8px rgba(43,31,25,0.22)',
        }}
      >
        <svg viewBox="0 0 100 100" width="18" height="18" aria-hidden="true">
          <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="#6E5A8E" />
          <polygon points="50,28 72,64 28,64" fill="none" stroke="#FBF3E4" strokeWidth="5" />
        </svg>
        session night
      </span>
    ),
  },
  'word-tea-blanket': {
    caption: 'tea & blanket',
    label: 'Tea and blanket label',
    tilt: -3,
    w: 145,
    h: 41,
    html: (
      <span
        style={{
          ...chip,
          padding: '8px 20px',
          background: '#FBF6EC',
          color: '#A3401A',
          boxShadow:
            'inset 0 0 0 1.5px #A3401A, inset 0 0 0 4px #FBF6EC, inset 0 0 0 5px #A3401A, 0 0 0 4px #FFFBF3, 0 5px 8px rgba(43,31,25,0.2)',
          fontFamily: display,
          fontSize: 21,
          fontStyle: 'italic',
          fontWeight: 600,
        }}
      >
        tea &amp; blanket
      </span>
    ),
  },
};

/** The round "survived" stamp: SVG, so it draws like the other stickers. */
export const STAMP = {
  caption: 'survived',
  label: 'Survived stamp',
  tilt: -12,
  art: (
    <>
      <circle cx="50" cy="50" r="47" fill="#FFFBF3" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#A3401A" strokeWidth="1.8" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#A3401A" strokeWidth="1" />
      <text fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8.6" fontWeight="500" letterSpacing="2.2" fill="#A3401A">
        <textPath href="#db-ring">SURVIVED · ANOTHER ONE · SURVIVED ·</textPath>
      </text>
      <path d="M40 50l7 7 14-15" fill="none" stroke="#A3401A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};
