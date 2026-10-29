import type { CSSProperties, ReactNode } from 'react';
import type { Scrap } from '../data/scraps';
import { formatStamp } from '../data/day';
import { moodInfo } from '../data/moods';
import Photo from './Photo';
import MoodMoon from './MoodMoon';
import { CheckIcon, PendingIcon } from './Icons';

// Torn edges and tilts from the pocket page on board 4.3, in turn.
const TEARS = [
  'polygon(0 3%, 6% 0, 40% 2%, 72% 0, 100% 2%, 99% 50%, 100% 97%, 64% 100%, 30% 98%, 0 100%, 1% 50%)',
  'polygon(0 1%, 30% 0, 66% 3%, 100% 0, 99% 48%, 100% 100%, 70% 98%, 36% 100%, 2% 97%, 0 52%)',
  'polygon(0 2%, 24% 0, 58% 2%, 100% 0, 100% 50%, 99% 98%, 60% 100%, 22% 97%, 0 100%, 1% 46%)',
  'polygon(0 0, 34% 2%, 70% 0, 100% 3%, 99% 52%, 100% 100%, 64% 97%, 28% 100%, 0 98%, 1% 50%)',
  'polygon(0 2%, 40% 0, 76% 2%, 100% 0, 100% 48%, 99% 100%, 66% 98%, 30% 100%, 1% 98%, 0 50%)',
];
const TILTS = [-0.6, 0.5, -0.4, 0.7, -0.5];

/**
 * One scrap as a torn paper slip. With `onOpen` the whole slip is a button
 * (filed scraps never are: their text already lives on a page).
 */
export default function ScrapCard({
  uid,
  scrap,
  timezone,
  index,
  filedLabel,
  onOpen,
  current,
  action,
  thumb = true,
}: {
  uid: string;
  scrap: Scrap;
  timezone: string;
  index: number;
  /** Shown with a check on a filed scrap, e.g. "Bound in". */
  filedLabel?: string;
  onOpen?: (scrap: Scrap) => void;
  /** Marks the slip being edited. */
  current?: boolean;
  /** A button at the slip's right edge, e.g. the pocket's "+". */
  action?: ReactNode;
  /** The photo as a small picture; without it the stamp just says "photo". */
  thumb?: boolean;
}) {
  const style = {
    '--tear': TEARS[index % TEARS.length],
    '--tilt': `${TILTS[index % TILTS.length]}deg`,
  } as CSSProperties;
  const filed = scrap.pageDay !== null;
  const preview = scrap.text || 'Photo';

  const body = (
    <>
      {thumb && scrap.photoId && <Photo uid={uid} photoId={scrap.photoId} alt="" size={48} />}
      <span className="scrap-card-body">
        <span className="scrap-meta">
          <span>
            {formatStamp(scrap.capturedAt, timezone)}
            {scrap.photoId && ' · photo'}
          </span>
          {filed && filedLabel && (
            <span className="scrap-bound">
              <CheckIcon />
              {filedLabel}
            </span>
          )}
        </span>
        {scrap.text && <span className="scrap-text">{scrap.text}</span>}
        {scrap.pending && (
          <span className="scrap-meta scrap-pending">
            <PendingIcon /> not synced yet
          </span>
        )}
      </span>
      {scrap.mood && (
        <span className="scrap-mood">
          <MoodMoon mood={scrap.mood} size={24} />
          <span className="visually-hidden">Mood: {moodInfo(scrap.mood).label}</span>
        </span>
      )}
      {action && <span className="scrap-action">{action}</span>}
    </>
  );

  if (onOpen && !filed) {
    return (
      <button
        type="button"
        className="scrap-card scrap-card-button"
        style={style}
        aria-label={`Edit scrap: ${preview}`}
        aria-current={current ? 'true' : undefined}
        onClick={() => onOpen(scrap)}
      >
        {body}
      </button>
    );
  }
  return (
    <article className={`scrap-card${action ? ' has-action' : ''}`} style={style}>
      {body}
    </article>
  );
}
