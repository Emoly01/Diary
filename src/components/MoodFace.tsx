import { moodInfo, type Mood } from '../data/moods';

export default function MoodFace({ mood, size = 40 }: { mood: Mood; size?: number }) {
  const m = moodInfo(mood);
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill={m.face} stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="14" cy="17" r="2.2" fill="var(--ink)" />
      <circle cx="26" cy="17" r="2.2" fill="var(--ink)" />
      <circle cx="10" cy="23" r="2.4" fill="var(--pink)" />
      <circle cx="30" cy="23" r="2.4" fill="var(--pink)" />
      <path
        d={m.mouth}
        fill={m.filled ? 'var(--ink)' : 'none'}
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
