import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import Cover from '../components/Cover';
import { LockIcon } from '../components/Icons';
import './Gate.css';

export default function SignIn() {
  const { signIn, signInError } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await signIn();
    setBusy(false);
  }

  return (
    <main className="gate">
      <Cover />
      <div className="gate-copy">
        <h1>Your desk is waiting.</h1>
        <p>Private by design. Only your account can open this book.</p>
      </div>
      <div className="gate-actions">
        <button type="button" className="btn gate-google" onClick={handleClick} disabled={busy}>
          <LockIcon />
          Continue with Google
        </button>
        {signInError && (
          <p className="gate-error" role="alert">
            {signInError}
          </p>
        )}
        <span className="label">one account · one book</span>
      </div>
    </main>
  );
}
