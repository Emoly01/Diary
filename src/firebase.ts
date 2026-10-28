import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithCustomToken } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** False when the VITE_FIREBASE_* env vars haven't been set yet. */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

/** The owner's UID. Empty until it's copied in after the first sign-in. */
export const ownerUid: string = (env.VITE_OWNER_UID ?? '').trim();

// Placeholder values keep initialisation from throwing when unconfigured;
// the app shows a setup screen instead of using these.
const app = initializeApp(
  firebaseConfigured ? config : { apiKey: 'unset', projectId: 'unset', appId: 'unset' },
);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Offline-first: writes queue in IndexedDB and sync on reconnect, across tabs.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Local development against the Firebase emulators (`npm run emulators`,
// then `npm run dev:emulator`). Never set in production.
if (import.meta.env.VITE_USE_EMULATORS === '1') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);

  // Test hook: sign in as any emulator user without the Google popup. The
  // auth emulator accepts unsigned custom tokens. Stripped from real builds.
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  const AUD = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';
  window.daybookEmulatorSignIn = (uid: string) => {
    const iat = Math.floor(Date.now() / 1000);
    const claims = { aud: AUD, iat, exp: iat + 3600, iss: 'emulator', sub: 'emulator', uid };
    return signInWithCustomToken(auth, `${b64({ alg: 'none', typ: 'JWT' })}.${b64(claims)}.`).then(() => {});
  };
}

declare global {
  interface Window {
    daybookEmulatorSignIn?: (uid: string) => Promise<void>;
  }
}
