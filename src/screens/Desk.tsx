import AppHeader from '../components/AppHeader';
import Heart from '../components/stickers/Heart';
import Star from '../components/stickers/Star';
import { useOwner } from '../auth/AuthProvider';
import { useBookStatus, type BookStatus } from '../useBookStatus';
import '../components/Shell.css';
import './Desk.css';

const RINGS = Array.from({ length: 12 }, (_, i) => i);

const STATUS_COPY: Record<BookStatus, string> = {
  checking: 'Opening the book…',
  open: 'Book unlocked',
  offline: 'Offline. Changes will sync when you’re back.',
  denied: 'The lock refused this account. Check the UID in firestore.rules.',
};

export default function Desk() {
  const user = useOwner();
  const status = useBookStatus(user.uid);
  const firstName = (user.displayName ?? '').split(' ')[0];

  return (
    <div className="app">
      <AppHeader />
      <main className="desk">
        <section aria-label="Today's page" className="desk-page-wrap">
          <div className="page-surface desk-page">
            <div className="spiral" aria-hidden="true">
              {RINGS.map((i) => (
                <span key={i} />
              ))}
            </div>
            <div className="desk-washi" aria-hidden="true" />
            <Star size={64} tilt={10} className="desk-star" />
            <Heart size={54} tilt={-8} className="desk-heart" />

            <span className="pill desk-today">Today</span>
            <h1 className="desk-title">{firstName ? `Hello, ${firstName}.` : 'Hello.'}</h1>
            <p className="placeholder-note">
              This is your book, and it’s locked to you. Writing, the scrap tray and stickers
              arrive in the next phases.
            </p>

            <p className={`desk-status desk-status-${status}`} role="status">
              <span className="desk-status-dot" aria-hidden="true" />
              {STATUS_COPY[status]}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
