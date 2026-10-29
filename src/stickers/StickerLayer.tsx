import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useDrag, useGesture } from '@use-gesture/react';
import type { Sticker } from '../data/pages';
import Polaroid from '../components/Polaroid';
import { usePageScale } from '../components/PageScaler';
import { CloseIcon } from '../components/Icons';
import { PresetArt, presetFor } from './presets';
import { resolveWashi, WASHI, WashiStrip } from './washi';
import { baseSize, clampScale, normaliseAngle } from './geometry';
import type { PageSession } from '../desk/usePageSession';

export function stickerLabel(s: Sticker): string {
  switch (s.kind) {
    case 'preset':
      return `${presetFor(s.ref).label} sticker`;
    case 'washi':
      return WASHI[resolveWashi(s.ref)].label;
    case 'link':
      return 'Linked photo';
    default:
      return 'Photo';
  }
}

function Art({ uid, s }: { uid: string; s: Sticker }) {
  switch (s.kind) {
    case 'preset':
      return <PresetArt name={s.ref} />;
    case 'washi':
      return <WashiStrip name={s.ref} />;
    case 'link':
      return <Polaroid uid={uid} url={s.ref} />;
    default:
      return <Polaroid uid={uid} photoId={s.ref} />;
  }
}

const RotateIcon = () => (
  <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />
  </svg>
);
const ScaleIcon = () => (
  <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
);

