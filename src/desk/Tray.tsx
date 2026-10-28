import ScrapCard from '../components/ScrapCard';
import type { Scrap } from '../data/scraps';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Unfiled scraps (newest first), then the ones already on this page. */
export default function Tray({
  uid,
  timezone,
  unfiled,
  filed,
  filedLabel,
  onFile,
  headingId = 'tray-heading',
}: {
  uid: string;
  timezone: string;
  unfiled: Scrap[];
  filed: Scrap[];
  filedLabel: string;
  /** Absent when the page can't be written here. */
  onFile?: (scrap: Scrap) => void;
  headingId?: string;
}) {
  let i = 0;
  return (
    <div className="tray">
      <div className="tray-head">
        <h2 id={headingId}>Scrap tray</h2>
        <span className="label">{unfiled.length} waiting</span>
      </div>
      <p className="tray-intro">
        {onFile ? 'Caught on your phone. Pop one onto the page to write it up.' : 'Caught on your phone.'}
      </p>
      {unfiled.length === 0 && filed.length === 0 && <p className="tray-intro">Empty for now.</p>}
      <ul className="tray-list">
        {unfiled.map((s) => (
          <li key={s.id}>
            <ScrapCard
              uid={uid}
              scrap={s}
              timezone={timezone}
              index={i++}
              action={
                onFile && (
                  <button
                    type="button"
                    className="tray-add"
                    aria-label={`Add to page: ${s.text || 'photo'}`}
                    onClick={() => onFile(s)}
                  >
                    <PlusIcon />
                  </button>
                )
              }
            />
          </li>
        ))}
        {filed.map((s) => (
          <li key={s.id}>
            <ScrapCard
              uid={uid}
              scrap={s}
              timezone={timezone}
              index={i++}
              tone={['var(--mint-2)', 'var(--butter-2)', 'var(--pink-3)'][i % 3]}
              filedLabel={filedLabel}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
