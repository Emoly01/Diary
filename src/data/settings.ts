import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { settingsDoc } from './paths';
import { DEFAULT_DAY_STARTS_AT, deviceTimezone, safeTimezone } from './day';

export type Settings = { dayStartsAt: string; timezone: string };

export const defaultSettings = (): Settings => ({
  dayStartsAt: DEFAULT_DAY_STARTS_AT,
  timezone: deviceTimezone(),
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
          });
        },
        () => setSettings(defaultSettings()),
      ),
    [uid],
  );

  return settings;
}
