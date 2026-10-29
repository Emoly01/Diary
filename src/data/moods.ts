export type Mood = 1 | 2 | 3 | 4 | 5;

export type MoodInfo = {
  value: Mood;
  label: string;
  /** The moon phase that draws it. */
  phase: string;
  /** The moon sticker preset for it. */
  preset: `moon-${Mood}`;
};

export const MOODS: readonly MoodInfo[] = [
  { value: 1, label: 'rough', phase: 'new moon', preset: 'moon-1' },
  { value: 2, label: 'meh', phase: 'crescent moon', preset: 'moon-2' },
  { value: 3, label: 'okay', phase: 'half moon', preset: 'moon-3' },
  { value: 4, label: 'good', phase: 'waxing gibbous moon', preset: 'moon-4' },
  { value: 5, label: 'great', phase: 'full moon', preset: 'moon-5' },
];

export function isMood(v: unknown): v is Mood {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

export function moodInfo(mood: Mood): MoodInfo {
  return MOODS[mood - 1];
}
