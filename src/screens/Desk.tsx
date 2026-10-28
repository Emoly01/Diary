import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { CloseIcon, TrayIcon } from '../components/Icons';
import { useOwner } from '../auth/AuthProvider';
import { bookDay, isBookDay } from '../data/day';
import { usePageScraps, useTrayScraps } from '../data/scraps';
import { useSettings } from '../data/settings';
import DeskPage from '../desk/DeskPage';
import EditorToolbar from '../desk/EditorToolbar';
import Tray from '../desk/Tray';
import { usePageSession } from '../desk/usePageSession';
import { useBookStatus } from '../useBookStatus';
import { useLayout } from '../useMediaQuery';
import { useNow } from '../useNow';
import '../components/Shell.css';
import './Desk.css';

/** `/` is today's page; `/day/:day` opens any other day. */
export default function Desk() {
  const { uid } = useOwner();
  const params = useParams();
  const settings = useSettings(uid);
  const today = bookDay(useNow(), settings.dayStartsAt, settings.timezone);

  if (params.day !== undefined && !isBookDay(params.day)) return <Navigate to="/" replace />;
  const day = params.day ?? today;

  // A fresh session per day: at 04:00, "/" rolls over to the new page.
  return <DeskForDay key={day} uid={uid} day={day} isToday={day === today} timezone={settings.timezone} />;
}

function DeskForDay({ uid, day, isToday, timezone }: { uid: string; day: string; isToday: boolean; timezone: string }) {
  const layout = useLayout();
  const readOnly = layout === 'phone';
  const status = useBookStatus(uid);
  const session = usePageSession(uid, day, readOnly);
  const unfiled = useTrayScraps(uid);
  const filed = usePageScraps(uid, day);
  const [trayOpen, setTrayOpen] = useState(false);

  const tray = (
    <Tray
      uid={uid}
      timezone={timezone}
      unfiled={unfiled}
      filed={filed}
      filedLabel={isToday ? 'on today’s page' : 'on this page'}
      onFile={readOnly ? undefined : session.file}
    />
  );

  return (
    <div className="app">
      <AppHeader
        actions={
          layout === 'tablet' && (
            <button
              type="button"
              className="btn desk-tray-toggle"
              aria-expanded={trayOpen}
              onClick={() => setTrayOpen(true)}
            >
              <TrayIcon />
              Tray · {unfiled.length}
            </button>
          )
        }
      />

      {status === 'denied' && (
        <p className="desk-banner" role="alert">
          The lock refused this account. Check the UID in firestore.rules.
        </p>
      )}
      {readOnly && (
        <p className="desk-banner">
          Reading only. Pages are written at the desk; on the phone, <Link to="/catch">catch a scrap</Link>.
        </p>
      )}

      <main className="desk">
        {layout === 'desk' && (
          <aside className="desk-tray" aria-labelledby="tray-heading">
            {tray}
          </aside>
        )}

        <section className="desk-page-col" aria-label={isToday ? 'Today’s page' : 'Page'}>
          {!readOnly && session.editor && <EditorToolbar editor={session.editor} />}
          <DeskPage uid={uid} day={day} session={session} timezone={timezone} readOnly={readOnly} />
        </section>
      </main>

      {layout === 'tablet' && trayOpen && <TrayPanel onClose={() => setTrayOpen(false)}>{tray}</TrayPanel>}
    </div>
  );
}

/** Tablet: the tray slides over from the left. */
function TrayPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="slide-over" role="dialog" aria-modal="true" aria-labelledby="tray-heading">
      <div className="slide-over-scrim" onClick={onClose} />
      <div className="slide-over-panel">
        <button ref={closeRef} type="button" className="btn btn-quiet slide-over-close" aria-label="Close tray" onClick={onClose}>
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
}
