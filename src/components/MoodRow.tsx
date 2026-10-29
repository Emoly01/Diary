import { useEffect, useRef, useState } from 'react';
import { moodInfo, type Mood } from '../data/moods';
import { countWord } from '../data/roman';
import MoodPicker from './MoodPicker';

const CX = [12, 39, 66, 93, 120];

/**
 * One moon of the row on board 4.3. Small ones are ink-soft line art; the
 * chosen one is larger, outlined in ember-ink, and filled: ember for
 * "good", gold for the rest.
 */
function Moon({ value, chosen }: { value: Mood; chosen: boolean }) {
  const cx = CX[value - 1];
  const r = chosen ? 10 : 8;
  const top = 12 - r;
  const ink = chosen ? (value === 4 ? '#D9692F' : '#DDBB72') : '#6A5747';
  // The lit part of each phase: none, crescent, half, gibbous, full.
  const lit: Record<Mood, string | null> = {
    1: null,
    2: `M${cx} ${top}a${r} ${r} 0 0 1 0 ${2 * r}a${r * 0.625} ${r} 0 0 0 0-${2 * r}z`,
    3: `M${cx} ${top}a${r} ${r} 0 0 1 0 ${2 * r}z`,
    4: `M${cx} ${top}a${r} ${r} 0 0 1 0 ${2 * r}a${r * 0.4} ${r} 0 0 1 0-${2 * r}z`,
    5: null,
  };
  if (!chosen) {
    return (
      <>
        <circle cx={cx} cy="12" r={r} fill="none" stroke="#6A5747" strokeWidth="1.2" />
        {lit[value] && <path d={lit[value]!} fill={ink} />}
      </>
    );
  }
  const face = value === 1 ? '#2B1F19' : value === 5 ? ink : '#F6E6B8';
  return (
    <>
      <circle cx={cx} cy="12" r={r} fill={face} stroke="#A3401A" strokeWidth="1.6" />
      {lit[value] && <path d={lit[value]!} fill={ink} />}
    </>
  );
}

function Moons({ mood }: { mood: Mood | null }) {
  return (
    <svg viewBox="0 0 132 24" width="132" height="24" aria-hidden="true" className="page-mood-moons">
      {([1, 2, 3, 4, 5] as Mood[]).map((v) => (
        <Moon key={v} value={v} chosen={v === mood} />
      ))}
    </svg>
  );
}

/**
 * The page's mood: five small moons with the chosen one enlarged, and its
 * word. The whole row is one button that opens the 44 px moon picker, since
 * an 18 px moon is too small to tap.
 */
export default function MoodRow({
  mood,
  onChange,
  readOnly,
}: {
  mood: Mood | null;
  onChange: (mood: Mood | null) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const said = mood ? `Mood: ${moodInfo(mood).label}, ${countWord(mood)} of five moons` : 'No mood yet';
  const word = mood ? moodInfo(mood).label : 'add a mood';
  const inner = (
    <>
      <Moons mood={mood} />
      <span className={`page-mood-word${mood === 4 ? ' is-ember' : ''}${mood ? '' : ' is-empty'}`}>{word}</span>
    </>
  );

  if (readOnly) {
    return mood ? (
      <div className="page-mood" role="img" aria-label={said}>
        {inner}
      </div>
    ) : null;
  }

  return (
    <div className="page-mood-wrap" ref={root}>
      <button
        type="button"
        className="page-mood page-mood-button"
        aria-label={mood ? `${said}. Change the mood` : 'Add a mood'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {inner}
      </button>
      {open && (
        <div className="page-mood-pop">
          <MoodPicker
            value={mood}
            onChange={(m) => {
              onChange(m);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
