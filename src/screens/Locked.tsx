import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { ownerUid } from '../firebase';
import Cover from '../components/Cover';
import { CopyIcon } from '../components/Icons';
import './Gate.css';

/**
 * Shown when a signed-in account isn't the owner. A courtesy only:
 * the Firestore rules are what actually keep the book shut.
 */
export default function Locked({ uid }: { uid: string }) {
  const { dismissLocked } = useAuth();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="gate">
      <Cover locked />
      <div className="gate-copy">
        <h1>This book is locked.</h1>
        <p>It belongs to someone else, so you’ve been signed out.</p>
      </div>

      {/* Setup only: until VITE_OWNER_UID is set, show the UID to copy. */}
      {!ownerUid && (
        <div className="gate-uid">
          <span className="label">No owner set yet. This account’s ID:</span>
          <code>{uid}</code>
          <button type="button" className="btn btn-quiet gate-copy-btn" onClick={copy}>
            <CopyIcon />
            {copied ? 'Copied' : 'Copy ID'}
          </button>
        </div>
      )}

      <div className="gate-actions">
        <button type="button" className="btn btn-gold" onClick={dismissLocked}>
          Back to the cover
        </button>
      </div>
    </main>
  );
}
