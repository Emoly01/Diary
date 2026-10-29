import { Link } from 'react-router-dom';
import { sameDayInEarlierYears, useOnThisDay } from '../data/memory';
import { stampDate } from '../data/roman';
import WaxSeal from '../components/WaxSeal';

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
        <WaxSeal className="otd-seal" />
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
      <WaxSeal className="otd-seal" broken />
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
