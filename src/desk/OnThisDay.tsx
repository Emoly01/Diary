import { Link } from 'react-router-dom';
import { sameDayInEarlierYears, useOnThisDay } from '../data/memory';
import { stampDate } from '../data/roman';

const CRESCENT = 'M45 26c-8 1-13 7-13 14s5 13 13 14c-5-3-7-8-7-14s2-11 7-14z';

/** The board's wax seal. Broken: split down the middle, the halves pulled apart. */
function Seal({ broken }: { broken: boolean }) {
  if (!broken) {
    return (
      <svg viewBox="0 0 80 80" width="58" height="58" aria-hidden="true" className="otd-seal">
        <circle cx="40" cy="40" r="32" fill="#8E2A14" filter="url(#db-wax)" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6E1E0E" strokeWidth="2" />
        <path d={CRESCENT} fill="#C2533A" />
      </svg>
    );
  }
  const crack = 'M40 4l-4 12 6 8-5 10 6 9-4 11 5 10-3 12';
  return (
    <svg viewBox="0 0 80 80" width="58" height="58" aria-hidden="true" className="otd-seal otd-seal-broken">
      <defs>
        <clipPath id="db-seal-l">
          <path d={`M0 0H40${crack.slice(5)}L37 80H0z`} />
        </clipPath>
        <clipPath id="db-seal-r">
          <path d={`M80 0H40${crack.slice(5)}L37 80H80z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#db-seal-l)" transform="translate(-3 2) rotate(-6 40 40)">
        <circle cx="40" cy="40" r="32" fill="#8E2A14" filter="url(#db-wax)" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6E1E0E" strokeWidth="2" />
        <path d={CRESCENT} fill="#C2533A" />
      </g>
      <g clipPath="url(#db-seal-r)" transform="translate(4 -1) rotate(7 40 40)">
        <circle cx="40" cy="40" r="32" fill="#8E2A14" filter="url(#db-wax)" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6E1E0E" strokeWidth="2" />
        <path d={CRESCENT} fill="#C2533A" />
      </g>
    </svg>
  );
}

const firstLine = (text: string) => {
  const line = text.split('\n').find((l) => l.trim()) ?? '';
  return line.length > 90 ? `${line.slice(0, 90).trim()}…` : line;
};

/**
 * On this day, as a letter with a wax seal at the top of the pocket page.
 * Sealed while there's nothing from this date; with last year's page, the
 * seal is broken and the letter opens that page, read-only.
 */
export default function OnThisDay({ uid, day, startedAt }: { uid: string; day: string; startedAt: Date | null }) {
  const { loading, memories } = useOnThisDay(uid, day);
  const yearAgo = sameDayInEarlierYears(day, 1)[0]?.day ?? day;
  const firstYear = !startedAt || Date.now() - startedAt.getTime() < 366 * 24 * 3600 * 1000;
  const [nearest, ...older] = memories;

  if (loading || !nearest) {
    return (
      <section className="otd" aria-labelledby="otd-heading">
        <Seal broken={false} />
        <h3 id="otd-heading" className="otd-head">
          On this day
        </h3>
        <p className="otd-title">Sealed · {stampDate(yearAgo)}</p>
        <p className="otd-note">
          {loading ? 'Looking back…' : firstYear ? 'Year one. Nothing to haunt you with yet.' : 'Nothing written on this date before.'}
        </p>
      </section>
    );
  }

  const { years, page } = nearest;
  return (
    <section className="otd otd-open" aria-labelledby="otd-heading">
      <span className="otd-flap" aria-hidden="true" />
      <Seal broken />
      <h3 id="otd-heading" className="otd-head">
        {years === 1 ? 'On this day' : `${years} years ago today`}
      </h3>
      <Link to={`/day/${page.day}?read`} className="otd-link">
        <span className="otd-title">{page.title || stampDate(page.day)}</span>
        {page.plainText && <span className="otd-note">{firstLine(page.plainText)}</span>}
      </Link>
      {older.length > 0 && (
        <ul className="otd-older">
          {older.map(({ years: y, page: p }) => (
            <li key={p.day}>
              <Link to={`/day/${p.day}?read`}>{`${y} years ago · ${p.title || stampDate(p.day)}`}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
