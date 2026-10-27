import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
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
