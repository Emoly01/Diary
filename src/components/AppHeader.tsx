import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useOwner } from '../auth/AuthProvider';
import { bookDay } from '../data/day';
import { bookLine } from '../data/roman';
import { useSettings } from '../data/settings';
import { useNow } from '../useNow';
import AccountMenu from './AccountMenu';
import { SearchIcon } from './Icons';
import Logo from './Logo';

/**
 * The desk's header: mark, wordmark, "Book one · MMXXVI", then search and
 * the account. The index tabs on the book replace the old nav; on a phone,
 * where there's no book, Catch sits here instead. `actions` go before
 * search, e.g. the tablet's pocket button.
 */
export default function AppHeader({ actions }: { actions?: ReactNode }) {
  const { uid } = useOwner();
  const settings = useSettings(uid);
  const today = bookDay(useNow(), settings.dayStartsAt, settings.timezone);

  return (
    <header className="app-header">
      <div className="app-header-start">
        <Logo />
        <span className="app-book-line">{bookLine(today, settings.startedAt)}</span>
      </div>
      <div className="app-header-end">
        {actions}
        <Link to="/catch" className="btn btn-gold app-catch">
          Catch
        </Link>
        <Link to="/pages?search=1" className="round-btn" aria-label="Search the book">
          <SearchIcon />
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
