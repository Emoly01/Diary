import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PAGE_WIDTH } from '../data/pages';

// Room for the spiral rings, which stick out past the page's left edge.
const GUTTER = 22;

/**
 * Lays the page out at its fixed logical width and scales it to the space
 * available, so text wraps identically and stickers stay put on every screen.
 */
export default function PageScaler({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const s = Math.min(1, (o.clientWidth - GUTTER) / PAGE_WIDTH);
      setScale(s > 0 ? s : 1);
      setHeight(i.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="page-scaler" style={{ height: height * scale }}>
      <div
        ref={inner}
        className="page-scaler-inner"
        style={{ width: PAGE_WIDTH, transform: `scale(${scale})`, left: GUTTER }}
      >
        {children}
      </div>
    </div>
  );
}
