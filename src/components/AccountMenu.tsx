import { useState } from 'react';
import { useAuth, useOwner } from '../auth/AuthProvider';
import { exportBook } from '../data/memory';
import { saveDayStart, useSettings } from '../data/settings';
import { bookDay } from '../data/day';
import { SignOutIcon } from './Icons';
import SlideOver from './SlideOver';
import './AccountMenu.css';

type ExportState =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'done'; name: string; counts: string; partial: boolean }
  | { kind: 'error' };

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** The account button, and the settings sheet it opens. */
export default function AccountMenu() {
  const user = useOwner();
  const { signOut } = useAuth();
  const settings = useSettings(user.uid);
  const [open, setOpen] = useState(false);
  const [exp, setExp] = useState<ExportState>({ kind: 'idle' });

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();

  async function runExport() {
    setExp({ kind: 'working' });
    try {
      const file = await exportBook(user.uid);
      const name = `daybook-${bookDay(new Date(), settings.dayStartsAt, settings.timezone)}.json`;
      const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setExp({
        kind: 'done',
        name,
        counts: `${plural(file.pages.length, 'page')}, ${plural(file.scraps.length, 'scrap')}, ${plural(file.photos.length, 'photo')}`,
        partial: !file.fromServer,
      });
    } catch (err) {
      console.error(err);
      setExp({ kind: 'error' });
    }
  }

  return (
    <>
      <button type="button" className="account-button" aria-label="Account and settings" aria-expanded={open} onClick={() => setOpen(true)}>
        {initial}
      </button>
      {open && (
        <SlideOver side="right" label="settings-heading" closeLabel="Close settings" onClose={() => setOpen(false)} variant="page">
          <div className="settings">
            <h2 id="settings-heading">Settings</h2>
            {(user.displayName || user.email) && (
              <div className="settings-who">
                {user.displayName && <strong>{user.displayName}</strong>}
                {user.email && <span className="label">{user.email}</span>}
              </div>
            )}

            <section className="settings-block">
              <label htmlFor="day-start" className="field-label">
                Day starts at
              </label>
              <input
                id="day-start"
                type="time"
                className="settings-time"
                value={settings.dayStartsAt}
                onChange={(e) => {
                  if (/^\d{2}:\d{2}$/.test(e.target.value)) void saveDayStart(user.uid, e.target.value);
                }}
              />
              <p className="settings-hint">Anything caught before this time counts as the day before.</p>
            </section>

            <section className="settings-block">
              <h3 className="field-label">Your book</h3>
              <button type="button" className="btn btn-ember settings-export" onClick={runExport} disabled={exp.kind === 'working'}>
                <DownloadIcon />
                {exp.kind === 'working' ? 'Copying it out…' : 'Copy out the whole book'}
              </button>
              <p className="settings-hint" role="status">
                {exp.kind === 'idle' && 'One JSON file with every page, scrap and photo.'}
                {exp.kind === 'done' && `Downloaded ${exp.name}: ${exp.counts}.`}
                {exp.kind === 'error' && 'The export didn’t work. Try again in a moment.'}
              </p>
              {exp.kind === 'done' && exp.partial && (
                <p className="settings-warn">
                  Some of it came from this device’s offline copy. Export again when you’re online to be sure nothing is missing.
                </p>
              )}
            </section>

            <button type="button" className="btn btn-quiet settings-signout" onClick={() => void signOut()}>
              <SignOutIcon />
              Close the book
            </button>
          </div>
        </SlideOver>
      )}
    </>
  );
}
