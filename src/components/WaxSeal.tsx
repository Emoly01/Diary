const CRESCENT = 'M45 26c-8 1-13 7-13 14s5 13 13 14c-5-3-7-8-7-14s2-11 7-14z';

/**
 * The board's wax seal: oxblood wax with a crescent pressed in. Broken, it's
 * split down the middle with the halves pulled apart.
 */
export default function WaxSeal({ broken = false, size = 58, className }: { broken?: boolean; size?: number; className?: string }) {
  if (!broken) {
    return (
      <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" className={className}>
        <circle cx="40" cy="40" r="32" fill="#8E2A14" filter="url(#db-wax)" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6E1E0E" strokeWidth="2" />
        <path d={CRESCENT} fill="#C2533A" />
      </svg>
    );
  }
  const crack = 'M40 4l-4 12 6 8-5 10 6 9-4 11 5 10-3 12';
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" className={className}>
      <defs>
        <clipPath id="db-seal-l">
          <path d={`M0 0H40${crack.slice(5)}L37 80H0z`} />
        </clipPath>
        <clipPath id="db-seal-r">
          <path d={`M80 0H40${crack.slice(5)}L37 80H80z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#db-seal-l)" transform="translate(-3 2) rotate(-6 40 40)">
        <circle cx="40" cy="40" r="32" fill="#8E2A14" filter="url(#db-wax)" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6E1E0E" strokeWidth="2" />
        <path d={CRESCENT} fill="#C2533A" />
      </g>
      <g clipPath="url(#db-seal-r)" transform="translate(4 -1) rotate(7 40 40)">
        <circle cx="40" cy="40" r="32" fill="#8E2A14" filter="url(#db-wax)" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#6E1E0E" strokeWidth="2" />
        <path d={CRESCENT} fill="#C2533A" />
      </g>
    </svg>
  );
}
