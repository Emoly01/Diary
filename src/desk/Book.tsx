import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { monthName } from '../data/roman';

/** The board's art nouveau corner, drawn for the top left and mirrored for the others. */
function Corner({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg viewBox="0 0 90 90" width="78" height="78" aria-hidden="true" className={`book-corner book-corner-${at}`}>
      <g fill="none" stroke="#D9B46A" strokeLinecap="round">
        <path d="M4 86V30C4 14 14 4 30 4h56" strokeWidth="1.4" />
        <path d="M18 20c12 2 16 14 8 20-6 4-12-2-8-8 4-6 13-2 11 6" strokeWidth="1.2" />
      </g>
      <path d="M44 4c6 7 6 14 0 18-6-4-6-11 0-18z" fill="#D9B46A" opacity="0.85" />
      <path d="M4 44c7 6 14 6 18 0-4-6-11-6-18 0z" fill="#D9B46A" opacity="0.85" />
      <circle cx="18" cy="20" r="2.4" fill="#E8742A" />
    </svg>
  );
}

/**
 * The index tabs on the cover's right edge: Today · Pages · this month ·
 * The year. Today is parchment, like the open page; the others take the
 * tab colours in order.
 */
export function BookTabs({ today, isToday }: { today: string; isToday: boolean }) {
  const year = today.slice(0, 4);
  const tabs = [
    { to: '/', label: 'Today', current: isToday },
    { to: '/pages', label: 'Pages' },
    { to: `/pages?month=${today.slice(0, 7)}`, label: monthName(today) },
    { to: `/pages?year=${year}`, label: 'The year' },
  ];
  return (
    <nav aria-label="Book sections" className="book-tabs">
      {tabs.map((t, i) => (
        <Link key={t.label} to={t.to} className={`book-tab book-tab-${i}`} aria-current={t.current ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** The oxblood silk ribbon, falling from the top of today's page past the cover. Decoration only. */
export function Ribbon() {
  return <div className="book-ribbon" aria-hidden="true" />;
}

/**
 * The open book: forest leather with a tooled double gold border and four
 * corner pieces, holding one page or two, with the index tabs on its edge
 * and the inkwell tray on its bottom edge.
 */
export default function Book({
  tabs,
  left,
  right,
  tray,
}: {
  tabs: ReactNode;
  /** The pocket page; absent when only today's page fits. */
  left?: ReactNode;
  right: ReactNode;
  tray?: ReactNode;
}) {
  return (
    <div className={`book${left ? ' book-spread' : ' book-single'}`}>
      {tabs}
      <div className="book-cover">
        <Corner at="tl" />
        <Corner at="tr" />
        <Corner at="bl" />
        <Corner at="br" />
        {left}
        {right}
      </div>
      {tray}
    </div>
  );
}
