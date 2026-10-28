import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import MoodFace from '../components/MoodFace';
import { useOwner } from '../auth/AuthProvider';
import { formatDayLong } from '../data/day';
import { makeSearch, snippet, useAllPages, type PageSummary } from '../data/memory';
import { PresetArt } from '../stickers/presets';
import { washiStyle } from '../stickers/washi';
import '../components/Shell.css';
import './Pages.css';

const monthKey = (day: string) => day.slice(0, 7);
const monthLabel = (key: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(`${key}-01T00:00:00Z`));
const shortDay = (day: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric' }).format(new Date(`${day}T00:00:00Z`));

/** A few of the page's stickers, small. Photos are left out: no image bytes in the archive. */
function MiniStickers({ page }: { page: PageSummary }) {
  const few = [...page.stickers]
    .filter((s) => s.kind === 'preset' || s.kind === 'washi')
    .sort((a, b) => b.z - a.z)
    .slice(0, 3);
  if (few.length === 0) return null;
  return (
    <span className="pages-stickers" aria-hidden="true">
      {few.map((s) =>
        s.kind === 'preset' ? (
          <span key={s.id} className="pages-sticker" style={{ transform: `rotate(${s.rotation}deg)` }}>
            <PresetArt name={s.ref} />
          </span>
        ) : (
          <span key={s.id} className="washi pages-washi" style={{ ...washiStyle(s.ref), transform: `rotate(${s.rotation}deg)` }} />
        ),
      )}
    </span>
  );
}

function PageCard({ page }: { page: PageSummary }) {
  return (
    <Link to={`/day/${page.day}`} className="pages-card">
      <span className="pages-card-top">
        <span className="label">{shortDay(page.day)}</span>
        {page.mood && <MoodFace mood={page.mood} size={24} />}
      </span>
      <span className="pages-card-title">{page.title || 'Untitled'}</span>
      <span className="pages-card-foot">
        <MiniStickers page={page} />
        <span className="label">{page.wordCount === 1 ? '1 word' : `${page.wordCount} words`}</span>
      </span>
    </Link>
  );
}

/** The archive, month by month, with search over titles and text. */
export default function Pages() {
  const { uid } = useOwner();
  const { loading, pages, fromCache } = useAllPages(uid);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.has('search')) searchRef.current?.focus();
  }, [params]);

  const search = useMemo(() => makeSearch(pages), [pages]);
  const results = useMemo(() => search(query), [search, query]);

  const months = useMemo(() => {
    const groups = new Map<string, PageSummary[]>();
    for (const p of pages) groups.set(monthKey(p.day), [...(groups.get(monthKey(p.day)) ?? []), p]);
    return [...groups.entries()];
  }, [pages]);

  const searching = query.trim().length >= 2;

  return (
    <div className="app">
      <AppHeader />
      <main className="pages">
        <div className="pages-head">
          <h1>Pages</h1>
          <div className="pages-search">
            <label htmlFor="pages-search" className="visually-hidden">
              Search your pages
            </label>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
            <input
              id="pages-search"
              ref={searchRef}
              type="search"
              placeholder="Search your pages"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
              }}
            />
          </div>
        </div>

        {!loading && fromCache && (
          <p className="pages-note" role="status">
            {navigator.onLine ? 'Fetching the rest of your pages…' : 'Offline: showing the pages saved on this device.'}
          </p>
        )}
        {loading ? (
          <p className="pages-note">Opening the archive…</p>
        ) : pages.length === 0 ? (
          <p className="pages-note">
            No pages yet. <Link to="/">Today’s is waiting on the desk.</Link>
          </p>
        ) : searching ? (
          <section aria-labelledby="results-heading">
            <h2 id="results-heading" className="pages-month">
              {results.length === 0 ? 'Nothing found' : results.length === 1 ? '1 page' : `${results.length} pages`}
            </h2>
            <ul className="pages-results">
              {results.map(({ item, matches }) => {
                const text = matches?.find((m) => m.key === 'plainText');
                return (
                  <li key={item.day}>
                    <Link to={`/day/${item.day}`} className="pages-result">
                      <span className="label">{formatDayLong(item.day)}</span>
                      <span className="pages-card-title">{item.title || 'Untitled'}</span>
                      <span className="pages-snippet">
                        {snippet(item.plainText, text?.indices).map((part, i) =>
                          part.mark ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          months.map(([key, list]) => (
            <section key={key} aria-labelledby={`m-${key}`}>
              <h2 id={`m-${key}`} className="pages-month">
                {monthLabel(key)}
              </h2>
              <ul className="pages-grid">
                {list.map((p) => (
                  <li key={p.day}>
                    <PageCard page={p} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
