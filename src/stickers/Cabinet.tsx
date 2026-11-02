import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CloseIcon, PhotoIcon, PlusIcon } from '../components/Icons';
import {
  addCustomStickers,
  byPack,
  picturesIn,
  putAway,
  StickerError,
  useCustomStickers,
  type AddResult,
  type CustomSticker,
} from '../data/customStickers';
import { PhotoError } from '../data/photos';
import CustomArt from './CustomArt';
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

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function addedMessage(r: AddResult): string {
  const parts: string[] = [];
  if (r.added) parts.push(`${plural(r.added, 'sticker')} added${r.packs.length === 1 ? ` to ${r.packs[0]}` : ''}.`);
  if (r.already) parts.push(`${r.already} ${r.already === 1 ? 'was' : 'were'} already in the drawer.`);
  if (!r.added && !r.already && !r.failed.length) parts.push('No pictures in there.');
  return parts.join(' ');
}

/** One pack: its stickers under its name, and a way to put the whole pack away. */
function Pack({
  uid,
  pack,
  stickers,
  onCustom,
}: {
  uid: string;
  pack: string;
  stickers: CustomSticker[];
  onCustom: (s: CustomSticker) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const headingId = useId();
  return (
    <section className="cabinet-pack" aria-labelledby={headingId}>
      <div className="cabinet-pack-head">
        <h3 id={headingId}>{pack}</h3>
        <span className="cabinet-pack-count">{stickers.length}</span>
        {confirming ? (
          <span className="cabinet-pack-confirm">
            <span>Put all {stickers.length} away? Pages keep the ones they have.</span>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => void putAway(uid, stickers.map((s) => s.id)).catch((err) => console.error(err))}
            >
              Put away
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setConfirming(false)}>
              Keep
            </button>
          </span>
        ) : (
          <button type="button" className="cabinet-pack-away" onClick={() => setConfirming(true)}>
            Put away
          </button>
        )}
      </div>
      <ul className="cabinet-grid cabinet-grid-mine">
        {stickers.map((s) => (
          <li key={s.id}>
            <button type="button" className="cabinet-item" aria-label={`Add ${pack} sticker ${s.name}`} onClick={() => onCustom(s)}>
              <span className="cabinet-art cabinet-art-mine">
                <CustomArt uid={uid} photoId={s.photoId} name={s.name} />
              </span>
              {/\D/.test(s.name) && <span className="cabinet-caption">{s.name}</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Mine": the owner's own sticker packs, and photos from the device or by link. */
function Mine({
  uid,
  onCustom,
  onLink,
  onPickPhoto,
  busy,
}: {
  uid: string;
  onCustom: (s: CustomSticker) => void;
  onLink: (url: string) => void;
  onPickPhoto: () => void;
  busy: boolean;
}) {
  const mine = useCustomStickers(uid);
  const stickers = mine.status === 'ready' ? mine.stickers : [];
  const [link, setLink] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ done: number; total: number } | null>(null);
  const [added, setAdded] = useState<AddResult | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const packInput = useRef<HTMLInputElement>(null);
  const id = useId();

  async function addPack(files: File[]) {
    if (!files.length) return;
    setAdded(null);
    setAddError(null);
    setAdding({ done: 0, total: 0 });
    try {
      const pictures = await picturesIn(files);
      const known = new Set(stickers.map((s) => s.id));
      setAdded(await addCustomStickers(uid, pictures, known, (done, total) => setAdding({ done, total })));
    } catch (err) {
      console.error(err);
      setAddError(err instanceof StickerError ? err.message : 'Those couldn’t be added. Try again?');
    } finally {
      setAdding(null);
    }
  }

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
      <div className="cabinet-add">
        <button type="button" className="btn btn-quiet" onClick={() => packInput.current?.click()} disabled={!!adding}>
          <PlusIcon />
          {adding ? (adding.total ? `Adding ${adding.done} of ${adding.total}…` : 'Opening…') : 'Add stickers'}
        </button>
        <p className="cabinet-note">A sticker pack’s zip, or the pictures themselves. They stay in the book, behind the lock.</p>
        <input
          ref={packInput}
          type="file"
          multiple
          accept=".zip,application/zip,image/png,image/webp,image/gif,image/jpeg"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void addPack(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
      </div>
      <div aria-live="polite">
        {added && <p className="cabinet-note">{addedMessage(added)}</p>}
        {added?.failed.length ? (
          <p className="cabinet-error">
            {plural(added.failed.length, 'picture')} left out: {added.failed.slice(0, 3).join(' ')}
            {added.failed.length > 3 && ' …'}
          </p>
        ) : null}
      </div>
      {addError && (
        <p className="cabinet-error" role="alert">
          {addError}
        </p>
      )}

      {mine.status === 'error' && (
        <p className="cabinet-error" role="alert">
          Your stickers couldn’t be opened just now.
        </p>
      )}
      {byPack(stickers).map((g) => (
        <Pack key={g.pack} uid={uid} pack={g.pack} stickers={g.stickers} onCustom={onCustom} />
      ))}

      <section className="cabinet-photos" aria-labelledby={`${id}-photos`}>
        <h3 id={`${id}-photos`} className="cabinet-photos-heading">
          Photos
        </h3>
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
      </section>
    </div>
  );
}

/**
 * The cabinet: a parchment drawer above the inkwell tray, styled like the
 * cabinet board, with every preset and tape under its name. Tap to add.
 */
export default function Cabinet({
  uid,
  tab,
  onTab,
  onSticker,
  onWashi,
  onCustom,
  onLink,
  onPickPhoto,
  photoBusy,
  onClose,
}: {
  uid: string;
  tab: CabinetTab;
  onTab: (tab: CabinetTab) => void;
  onSticker: (name: string) => void;
  onWashi: (name: string) => void;
  onCustom: (s: CustomSticker) => void;
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
          <Mine uid={uid} onCustom={onCustom} onLink={onLink} onPickPhoto={onPickPhoto} busy={photoBusy} />
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
