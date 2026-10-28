import { useEffect, useState } from 'react';
import { onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { settingsDoc } from './paths';
import { DEFAULT_DAY_STARTS_AT, deviceTimezone, safeTimezone } from './day';

export type Settings = {
  dayStartsAt: string;
  timezone: string;
  /** When the book was first opened, if known. */
  startedAt: Date | null;
};

export const defaultSettings = (): Settings => ({
  dayStartsAt: DEFAULT_DAY_STARTS_AT,
  timezone: deviceTimezone(),
  startedAt: null,
});

/** Live settings, with defaults until (or unless) the document exists. */
export function useSettings(uid: string): Settings {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(
    () =>
      onSnapshot(
        settingsDoc(uid),
        (snap) => {
          const data = snap.data();
          setSettings({
            dayStartsAt: typeof data?.dayStartsAt === 'string' ? data.dayStartsAt : DEFAULT_DAY_STARTS_AT,
            timezone: safeTimezone(typeof data?.timezone === 'string' ? data.timezone : undefined),
            startedAt: data?.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
          });
        },
        () => setSettings(defaultSettings()),
      ),
    [uid],
  );

  return settings;
}

/** Saves when the day rolls over ("HH:MM"). Queued offline like any write. */
export function saveDayStart(uid: string, hhmm: string): Promise<void> {
  return setDoc(settingsDoc(uid), { dayStartsAt: hhmm }, { merge: true });
}
