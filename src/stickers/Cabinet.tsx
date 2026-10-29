import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CloseIcon, PhotoIcon } from '../components/Icons';
import { PhotoError } from '../data/photos';
import { GROUPS, PRESETS, presetsIn, PresetArt, type PresetGroup } from './presets';
import { WASHI, WASHI_NAMES, WashiStrip } from './washi';

export type CabinetTab = PresetGroup | 'washi' | 'mine';

const TABS: { id: CabinetTab; title: string }[] = [
  ...GROUPS.map((g) => ({ id: g.id, title: g.id === 'hearth' ? 'Hearth' : g.title })),
  { id: 'washi', title: 'Washi' },
  { id: 'mine', title: 'Mine' },
];

/** Accepts only https links that load as a picture. */
export async function checkImageLink(raw: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new PhotoError('That doesn’t look like a link.');
  }
  if (url.protocol !== 'https:') throw new PhotoError('Use an https:// link.');
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    const t = window.setTimeout(() => reject(new PhotoError('That link took too long to load.')), 10_000);
    img.onload = () => {
      window.clearTimeout(t);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(t);
      reject(
        new PhotoError('That link isn’t a picture. Use the image’s own link: it usually ends in .jpg or .png.'),
      );
    };
    img.src = url.href;
  });
  return url.href;
}

/** "Mine": photos by link for now; the owner's own stickers come later. */
function Mine({ onLink, onPickPhoto, busy }: { onLink: (url: string) => void; onPickPhoto: () => void; busy: boolean }) {
  const [link, setLink] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function addLink(e: FormEvent) {
    e.preventDefault();
    if (!link.trim()) return;
    setError(null);
    setChecking(true);
    try {
      onLink(await checkImageLink(link));
      setLink('');
    } catch (err) {
      setError(err instanceof PhotoError ? err.message : 'That link didn’t work.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="cabinet-mine">
      <p className="cabinet-note">Your own stickers will live here. For now, photos.</p>
      <button type="button" className="btn btn-quiet" onClick={onPickPhoto} disabled={busy}>
        <PhotoIcon />
        {busy ? 'Shrinking photo…' : 'A photo from this device'}
      </button>
      <form className="cabinet-link" onSubmit={addLink}>
        <label htmlFor={id} className="label">
          Or paste an image link
        </label>
        <div className="cabinet-link-row">
          <input
            id={id}
            type="url"
            inputMode="url"
            placeholder="https://i.imgur.com/…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="submit" className="btn btn-quiet" disabled={checking || !link.trim()}>
            {checking ? 'Checking…' : 'Add'}
          </button>
        </div>
        <p className="cabinet-note">A linked picture loads from its host each time, so it’s only as private as that site.</p>
      </form>
      {error && (
        <p className="cabinet-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The cabinet: a parchment drawer above the inkwell tray, styled like the
 * cabinet board, with every preset and tape under its name. Tap to add.
 */
export default function Cabinet({
  tab,
  onTab,
  onSticker,
  onWashi,
  onLink,
  onPickPhoto,
  photoBusy,
  onClose,
}: {
  tab: CabinetTab;
  onTab: (tab: CabinetTab) => void;
  onSticker: (name: string) => void;
  onWashi: (name: string) => void;
  onLink: (url: string) => void;
  onPickPhoto: () => void;
  photoBusy: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <section className="cabinet" role="dialog" aria-labelledby="cabinet-heading">
      <div className="cabinet-head">
        <h2 id="cabinet-heading">The cabinet</h2>
        <button ref={closeRef} type="button" className="cabinet-close" aria-label="Close the cabinet" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="cabinet-tabs" role="group" aria-label="Cabinet drawers">
        {TABS.map((t) => (
          <button key={t.id} type="button" className="cabinet-tab" aria-pressed={tab === t.id} onClick={() => onTab(t.id)}>
            {t.title}
          </button>
        ))}
      </div>

      <div className="cabinet-body">
        {tab === 'washi' ? (
          <ul className="cabinet-grid cabinet-grid-washi">
            {WASHI_NAMES.map((n) => (
              <li key={n}>
                <button type="button" className="cabinet-item" aria-label={`Add ${WASHI[n].label.toLowerCase()}`} onClick={() => onWashi(n)}>
                  <span className="cabinet-washi">
                    <WashiStrip name={n} length={220} />
                  </span>
                  <span className="cabinet-caption">{WASHI[n].caption}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : tab === 'mine' ? (
          <Mine onLink={onLink} onPickPhoto={onPickPhoto} busy={photoBusy} />
        ) : (
          <ul className={`cabinet-grid${tab === 'words' ? ' cabinet-grid-words' : ''}`}>
            {presetsIn(tab).map((n) => {
              const p = PRESETS[n];
              return (
                <li key={n}>
                  <button type="button" className="cabinet-item" aria-label={`Add ${p.label.toLowerCase()} sticker`} onClick={() => onSticker(n)}>
                    <span className="cabinet-art" style={{ aspectRatio: `${p.w} / ${p.h}`, transform: `rotate(${p.tilt}deg)` }}>
                      <PresetArt name={n} />
                    </span>
                    <span className="cabinet-caption">{p.caption}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
