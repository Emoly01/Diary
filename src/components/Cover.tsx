import { bookDay, deviceTimezone } from '../data/day';
import { bookLine } from '../data/roman';
import Filigree, { FILIGREE_CORNERS } from './Filigree';
import { Mark } from './Logo';
import WaxSeal from './WaxSeal';
import './Cover.css';

/**
 * The closed book: forest leather on the ember-lit desk, the tooled double
 * border, the filigree corners, Daybook foil-stamped in gold. `locked` adds
 * a wax-sealed clasp across it.
 */
export default function Cover({ locked = false }: { locked?: boolean }) {
  // Before sign-in there are no settings yet: the device's date says which year.
  const today = bookDay(new Date(), '04:00', deviceTimezone());
  return (
    <div className={`closed-book${locked ? ' is-locked' : ''}`} aria-hidden="true">
      <div className="closed-book-cover">
        {FILIGREE_CORNERS.map((at) => (
          <Filigree key={at} at={at} size={64} />
        ))}
        <div className="closed-book-plate">
          <Mark size={34} />
          <span className="closed-book-title">Daybook</span>
          <svg viewBox="0 0 160 10" width="120" height="10" className="closed-book-rule">
            <path d="M0 5h66M94 5h66" stroke="#C9A45C" strokeWidth="1" />
            <path d="M80 1l4 4-4 4-4-4z" fill="#C9A45C" />
          </svg>
          <span className="closed-book-line">{bookLine(today, null)}</span>
        </div>
        {locked && (
          <div className="closed-book-clasp">
            <span className="closed-book-strap" />
            <WaxSeal size={70} className="closed-book-seal" />
          </div>
        )}
      </div>
    </div>
  );
}
