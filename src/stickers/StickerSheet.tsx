import { useRef, useState, type FormEvent } from 'react';
import { CameraIcon } from '../components/Icons';
import { PhotoError, preparePhoto, type PreparedPhoto } from '../data/photos';
import { PRESET_NAMES, PRESETS, PresetArt } from './presets';
import { WASHI, WASHI_NAMES, WashiStrip } from './washi';

type Tab = 'stickers' | 'washi';

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

/** The sticker sheet: presets, washi, and photos added at the desk. */
export default function StickerSheet({
  onSticker,
  onWashi,
  onPhoto,
  onLink,
}: {
  onSticker: (name: string) => void;
  onWashi: (name: string) => void;
  onPhoto: (photo: PreparedPhoto) => void;
  onLink: (url: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('stickers');
  const [busy, setBusy] = useState<'photo' | 'link' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy('photo');
    try {
      onPhoto(await preparePhoto(file));
    } catch (err) {
      setError(err instanceof PhotoError ? err.message : 'That picture couldn’t be read. Try another one.');
    } finally {
      setBusy(null);
    }
  }

  async function addLink(e: FormEvent) {
    e.preventDefault();
    if (!link.trim()) return;
    setError(null);
    setBusy('link');
    try {
      onLink(await checkImageLink(link));
      setLink('');
    } catch (err) {
      setError(err instanceof PhotoError ? err.message : 'That link didn’t work.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="sheet" aria-labelledby="sheet-heading">
      <h2 id="sheet-heading">Sticker sheet</h2>
      <div className="sheet-tabs" role="group" aria-label="Sticker sheet sections">
        {(['stickers', 'washi'] as const).map((t) => (
          <button key={t} type="button" className="sheet-tab" aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === 'stickers' ? 'Stickers' : 'Washi'}
          </button>
        ))}
      </div>

      {tab === 'stickers' ? (
        <div className="sheet-grid">
          {PRESET_NAMES.map((n) => (
            <button key={n} type="button" className="sheet-item" aria-label={`Add ${PRESETS[n].label.toLowerCase()} sticker`} onClick={() => onSticker(n)}>
              <span className="sheet-art" style={{ aspectRatio: `${PRESETS[n].w} / ${PRESETS[n].h}` }}>
                <PresetArt name={n} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="sheet-grid sheet-grid-washi">
          {WASHI_NAMES.map((n) => (
            <button key={n} type="button" className="sheet-item" aria-label={`Add ${WASHI[n].label.toLowerCase()}`} onClick={() => onWashi(n)}>
              <span className="sheet-washi">
                <WashiStrip name={n} />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="sheet-photo">
        <h3 className="field-label">Add photo</h3>
        <button
          type="button"
          className="btn btn-primary sheet-photo-btn"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
        >
          <CameraIcon />
          {busy === 'photo' ? 'Shrinking photo…' : 'From this device'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void pickPhoto(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <form className="sheet-link" onSubmit={addLink}>
          <label htmlFor="sheet-link-input" className="label">
            Or paste an image link
          </label>
          <div className="sheet-link-row">
            <input
              id="sheet-link-input"
              type="url"
              inputMode="url"
              placeholder="https://i.imgur.com/…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <button type="submit" className="btn btn-quiet" disabled={busy !== null || !link.trim()}>
              {busy === 'link' ? 'Checking…' : 'Add'}
            </button>
          </div>
          <p className="sheet-note">A linked picture loads from its host each time, so it’s only as private as that site.</p>
        </form>
        {error && (
          <p className="sheet-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
