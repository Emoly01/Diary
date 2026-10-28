import { Link } from 'react-router-dom';
import MoodFace from '../components/MoodFace';
import { formatDayLong } from '../data/day';
import { sameDayInEarlierYears, useOnThisDay } from '../data/memory';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The board's little calendar page, showing a date. */
function CalendarPage({ day }: { day: string }) {
  const [y, m, d] = day.split('-').map(Number);
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label={`Calendar page: ${d} ${MONTHS[m - 1]} ${y}`}>
      <rect x="6" y="10" width="68" height="64" rx="12" fill="#FFFFFF" stroke="#E7E1F5" strokeWidth="2" />
      <path d="M6 22a12 12 0 0 1 12-12h44a12 12 0 0 1 12 12v6H6z" fill="#FF9EC0" />
      <rect x="22" y="4" width="5" height="12" rx="2.5" fill="#8C7FB0" />
      <rect x="53" y="4" width="5" height="12" rx="2.5" fill="#8C7FB0" />
      <text x="40" y="58" textAnchor="middle" fill="#2E2A3B" fontFamily="Fredoka, system-ui, sans-serif" fontSize="26" fontWeight="600">
        {d}
      </text>
      <text x="40" y="69" textAnchor="middle" fill="#5F5873" fontFamily="Fredoka, system-ui, sans-serif" fontSize="8" fontWeight="600" letterSpacing="1">
        {`${MONTHS[m - 1].slice(0, 3).toUpperCase()} ${y}`}
      </text>
    </svg>
  );
}

/** Pages from this date one year back, then two, three… Each opens read-only. */
export default function OnThisDay({
  uid,
  day,
  isToday,
  startedAt,
}: {
  uid: string;
  day: string;
  isToday: boolean;
  startedAt: Date | null;
}) {
  const { loading, memories } = useOnThisDay(uid, day);
  const month = MONTHS[Number(day.slice(5, 7)) - 1];
  const yearAgo = sameDayInEarlierYears(day, 1)[0]?.day ?? day;
  const firstYear = !startedAt || Date.now() - startedAt.getTime() < 366 * 24 * 3600 * 1000;
  const later = `Next ${month}, ${isToday ? 'tonight’s' : 'this'} page pops up right here.`;

  return (
    <section className="otd" aria-labelledby="otd-heading">
      <h2 id="otd-heading">On this day</h2>
      {loading ? (
        <p className="otd-note">Looking back…</p>
      ) : memories.length === 0 ? (
        <>
          <CalendarPage day={yearAgo} />
          <p className="otd-note">{firstYear ? `First year! ${later}` : `Nothing written on this date before. ${later}`}</p>
        </>
      ) : (
        <ul className="otd-list">
          {memories.map(({ years, page }) => (
            <li key={page.day}>
              <Link to={`/day/${page.day}?read`} className="otd-card">
                <span className="otd-when">
                  {years === 1 ? 'A year ago' : `${years} years ago`} · {formatDayLong(page.day).split(' · ')[0]}
                </span>
                <span className="otd-title">
                  {page.title || 'Untitled'}
                  {page.mood && <MoodFace mood={page.mood} size={22} />}
                </span>
                {page.plainText && (
                  <span className="otd-text">{page.plainText.length > 140 ? `${page.plainText.slice(0, 140).trim()}…` : page.plainText}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
