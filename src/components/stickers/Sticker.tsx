import type { CSSProperties, ReactNode } from 'react';

export type StickerProps = {
  size?: number;
  /** Degrees. Stickers sit slightly tilted. */
  tilt?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Die-cut sticker frame: a 100×100 viewBox with the lilac drop shadow.
 * Each sticker draws its outline twice, once stroked white (the die-cut
 * edge) and once in colour on top.
 */
export function Sticker({
  size = 64,
  tilt = 0,
  className,
  style,
  children,
}: StickerProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ transform: `rotate(${tilt}deg)`, filter: 'var(--shadow-sticker)', ...style }}
    >
      {children}
    </svg>
  );
}
