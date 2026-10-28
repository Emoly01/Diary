import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { CloseIcon, TrashIcon, TrayIcon } from '../components/Icons';
import Sparkle from '../components/stickers/Sparkle';
import { useOwner } from '../auth/AuthProvider';
import { bookDay, isBookDay } from '../data/day';
import { PAGE_WIDTH } from '../data/pages';
import StickerSheet from '../stickers/StickerSheet';
import { stickerLabel } from '../stickers/StickerLayer';
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
  const unfiled = useTrayScraps(uid);
  const filed = usePageScraps(uid, day);
  const keepPhotoIds = filed.flatMap((s) => (s.photoId ? [s.photoId] : []));
  const session = usePageSession(uid, day, readOnly, keepPhotoIds);
  const [panel, setPanel] = useState<'tray' | 'sheet' | null>(null);
  const pageRef = useRef<HTMLElement>(null);
  const selected = session.content.stickers.find((s) => s.id === session.selected);

  /** The middle of the page's visible part, in logical px: where a new sticker lands. */
  const visibleCenter = () => {
    const r = pageRef.current?.getBoundingClientRect();
    if (!r) return { x: PAGE_WIDTH / 2, y: 300 };
    const scale = r.width / PAGE_WIDTH;
    const top = Math.max(r.top, 0);
    const bottom = Math.min(r.bottom, window.innerHeight);
    return { x: PAGE_WIDTH / 2, y: ((top + bottom) / 2 - r.top) / scale };
  };
  // On a tablet the sheet covers the page, so it closes once something is added.
  const added = () => {
    if (layout === 'tablet') setPanel(null);
  };

  const sheet = (
    <StickerSheet
      onSticker={(n) => {
        session.addSticker('preset', n, visibleCenter());
        added();
      }}
      onWashi={(n) => {
        session.addSticker('washi', n, visibleCenter());
        added();
      }}
      onPhoto={(p) => {
        session.addPhoto(p, visibleCenter());
        added();
      }}
      onLink={(u) => {
        session.addSticker('link', u, visibleCenter());
        added();
      }}
    />
  );

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
            <>
              <button type="button" className="btn desk-tray-toggle" aria-expanded={panel === 'tray'} onClick={() => setPanel('tray')}>
                <TrayIcon />
                Tray · {unfiled.length}
              </button>
              <button type="button" className="btn desk-tray-toggle" aria-expanded={panel === 'sheet'} onClick={() => setPanel('sheet')}>
                <Sparkle size={16} color="var(--accent)" />
                Stickers
              </button>
            </>
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
          {!readOnly && session.editor && (
            <div className="desk-tools">
              <EditorToolbar editor={session.editor} />
              {selected && (
                <div className="sticker-tools" role="toolbar" aria-label={`${stickerLabel(selected)} options`}>
                  <button type="button" className="btn btn-quiet" onClick={() => session.bringToFront(selected.id)}>
                    To front
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => session.sendToBack(selected.id)}>
                    To back
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => session.removeSticker(selected.id)}>
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
          <DeskPage uid={uid} day={day} session={session} timezone={timezone} readOnly={readOnly} pageRef={pageRef} />
        </section>

        {layout === 'desk' && <aside className="desk-rail">{sheet}</aside>}
      </main>

      {layout === 'tablet' && panel === 'tray' && (
        <SlideOver side="left" label="tray-heading" closeLabel="Close tray" onClose={() => setPanel(null)}>
          {tray}
        </SlideOver>
      )}
      {layout === 'tablet' && panel === 'sheet' && (
        <SlideOver side="right" label="sheet-heading" closeLabel="Close sticker sheet" onClose={() => setPanel(null)}>
          {sheet}
        </SlideOver>
      )}
    </div>
  );
}

/** Tablet: the tray slides in from the left, the sticker sheet from the right. */
function SlideOver({
  children,
  side,
  label,
  closeLabel,
  onClose,
}: {
  children: ReactNode;
  side: 'left' | 'right';
  label: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="slide-over" role="dialog" aria-modal="true" aria-labelledby={label}>
      <div className="slide-over-scrim" onClick={onClose} />
      <div className={`slide-over-panel slide-over-${side}`}>
        <button ref={closeRef} type="button" className="btn btn-quiet slide-over-close" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
}
