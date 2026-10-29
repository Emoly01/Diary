import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Filigree, { FILIGREE_CORNERS } from '../components/Filigree';
import { monthName } from '../data/roman';

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
        {FILIGREE_CORNERS.map((at) => (
          <Filigree key={at} at={at} />
        ))}
        {left}
        {right}
      </div>
      {tray}
    </div>
  );
}
