import { useEffect, useState } from 'react';
import { getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { settingsDoc } from './data/paths';
import { DEFAULT_DAY_STARTS_AT, deviceTimezone } from './data/day';

export type BookStatus = 'checking' | 'open' | 'offline' | 'denied';

/**
 * Opens `users/{uid}/settings/main`, creating it with defaults on first use.
 * It doubles as a live check of the rules: "denied" means the UID in
 * firestore.rules doesn't match the signed-in owner.
 */
export function useBookStatus(uid: string): BookStatus {
  const [status, setStatus] = useState<BookStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    const ref = settingsDoc(uid);

    (async () => {
      try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            dayStartsAt: DEFAULT_DAY_STARTS_AT,
            timezone: deviceTimezone(),
            createdAt: serverTimestamp(),
          });
        }
        if (!cancelled) setStatus('open');
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (cancelled) return;
        if (code === 'permission-denied') setStatus('denied');
        else if (code === 'unavailable') setStatus('offline');
        else {
          console.error(err);
          setStatus('offline');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  return status;
}
