import { useEffect, useId, useRef, useState } from 'react';
import { useAuth, useOwner } from '../auth/AuthProvider';
import { SignOutIcon } from './Icons';

/** The account button. Grows into the settings sheet in phase 5. */
export default function AccountMenu() {
  const user = useOwner();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="account" ref={rootRef}>
      <button
        type="button"
        className="account-button"
        aria-label="Account"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        {initial}
      </button>
      {open && (
        <div className="account-menu" id={menuId}>
          <div className="account-who">
            <strong>{user.displayName}</strong>
            <span className="label">{user.email}</span>
          </div>
          <button type="button" className="btn btn-quiet" onClick={() => void signOut()}>
            <SignOutIcon />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
