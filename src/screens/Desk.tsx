import { useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { TrashIcon, TrayIcon } from '../components/Icons';
import SlideOver from '../components/SlideOver';
import Sparkle from '../components/stickers/Sparkle';
import { useOwner } from '../auth/AuthProvider';
import { bookDay, formatDayLong, isBookDay } from '../data/day';
import { PAGE_WIDTH } from '../data/pages';
import StickerSheet from '../stickers/StickerSheet';
import { stickerLabel } from '../stickers/StickerLayer';
import { usePageScraps, useTrayScraps } from '../data/scraps';
import { useSettings } from '../data/settings';
import DeskPage from '../desk/DeskPage';
import EditorToolbar from '../desk/EditorToolbar';
import OnThisDay from '../desk/OnThisDay';
import Tray from '../desk/Tray';
import { usePageSession } from '../desk/usePageSession';
import { useBookStatus } from '../useBookStatus';
import { useLayout, useSheetInRail } from '../useMediaQuery';
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
  return (
    <DeskForDay
      key={day}
      uid={uid}
      day={day}
      isToday={day === today}
      timezone={settings.timezone}
      startedAt={settings.startedAt}
    />
  );
}

function DeskForDay({
  uid,
  day,
  isToday,
  timezone,
  startedAt,
}: {
  uid: string;
  day: string;
  isToday: boolean;
  timezone: string;
  startedAt: Date | null;
}) {
  const layout = useLayout();
  // `?read` (from On this day) opens a page to look at, not to edit.
  const [params] = useSearchParams();
  const reading = params.has('read');
  const readOnly = layout === 'phone' || reading;
  // Below 1600 px the sheet slides over from the right, opened from the header.
  const sheetInRail = useSheetInRail();
  const sheetAsPanel = !readOnly && !sheetInRail;
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
  // As a slide-over the sheet covers the page, so it closes once something is added.
  const added = () => {
    if (sheetAsPanel) setPanel(null);
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

  const memories = <OnThisDay uid={uid} day={day} isToday={isToday} startedAt={startedAt} />;

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
          <>
            {layout === 'tablet' && (
              <button type="button" className="btn desk-tray-toggle" aria-expanded={panel === 'tray'} onClick={() => setPanel('tray')}>
                <TrayIcon />
                Tray · {unfiled.length}
              </button>
            )}
            {sheetAsPanel && (
              <button type="button" className="btn desk-tray-toggle" aria-expanded={panel === 'sheet'} onClick={() => setPanel('sheet')}>
                <Sparkle size={16} color="var(--accent)" />
                Stickers
              </button>
            )}
          </>
        }
      />

      {status === 'denied' && (
        <p className="desk-banner" role="alert">
          The lock refused this account. Check the UID in firestore.rules.
        </p>
      )}
      {layout === 'phone' ? (
        <p className="desk-banner">
          Reading only. Pages are written at the desk; on the phone, <Link to="/catch">catch a scrap</Link>.
        </p>
      ) : (
        reading && (
          <p className="desk-banner">
            You’re reading {formatDayLong(day)}. <Link to={`/day/${day}`}>Edit this page</Link>
          </p>
        )
      )}

      <main className="desk">
        {layout === 'desk' && (
          <aside className="desk-tray" aria-labelledby="tray-heading">
            {!sheetInRail && memories}
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

        {layout === 'desk' && sheetInRail && (
          <aside className="desk-rail">
            {memories}
            {!readOnly && sheet}
          </aside>
        )}
      </main>

      {layout === 'phone' && <div className="desk-phone-memories">{memories}</div>}

      {layout === 'tablet' && panel === 'tray' && (
        <SlideOver side="left" label="tray-heading" closeLabel="Close tray" onClose={() => setPanel(null)}>
          <div className="desk-panel-stack">
            {memories}
            {tray}
          </div>
        </SlideOver>
      )}
      {sheetAsPanel && panel === 'sheet' && (
        <SlideOver side="right" label="sheet-heading" closeLabel="Close sticker sheet" onClose={() => setPanel(null)}>
          {sheet}
        </SlideOver>
      )}
    </div>
  );
}
