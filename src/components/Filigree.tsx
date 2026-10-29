/**
 * The board's art nouveau corner piece, drawn for the top left and mirrored
 * with scale(±1, ±1) for the others. Used on the open book and the closed one.
 */
export default function Filigree({ at, size = 78 }: { at: 'tl' | 'tr' | 'bl' | 'br'; size?: number }) {
  return (
    <svg viewBox="0 0 90 90" width={size} height={size} aria-hidden="true" className={`filigree filigree-${at}`}>
      <g fill="none" stroke="#D9B46A" strokeLinecap="round">
        <path d="M4 86V30C4 14 14 4 30 4h56" strokeWidth="1.4" />
        <path d="M18 20c12 2 16 14 8 20-6 4-12-2-8-8 4-6 13-2 11 6" strokeWidth="1.2" />
      </g>
      <path d="M44 4c6 7 6 14 0 18-6-4-6-11 0-18z" fill="#D9B46A" opacity="0.85" />
      <path d="M4 44c7 6 14 6 18 0-4-6-11-6-18 0z" fill="#D9B46A" opacity="0.85" />
      <circle cx="18" cy="20" r="2.4" fill="#E8742A" />
    </svg>
  );
}

export const FILIGREE_CORNERS = ['tl', 'tr', 'bl', 'br'] as const;
