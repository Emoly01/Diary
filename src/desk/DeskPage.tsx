import { EditorContent } from '@tiptap/react';
import PageScaler from '../components/PageScaler';
import Polaroid from '../components/Polaroid';
import MoodChip from '../components/MoodChip';
import Sparkle from '../components/stickers/Sparkle';
import { formatClock, formatDayLong } from '../data/day';
import { stickerBottom, type PageSession } from './usePageSession';

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
}: {
  uid: string;
  day: string;
  session: PageSession;
  timezone: string;
  readOnly: boolean;
}) {
  const { content, editor } = session;
  // Nothing is editable until the saved page is on screen, or it would be overwritten.
  const locked = readOnly || session.status.kind === 'loading';
  const minHeight = Math.max(MIN_HEIGHT, ...content.stickers.map((s) => stickerBottom(s) + 60));
  const words = session.wordCount;

  return (
    <PageScaler>
      <article className="page-surface desk-page" style={{ minHeight }} aria-label={`Page for ${formatDayLong(day)}`}>
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

        <div className="desk-stickers">
          {content.stickers.map((s) => (s.kind === 'photo' ? <Polaroid key={s.id} uid={uid} sticker={s} /> : null))}
        </div>

        <footer className="desk-page-foot">
          <span role="status">{statusText(session, timezone)}</span>
          <span>{words === 1 ? '1 word' : `${words} words`}</span>
        </footer>
      </article>
    </PageScaler>
  );
}
