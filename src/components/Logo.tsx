import { Link } from 'react-router-dom';

/** The board's crescent-and-flame mark. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M19 3C11 4 6 10 6 17c0 7 6 12 13 11-5-2-8-7-8-12 0-5 3-10 8-13z" fill="#D9B46A" />
      <path d="M23 12c2 2 3 4 2 6.5-.6 1.6-2.2 2.5-3.6 2.2 1.4-1.2 1.4-3 .2-4.4.2 1.5-.6 2.4-1.5 2.6.4-2.2 1-4.6 2.9-6.9z" fill="#E8742A" />
    </svg>
  );
}

/** Mark and wordmark: Daybook in Cormorant italic gold. Goes to today's page. */
export default function Logo({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return (
    <Link to="/" className={`logo logo-${size}`}>
      <Mark size={size === 'lg' ? 30 : 24} />
      <span className="logo-word">Daybook</span>
    </Link>
  );
}
