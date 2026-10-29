import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { TrashIcon } from '../components/Icons';
import SlideOver from '../components/SlideOver';
import { useOwner } from '../auth/AuthProvider';
import { bookDay, formatClock, formatDayLong, isBookDay } from '../data/day';
import { PAGE_WIDTH } from '../data/pages';
import type { Scrap } from '../data/scraps';
import { usePageScraps, useTrayScraps } from '../data/scraps';
import { useSettings } from '../data/settings';
import Book, { BookTabs, Ribbon } from '../desk/Book';
import DeskPage from '../desk/DeskPage';
import EditorToolbar from '../desk/EditorToolbar';
import OnThisDay from '../desk/OnThisDay';
import PocketPage from '../desk/PocketPage';
import { usePageSession } from '../desk/usePageSession';
import InkwellTray from '../stickers/InkwellTray';
import { stickerLabel } from '../stickers/StickerLayer';
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
  return (
    <DeskForDay
      key={day}
      uid={uid}
      day={day}
      today={today}
      timezone={settings.timezone}
      startedAt={settings.startedAt}
    />
  );
}

// Room for about this much italic text beside the time on a photo's frame.
const CAPTION_CHARS = 22;

/** A photo's caption from the scrap it came with: its first words and the time it was caught. */
function captionsFrom(scraps: Scrap[], timezone: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of scraps) {
    if (!s.photoId) continue;
    // The first sentence, cut back to whole words that fit.
    let lead = '';
    for (const word of s.text.trim().split(/[.!?\n]/)[0].split(/\s+/).filter(Boolean)) {
      if (lead && lead.length + word.length + 1 > CAPTION_CHARS) break;
      lead = lead ? `${lead} ${word}` : word;
    }
    lead = lead.replace(/[,;:]+$/, '');
    const at = formatClock(s.capturedAt, timezone);
    out[s.photoId] = lead ? `${lead}, ${at}` : at;
  }
  return out;
}

function DeskForDay({
  uid,
  day,
  today,
  timezone,
  startedAt,
}: {
  uid: string;
  day: string;
  today: string;
  timezone: string;
  startedAt: Date | null;
}) {
  const isToday = day === today;
  const layout = useLayout();
  // `?read` (from On this day) opens a page to look at, not to edit.
  const [params] = useSearchParams();
  const reading = params.has('read');
  const readOnly = layout === 'phone' || reading;
  const status = useBookStatus(uid);
  const unfiled = useTrayScraps(uid);
  const filed = usePageScraps(uid, day);
  const keepPhotoIds = filed.flatMap((s) => (s.photoId ? [s.photoId] : []));
  const session = usePageSession(uid, day, readOnly, keepPhotoIds);
  const [pocketOpen, setPocketOpen] = useState(false);
  const pageRef = useRef<HTMLElement>(null);
  const selected = session.content.stickers.find((s) => s.id === session.selected);
  const captions = useMemo(() => captionsFrom(filed, timezone), [filed, timezone]);

  /** The middle of the page's visible part, in logical px: where a new sticker lands. */
  const visibleCenter = () => {
    const r = pageRef.current?.getBoundingClientRect();
    if (!r) return { x: PAGE_WIDTH / 2, y: 300 };
    const scale = r.width / PAGE_WIDTH;
    const top = Math.max(r.top, 0);
    // The tray floats over the bottom of the window.
    const bottom = Math.min(r.bottom, window.innerHeight - 80);
    return { x: PAGE_WIDTH / 2, y: Math.max(0, ((top + bottom) / 2 - r.top) / scale) };
  };

  const letter = <OnThisDay uid={uid} day={day} startedAt={startedAt} />;

  const pocket = (headingId?: string) => (
    <PocketPage
      uid={uid}
      timezone={timezone}
      today={today}
      isToday={isToday}
      unfiled={unfiled}
      filed={filed}
      onFile={readOnly ? undefined : session.file}
      letter={letter}
      headingId={headingId}
    />
  );

  const page = (
    <DeskPage uid={uid} day={day} session={session} timezone={timezone} readOnly={readOnly} pageRef={pageRef} captions={captions} />
  );

  const banners = (
    <>
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
            You’re reading {formatDayLong(day)}. <Link to={`/day/${day}`}>Write in this page</Link>
          </p>
        )
      )}
    </>
  );

  // Phone: no book, just the page to read and the letter.
  if (layout === 'phone') {
    return (
      <div className="app">
        <AppHeader />
        {banners}
        <main className="phone-desk">
          <section className="phone-page" aria-label={isToday ? 'Today’s page' : 'Page'}>
            {page}
          </section>
          {letter}
        </main>
      </div>
    );
  }

  const tools = !readOnly && session.editor && (
    <div className="desk-tools">
      <EditorToolbar editor={session.editor} />
      {selected && (
        <div className="sticker-tools" role="toolbar" aria-label={`${stickerLabel(selected)} options`}>
          <button type="button" className="btn btn-gold" onClick={() => session.bringToFront(selected.id)}>
            To front
          </button>
          <button type="button" className="btn btn-gold" onClick={() => session.sendToBack(selected.id)}>
            To back
          </button>
          <button type="button" className="btn btn-gold" onClick={() => session.removeSticker(selected.id)}>
            <TrashIcon />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const tray = !readOnly && (
    <InkwellTray
      onSticker={(n) => session.addSticker('preset', n, visibleCenter())}
      onWashi={(n) => session.addSticker('washi', n, visibleCenter())}
      onPhoto={(p) => session.addPhoto(p, visibleCenter())}
      onLink={(u) => session.addSticker('link', u, visibleCenter())}
    />
  );

  return (
    <div className="app app-desk">
      <AppHeader
        actions={
          layout === 'tablet' && (
            <button type="button" className="btn btn-gold" aria-expanded={pocketOpen} onClick={() => setPocketOpen(true)}>
              The pocket · {unfiled.length}
            </button>
          )
        }
      />
      {banners}
      {tools}

      <main className="desk">
        <Book
          tabs={<BookTabs today={today} isToday={isToday} />}
          left={layout === 'desk' && <div className="book-page book-page-left">{pocket('pocket-heading')}</div>}
          right={
            <section className="book-page book-page-right" aria-label={isToday ? 'Today’s page' : 'Page'}>
              <Ribbon />
              {page}
            </section>
          }
          tray={tray}
        />
      </main>

      {layout === 'tablet' && pocketOpen && (
        <SlideOver side="left" label="pocket-panel-heading" closeLabel="Close the pocket" onClose={() => setPocketOpen(false)} variant="page">
          {pocket('pocket-panel-heading')}
        </SlideOver>
      )}
    </div>
  );
}
