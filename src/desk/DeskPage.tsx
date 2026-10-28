import type { PointerEvent, RefObject } from 'react';
import { EditorContent } from '@tiptap/react';
import PageScaler from '../components/PageScaler';
import StickerLayer from '../stickers/StickerLayer';
import MoodChip from '../components/MoodChip';
import Sparkle from '../components/stickers/Sparkle';
import { formatClock, formatDayLong } from '../data/day';
import { stickerBottom } from '../stickers/geometry';
import type { PageSession } from './usePageSession';

const RINGS = Array.from({ length: 16 }, (_, i) => i);
const MIN_HEIGHT = 900;

function statusText(session: PageSession, timezone: string): string {
  const s = session.status;
  switch (s.kind) {
    case 'loading':
    case 'idle':
      return '';
    case 'saving':
      return 'saving…';
    case 'error':
      return 'not saved: the book refused this change';
    case 'saved': {
      const at = formatClock(new Date(s.editedAt), timezone);
      return session.pending ? `saved on this device · ${at}` : `saved ${at}`;
    }
  }
}

/** The day's page, drawn at 960 logical px and scaled to fit. */
export default function DeskPage({
  uid,
  day,
  session,
  timezone,
  readOnly,
  pageRef,
}: {
  uid: string;
  day: string;
  session: PageSession;
  timezone: string;
  readOnly: boolean;
  pageRef?: RefObject<HTMLElement | null>;
}) {
  const { content, editor } = session;
  // Nothing is editable until the saved page is on screen, or it would be overwritten.
  const locked = readOnly || session.status.kind === 'loading';
  const minHeight = Math.max(MIN_HEIGHT, ...content.stickers.map((s) => stickerBottom(s) + 60));
  const words = session.wordCount;

  // A press anywhere but on a sticker puts its handles away.
  const onPointerDown = (e: PointerEvent) => {
    if (!(e.target as HTMLElement).closest('.sticker')) session.select(null);
  };

  return (
    <PageScaler>
      <article
        ref={pageRef}
        className="page-surface desk-page"
        style={{ minHeight }}
        aria-label={`Page for ${formatDayLong(day)}`}
        onPointerDown={onPointerDown}
      >
        <div className="spiral desk-spiral" aria-hidden="true">
          {RINGS.map((i) => (
            <span key={i} />
          ))}
        </div>

        <header className="desk-page-head">
          <span className="desk-date">
            <Sparkle size={16} color="var(--accent)" />
            {formatDayLong(day)}
          </span>
          <div className="desk-page-chips">
            <MoodChip mood={content.mood} onChange={session.setMood} readOnly={locked} />
            {content.scrapIds.length > 0 && (
              <span className="desk-scrap-count">
                {content.scrapIds.length} {content.scrapIds.length === 1 ? 'scrap' : 'scraps'}
              </span>
            )}
          </div>
        </header>

        <input
          className="desk-title"
          value={content.title}
          onChange={(e) => session.setTitle(e.target.value)}
          placeholder={readOnly ? 'Untitled' : 'Give the day a title'}
          aria-label="Page title"
          readOnly={locked}
          maxLength={120}
        />

        <EditorContent editor={editor} className="desk-editor" />

        <StickerLayer uid={uid} session={session} interactive={!locked} />

        <footer className="desk-page-foot">
          <span role="status">{statusText(session, timezone)}</span>
          <span>{words === 1 ? '1 word' : `${words} words`}</span>
        </footer>
      </article>
    </PageScaler>
  );
}
