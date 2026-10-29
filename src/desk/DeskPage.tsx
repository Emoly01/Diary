import { useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { EditorContent } from '@tiptap/react';
import PageScaler from '../components/PageScaler';
import StickerLayer from '../stickers/StickerLayer';
import MoodRow from '../components/MoodRow';
import { formatClock, formatDayLong } from '../data/day';
import { dateLine, folio, runningHead } from '../data/roman';
import { stickerBottom } from '../stickers/geometry';
import type { PageSession } from './usePageSession';

// Tall enough that the page, not the pocket beside it, sets the spread's height.
const MIN_HEIGHT = 880;

function statusText(session: PageSession, timezone: string): string {
  const s = session.status;
  switch (s.kind) {
    case 'loading':
    case 'idle':
      return '';
    case 'saving':
      return 'Saving…';
    case 'error':
      return 'Not saved: the book refused this change';
    case 'saved': {
      const at = formatClock(new Date(s.editedAt), timezone);
      return session.pending ? `Saved on this device ${at}` : `Saved ${at}`;
    }
  }
}

/** The board's gilt ornament rule under the title. */
const Ornament = () => (
  <svg viewBox="0 0 400 14" width="220" height="14" aria-hidden="true" className="page-ornament">
    <path d="M0 7h170M230 7h170" stroke="#C9A45C" strokeWidth="1" />
    <path d="M200 1l6 6-6 6-6-6z" fill="#C9A45C" />
    <circle cx="182" cy="7" r="2" fill="#C9A45C" />
    <circle cx="218" cy="7" r="2" fill="#C9A45C" />
  </svg>
);

/** The title wraps like the board's 62 px heading, so it's a textarea that grows with its text. */
function TitleField({ value, onChange, locked, onDone }: { value: string; onChange: (v: string) => void; locked: boolean; onDone: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // A title is one line of thought: Enter moves on to the writing.
    if (e.key === 'Enter') {
      e.preventDefault();
      onDone();
    }
  };
  return (
    <textarea
      ref={ref}
      className="page-title"
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={onKeyDown}
      placeholder="Give the day a title"
      aria-label="Page title"
      readOnly={locked}
      maxLength={120}
    />
  );
}

/** The day's page, drawn at 640 logical px and scaled to fit. */
export default function DeskPage({
  uid,
  day,
  session,
  timezone,
  readOnly,
  pageRef,
  captions,
}: {
  uid: string;
  day: string;
  session: PageSession;
  timezone: string;
  readOnly: boolean;
  pageRef?: RefObject<HTMLElement | null>;
  /** Captions for photos that came from scraps, by photo id. */
  captions?: Record<string, string>;
}) {
  const { content, editor } = session;
  // Nothing is editable until the saved page is on screen, or it would be overwritten.
  const locked = readOnly || session.status.kind === 'loading';
  const minHeight = Math.max(MIN_HEIGHT, ...content.stickers.map((s) => stickerBottom(s) + 60));
  const words = session.wordCount;
  const status = statusText(session, timezone);

  // A press anywhere but on a sticker puts its handles away.
  const onPointerDown = (e: PointerEvent) => {
    if (!(e.target as HTMLElement).closest('.sticker')) session.select(null);
  };

  return (
    <PageScaler>
      <article
        ref={pageRef}
        className="today-page"
        style={{ minHeight }}
        aria-label={`Page for ${formatDayLong(day)}`}
        onPointerDown={onPointerDown}
      >
        <div className="running-head">
          <span>{runningHead(day)}</span>
          <span>Folio {folio(day)}</span>
        </div>

        <div className="page-dateline">
          <p className="page-date">{dateLine(day)}</p>
          <MoodRow mood={content.mood} onChange={session.setMood} readOnly={locked} />
        </div>

        {readOnly ? (
          <h1 className="page-title">{content.title || 'Untitled'}</h1>
        ) : (
          <TitleField value={content.title} onChange={session.setTitle} locked={locked} onDone={() => editor?.commands.focus('start')} />
        )}

        <Ornament />

        <EditorContent editor={editor} className="page-editor" />

        <StickerLayer uid={uid} session={session} interactive={!locked} captions={captions} />

        <footer className="page-foot">
          <span role="status">
            {status}
            {status && ' · '}
            {words === 1 ? '1 word' : `${words} words`}
          </span>
          <span className="page-folio">{folio(day)}</span>
        </footer>
      </article>
    </PageScaler>
  );
}
