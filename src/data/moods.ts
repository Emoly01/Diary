export type Mood = 1 | 2 | 3 | 4 | 5;

export type MoodInfo = {
  value: Mood;
  label: string;
  face: string;
  mouth: string;
  /** The widest grin is a filled mouth. */
  filled?: boolean;
};

export const MOODS: readonly MoodInfo[] = [
  { value: 1, label: 'rough', face: '#C9B8F5', mouth: 'M13 29Q20 22 27 29' },
  { value: 2, label: 'meh', face: '#D5CEEA', mouth: 'M13 27L27 27' },
  { value: 3, label: 'okay', face: '#9ED9C5', mouth: 'M13 26Q20 29.5 27 26' },
  { value: 4, label: 'good', face: '#FFE38A', mouth: 'M12 24Q20 32 28 24' },
  { value: 5, label: 'great', face: '#FFC9A8', mouth: 'M11 23Q20 36 29 23Z', filled: true },
];

export function isMood(v: unknown): v is Mood {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

export function moodInfo(mood: Mood): MoodInfo {
  return MOODS[mood - 1];
}
