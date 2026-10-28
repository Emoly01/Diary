import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { firebaseConfigured } from '../firebase';
import SignIn from '../screens/SignIn';
import Locked from '../screens/Locked';
import Setup from '../screens/Setup';

/** Renders children only for the owner; everyone else sees the cover or the lock. */
export default function RequireOwner({ children }: { children: ReactNode }) {
  const { state } = useAuth();

  if (!firebaseConfigured) return <Setup />;

  switch (state.status) {
    case 'loading':
      return <div className="boot" aria-busy="true" aria-label="Opening your book" />;
    case 'signedOut':
      return <SignIn />;
    case 'locked':
      return <Locked uid={state.uid} />;
    case 'owner':
      return <>{children}</>;
  }
}