/** One sticker. Drag to move, pinch to scale and turn, handles when selected. */
function StickerItem({ uid, s, session, interactive }: { uid: string; s: Sticker; session: PageSession; interactive: boolean }) {
  const pageScale = usePageScale();
  const box = useRef<HTMLDivElement>(null);
  const hit = useRef<HTMLButtonElement>(null);
  const live = useRef(s);
  live.current = s;
  const start = useRef(s);
  const selected = interactive && session.selected === s.id;

  const { w, h } = baseSize(s);
  // Handles keep 44 screen px whatever the page's zoom.
  const handle = 44 / pageScale;
  // Thin or tiny stickers (washi tape, a shrunk sparkle) get an invisible hit area of at least 44 px.
  const padX = Math.max(0, (handle - w * s.scale) / 2);
  const padY = Math.max(0, (handle - h * s.scale) / 2);

  const pick = () => {
    session.select(s.id);
    hit.current?.focus({ preventScroll: true });
  };

  const bind = useGesture(
    {
      onDragStart: () => {
        start.current = live.current;
        pick();
      },
      onDrag: ({ xy: [px, py], initial: [ix, iy], pinching, tap, cancel }) => {
        if (pinching) return cancel();
        if (tap) return;
        // From the pointer-down point, not `movement`: that skips the tap threshold's first pixels.
        const from = start.current;
        session.previewSticker({ ...from, x: from.x + (px - ix) / pageScale, y: from.y + (py - iy) / pageScale });
      },
      onDragEnd: ({ tap }) => {
        if (!tap) session.commitSticker(live.current);
      },
      onPinchStart: pick,
      onPinch: ({ offset: [scale, angle] }) =>
        session.previewSticker({ ...live.current, scale: clampScale(scale), rotation: normaliseAngle(angle) }),
      onPinchEnd: () => session.commitSticker(live.current),
    },
    {
      enabled: interactive,
      // keys: false, or use-gesture's own arrow-key dragging replaces our onKeyDown.
      drag: { filterTaps: true, keys: false },
      pinch: { from: () => [live.current.scale, live.current.rotation], scaleBounds: { min: 0.3, max: 4 } },
    },
  );

  const center = () => {
    const r = box.current!.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  };

  // The rotate handle sits above the sticker: the pointer's angle from the centre is the angle.
  const rotate = useDrag(
    ({ xy: [px, py], first, last, memo }) => {
      const c = (first ? center() : memo) as { cx: number; cy: number };
      const deg = (Math.atan2(py - c.cy, px - c.cx) * 180) / Math.PI + 90;
      const next = { ...live.current, rotation: normaliseAngle(deg) };
      if (last) session.commitSticker(next);
      else session.previewSticker(next);
      return c;
    },
    { enabled: selected },
  );

  // The scale handle sits at the corner: scale follows the pointer's distance from the centre.
  const resize = useDrag(
    ({ xy: [px, py], initial: [ix, iy], first, last, memo }) => {
      const m = (first ? { ...center(), scale: live.current.scale } : memo) as { cx: number; cy: number; scale: number };
      const d0 = Math.hypot(ix - m.cx, iy - m.cy) || 1;
      const d = Math.hypot(px - m.cx, py - m.cy);
      const next = { ...live.current, scale: Math.round(clampScale((m.scale * d) / d0) * 100) / 100 };
      if (last) session.commitSticker(next);
      else session.previewSticker(next);
      return m;
    },
    { enabled: selected },
  );

  function onKeyDown(e: KeyboardEvent) {
    const cur = live.current;
    const step = e.shiftKey ? 1 : 10;
    const moves: Record<string, Partial<Sticker>> = {
      ArrowLeft: { x: cur.x - step },
      ArrowRight: { x: cur.x + step },
      ArrowUp: { y: cur.y - step },
      ArrowDown: { y: cur.y + step },
      '[': { rotation: normaliseAngle(cur.rotation - 5) },
      ']': { rotation: normaliseAngle(cur.rotation + 5) },
      '-': { scale: clampScale(Math.round((cur.scale - 0.1) * 100) / 100) },
      '+': { scale: clampScale(Math.round((cur.scale + 0.1) * 100) / 100) },
      '=': { scale: clampScale(Math.round((cur.scale + 0.1) * 100) / 100) },
    };
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      session.removeSticker(cur.id);
    } else if (e.key === 'Escape') {
      session.select(null);
      hit.current?.blur();
    } else if (moves[e.key]) {
      e.preventDefault();
      session.select(cur.id);
      session.commitSticker({ ...cur, ...moves[e.key] });
    }
  }

  const style: CSSProperties = {
    left: s.x,
    top: s.y,
    width: w * s.scale,
    height: h * s.scale,
    zIndex: s.z + 1000,
    transform: `rotate(${s.rotation}deg)`,
  };

  if (!interactive) {
    return (
      <div className={`sticker sticker-${s.kind}`} style={style}>
        <Art uid={uid} s={s} />
      </div>
    );
  }

  return (
    <div ref={box} className={`sticker sticker-${s.kind}${selected ? ' is-selected' : ''}`} style={style}>
      <button
        ref={hit}
        type="button"
        className="sticker-hit"
        aria-label={stickerLabel(s)}
        aria-pressed={selected}
        style={{ inset: `${-padY}px ${-padX}px`, padding: `${padY}px ${padX}px` }}
        {...bind()}
        onKeyDown={onKeyDown}
        // Tabbing to a sticker selects it, so keyboard users get its handles and options too.
        onFocus={() => session.selected !== s.id && session.select(s.id)}
      >
        <Art uid={uid} s={s} />
      </button>
      {selected && (
        <>
          <button
            type="button"
            className="sticker-handle sticker-rotate"
            aria-label="Rotate (or press [ and ])"
            style={{ width: handle, height: handle, top: -handle * 1.25, left: `calc(50% - ${handle / 2}px)` }}
            {...rotate()}
          >
            <RotateIcon />
          </button>
          <button
            type="button"
            className="sticker-handle sticker-resize"
            aria-label="Resize (or press + and -)"
            style={{ width: handle, height: handle, right: -handle / 2, bottom: -handle / 2 }}
            {...resize()}
          >
            <ScaleIcon />
          </button>
          <button
            type="button"
            className="sticker-handle sticker-delete"
            aria-label={`Delete ${stickerLabel(s)}`}
            style={{ width: handle, height: handle, right: -handle / 2, top: -handle / 2 }}
            onClick={() => session.removeSticker(s.id)}
          >
            <CloseIcon size={Math.round(handle * 0.4)} />
          </button>
        </>
      )}
    </div>
  );
}

/** All stickers on the page, above the text. */
export default function StickerLayer({ uid, session, interactive }: { uid: string; session: PageSession; interactive: boolean }) {
  return (
    <div className="desk-stickers">
      {session.content.stickers.map((s) => (
        <StickerItem key={s.id} uid={uid} s={s} session={session} interactive={interactive} />
      ))}
    </div>
  );
}
