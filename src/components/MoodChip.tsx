import { useEffect, useRef, useState } from 'react';
import { moodInfo, type Mood } from '../data/moods';
import MoodFace from './MoodFace';
import MoodPicker from './MoodPicker';

/** The tilted mood sticker on the page header. Opens the five faces. */
export default function MoodChip({
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

  const label = mood ? `mood: ${moodInfo(mood).label}` : 'add a mood';
  const face = mood ? <MoodFace mood={mood} size={30} /> : null;

  if (readOnly) {
    return mood ? <span className="mood-chip">{face}{label}</span> : null;
  }

  return (
    <div className="mood-chip-wrap" ref={root}>
      <button
        type="button"
        className={`mood-chip${mood ? '' : ' mood-chip-empty'}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {face}
        {label}
      </button>
      {open && (
        <div className="mood-chip-pop">
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
