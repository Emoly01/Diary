import type { CSSProperties } from 'react';

/** A flat four-point glint, no die-cut edge. */
export default function Sparkle({
  size = 16,
  color = '#FFFFFF',
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style}>
      <path d="M12 2C13 9 15 11 22 12C15 13 13 15 12 22C11 15 9 13 2 12C9 11 11 9 12 2Z" fill={color} />
    </svg>
  );
}
