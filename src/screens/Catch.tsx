import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { TrayIcon } from '../components/Icons';
import '../components/Shell.css';
import './Catch.css';

/** Placeholder until phase 2 builds the real catch form. */
export default function Catch() {
  return (
    <div className="catch">
      <header className="catch-header">
        <Logo size="sm" />
        <Link to="/" className="btn catch-tray">
          <TrayIcon />
          Tray
        </Link>
      </header>
      <h1 className="catch-title">Catch it</h1>
      <div className="page-surface catch-card">
        <p className="placeholder-note">Quick capture lands here in phase 2.</p>
      </div>
    </div>
  );
}
