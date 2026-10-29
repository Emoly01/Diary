import { useState, type ReactNode } from 'react';
import ScrapCard from '../components/ScrapCard';
import { ChevronIcon, PlusIcon } from '../components/Icons';
import type { Scrap } from '../data/scraps';
import { countWord, isoWeek, weekHead } from '../data/roman';

/** Same ISO week and year, so "this week" never reaches back into last December's week 44. */
const sameWeek = (a: string, b: string) => isoWeek(a) === isoWeek(b) && Math.abs(Date.parse(a) - Date.parse(b)) < 7 * 86_400_000;

/**
 * The left page: this week's scraps as torn slips, newest first, the ones
 * already on the open page marked "Bound in", and the oxblood pocket below
 * counting every scrap still waiting. Older waiting scraps unfold from
 * "Older pockets".
 */
export default function PocketPage({
  uid,
  timezone,
  today,
  isToday,
  unfiled,
  filed,
  onFile,
  letter,
  headingId = 'pocket-heading',
}: {
  uid: string;
  timezone: string;
  /** The book's today: "this week" is the week it falls in. */
  today: string;
  /** Whether the open page is today's, for the button labels. */
  isToday: boolean;
  unfiled: Scrap[];
  filed: Scrap[];
  /** Absent when the open page can't be written here. */
  onFile?: (scrap: Scrap) => void;
  /** On this day, top right. */
  letter?: ReactNode;
  headingId?: string;
}) {
  const [showOlder, setShowOlder] = useState(false);
  const thisWeek = unfiled.filter((s) => sameWeek(s.day, today));
  const older = unfiled.filter((s) => !sameWeek(s.day, today));
  const shown = [...filed, ...thisWeek, ...(showOlder ? older : [])].sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
  const waiting = unfiled.length;
  const target = isToday ? 'today’s page' : 'this page';

  return (
    <section className="pocket-page" aria-labelledby={headingId}>
      <div className="running-head">
        <span>Gathered</span>
        <span>{weekHead(today)}</span>
      </div>

      <div className="pocket-top">
        <h2 id={headingId} className="pocket-heading">
          Caught,
          <br />
          <em>this week</em>
        </h2>
        {letter}
      </div>

      {shown.length === 0 ? (
        <p className="pocket-empty">Nothing caught this week yet. The phone’s Catch is for that.</p>
      ) : (
        <ul className="pocket-slips">
          {shown.map((s, i) => (
            <li key={s.id}>
              <ScrapCard
                uid={uid}
                scrap={s}
                timezone={timezone}
                index={i}
                thumb={false}
                filedLabel="Bound in"
                action={
                  onFile &&
                  s.pageDay === null && (
                    <button
                      type="button"
                      className="pocket-bind"
                      aria-label={`Bind into ${target}: ${s.text || 'photo'}`}
                      onClick={() => onFile(s)}
                    >
                      <PlusIcon />
                    </button>
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}

      <div className="pocket">
        <span className="pocket-stitch" aria-hidden="true" />
        <span className="pocket-label">
          <span className="pocket-name">The pocket</span>
          <span className="pocket-count">
            {waiting === 0 ? 'empty, for now' : `${countWord(waiting)} ${waiting === 1 ? 'scrap' : 'scraps'}, waiting`}
          </span>
        </span>
        {older.length > 0 && (
          <button type="button" className="pocket-older" aria-expanded={showOlder} onClick={() => setShowOlder((o) => !o)}>
            {showOlder ? 'Fold them away' : 'Older pockets'}
            <ChevronIcon />
          </button>
        )}
      </div>
    </section>
  );
}
