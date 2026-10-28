import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import AccountMenu from './AccountMenu';

export default function AppHeader() {
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
      <AccountMenu />
    </header>
  );
}
