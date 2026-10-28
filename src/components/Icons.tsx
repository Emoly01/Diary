// Inline stroke icons. Never emoji.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.2}>
      <rect x="5" y="11" width="14" height="10" rx="3" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function TrayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M4 13l2.5-7h11l2.5 7v6H4z" />
      <path d="M4 13h5l1 2h4l1-2h5" />
    </svg>
  );
}

export function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

export function SignOutIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M15 8l4 4-4 4M19 12H9" />
    </svg>
  );
}

export function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function TuckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.2}>
      <path d="M12 3v11M7 9l5 5 5-5M4 15v5h16v-5" />
    </svg>
  );
}

export function CheckIcon({ size = 13 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={3}>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.4}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  );
}

/** A small cloud with an arrow: saved here, not yet synced. */
export function PendingIcon({ size = 14 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.2}>
      <path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 9a4.5 4.5 0 0 1 .5 9" />
      <path d="M12 12v7M9.5 16.5L12 19l2.5-2.5" />
    </svg>
  );
}
