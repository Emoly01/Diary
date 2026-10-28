import type { CSSProperties, ReactNode } from 'react';
import type { Scrap } from '../data/scraps';
import { formatStamp } from '../data/day';
import { moodInfo } from '../data/moods';
import Photo from './Photo';
import MoodFace from './MoodFace';
import { CheckIcon, PendingIcon } from './Icons';

const TILTS = [-0.9, 0.8, -0.5, 0.9, -0.7, 0.6];

/**
 * One scrap as a paper card. With `onOpen` the whole card is a button
 * (filed scraps never are: their text already lives on a page).
 */
export default function ScrapCard({
  uid,
  scrap,
  timezone,
  index,
  tone = '#FFFFFF',
  filedLabel,
  onOpen,
  current,
  action,
}: {
  uid: string;
  scrap: Scrap;
  timezone: string;
  index: number;
  tone?: string;
  /** Chip for a filed scrap, e.g. "on today's page". */
  filedLabel?: string;
  onOpen?: (scrap: Scrap) => void;
  /** Marks the card being edited. */
  current?: boolean;
  /** A button at the card's right edge, e.g. the tray's "+". */
  action?: ReactNode;
}) {
  const style = { background: tone, '--tilt': `${TILTS[index % TILTS.length]}deg` } as CSSProperties;
  const filed = scrap.pageDay !== null;
  const preview = scrap.text || 'Photo';

  const body = (
    <>
      {scrap.photoId && <Photo uid={uid} photoId={scrap.photoId} alt="" size={48} />}
      <span className="scrap-card-body">
        <span className="scrap-meta">
          {formatStamp(scrap.capturedAt, timezone)}
          {scrap.photoId && ' · 1 photo'}
        </span>
        {scrap.text && <span className="scrap-text">{scrap.text}</span>}
        {scrap.pending && (
          <span className="scrap-meta scrap-pending">
            <PendingIcon /> not synced yet
          </span>
        )}
        {filed && filedLabel && (
          <span className="scrap-chip">
            <CheckIcon />
            {filedLabel}
          </span>
        )}
      </span>
      {scrap.mood && (
        <span className="scrap-mood">
          <MoodFace mood={scrap.mood} size={26} />
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
    <article className="scrap-card" style={style}>
      {body}
    </article>
  );
}
