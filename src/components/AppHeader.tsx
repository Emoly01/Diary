import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import AccountMenu from './AccountMenu';

/** `actions` sit before the account button, e.g. the tablet's tray toggle. */
export default function AppHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="app-header">
      <Logo />
      <nav aria-label="Main" className="app-nav">
        <NavLink to="/" end className="nav-pill">
          Today
        </NavLink>
        <NavLink to="/pages" className="nav-pill">
          Pages
        </NavLink>
        <NavLink to="/pages?search=1" className="nav-pill nav-search">
          Search
        </NavLink>
        <NavLink to="/catch" className="nav-pill nav-catch">
          Catch
        </NavLink>
      </nav>
      <div className="app-header-end">
        {actions}
        <AccountMenu />
      </div>
    </header>
  );
}
