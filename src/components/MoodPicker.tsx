import { useId } from 'react';
import { MOODS, type Mood } from '../data/moods';
import MoodMoon from './MoodMoon';
import './MoodPicker.css';

/** Five faces. Tap one to pick it, tap it again to clear. */
export default function MoodPicker({
  value,
  onChange,
}: {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
}) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="mood-picker">
      <span id={labelId} className="field-label">
        Mood
      </span>
      <div className="mood-row">
        {MOODS.map((m) => {
          const on = m.value === value;
          return (
            <button
              key={m.value}
              type="button"
              className="mood-option"
              aria-pressed={on}
              onClick={() => onChange(on ? null : m.value)}
            >
              <MoodMoon mood={m.value} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
