import { moodInfo, type Mood } from '../data/moods';
import { PresetArt } from '../stickers/presets';

/** A mood as its moon phase: the same art as the moon stickers. */
export default function MoodMoon({ mood, size = 40 }: { mood: Mood; size?: number }) {
  return (
    <span className="mood-moon" style={{ display: 'inline-block', width: size, height: size, flex: 'none' }}>
      <PresetArt name={moodInfo(mood).preset} />
    </span>
  );
}
