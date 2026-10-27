import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth, firebaseConfigured, googleProvider, ownerUid } from '../firebase';

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'owner'; user: User }
  // A non-owner signed in. They've already been signed out; `uid` is kept
  // only so the Locked screen can show it while no owner is configured.
  | { status: 'locked'; uid: string };

type AuthContextValue = {
  state: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Leave the Locked screen and go back to the cover. */
  dismissLocked: () => void;
  signInError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(
    firebaseConfigured ? { status: 'loading' } : { status: 'signedOut' },
  );
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Keep the Locked screen up after we sign the intruder out.
        setState((prev) => (prev.status === 'locked' ? prev : { status: 'signedOut' }));
        return;
      }
      if (ownerUid && user.uid === ownerUid) {
        setState({ status: 'owner', user });
      } else {
        setState({ status: 'locked', uid: user.uid });
        void fbSignOut(auth);
      }
    });
  }, []);

  const signIn = useCallback(async () => {
    setSignInError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      if (code === 'auth/popup-blocked') {
        setSignInError('The sign-in window was blocked. Allow pop-ups for this site and try again.');
      } else if (code === 'auth/network-request-failed') {
        setSignInError('No connection. Sign-in needs the internet once; after that the book works offline.');
      } else {
        setSignInError('Sign-in didn’t work. Try again in a moment.');
        console.error(err);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  const dismissLocked = useCallback(() => setState({ status: 'signedOut' }), []);

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, dismissLocked, signInError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** The signed-in owner. Only call below <RequireOwner>. */
export function useOwner(): User {
  const { state } = useAuth();
  if (state.status !== 'owner') throw new Error('useOwner called without a signed-in owner');
  return state.user;
}
