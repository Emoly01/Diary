import Star from './stickers/Star';
import Heart from './stickers/Heart';
import Cat from './stickers/Cat';
import Sparkle from './stickers/Sparkle';
import './Cover.css';

const RINGS = Array.from({ length: 9 }, (_, i) => i);

/** The pink spiral-planner cover from the "Sign in" board. */
export default function Cover() {
  return (
    <div className="cover" aria-hidden="true">
      <div className="cover-board" />
      <div className="cover-rings">
        {RINGS.map((i) => (
          <span key={i} className="cover-ring" />
        ))}
      </div>
      <div className="cover-washi" />
      <div className="cover-label">
        <div className="cover-title">Daybook</div>
        <div className="cover-est">est. 2026</div>
      </div>
      <Star size={58} tilt={12} style={{ position: 'absolute', top: 30, right: 26 }} />
      <Heart size={52} tilt={-10} style={{ position: 'absolute', bottom: 50, left: 34 }} />
      <Cat size={76} tilt={8} style={{ position: 'absolute', bottom: 16, right: 22 }} />
      <Sparkle size={18} style={{ position: 'absolute', top: 76, left: 30 }} />
      <Sparkle size={14} color="var(--butter)" style={{ position: 'absolute', top: 250, left: 120 }} />
    </div>
  );
}
