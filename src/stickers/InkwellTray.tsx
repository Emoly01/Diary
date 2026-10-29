import { useCallback, useEffect, useRef, useState } from 'react';
import { CabinetIcon, MyStickersIcon, PhotoIcon } from '../components/Icons';
import { PhotoError, preparePhoto, type PreparedPhoto } from '../data/photos';
import Cabinet, { type CabinetTab } from './Cabinet';
import { PRESETS, PresetArt } from './presets';
import { useRecentStickers } from './recent';

/**
 * The inkwell tray: a dark pill on the cover's bottom edge with five recent
 * stickers, washi, my stickers, the cabinet and "Photo". The cabinet opens
 * as a drawer above it. Anything added lands in the middle of the page in
 * view, and the drawer closes so it can be seen.
 */
export default function InkwellTray({
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
  const [recent, remember] = useRecentStickers();
  const [drawer, setDrawer] = useState<CabinetTab | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setDrawer(null), []);

  // A press anywhere outside the tray and the drawer puts the drawer away.
  useEffect(() => {
    if (!drawer) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [drawer, close]);

  const sticker = (name: string) => {
    remember(name);
    onSticker(name);
    close();
  };

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onPhoto(await preparePhoto(file));
      close();
    } catch (err) {
      setError(err instanceof PhotoError ? err.message : 'That picture couldn’t be read. Try another one.');
    } finally {
      setBusy(false);
    }
  }

  const toggle = (tab: CabinetTab) => setDrawer((d) => (d === tab ? null : tab));

  return (
    <div className="inkwell" ref={root}>
      {drawer && (
        <Cabinet
          tab={drawer}
          onTab={setDrawer}
          onSticker={sticker}
          onWashi={(n) => {
            onWashi(n);
            close();
          }}
          onLink={(u) => {
            onLink(u);
            close();
          }}
          onPickPhoto={() => fileRef.current?.click()}
          photoBusy={busy}
          onClose={close}
        />
      )}
      {error && (
        <p className="inkwell-error" role="alert">
          {error}
        </p>
      )}
      <div className="inkwell-tray" role="toolbar" aria-label="Inkwell tray">
        {recent.map((n) => (
          <button key={n} type="button" className="inkwell-btn" aria-label={`Add ${PRESETS[n].label.toLowerCase()} sticker`} onClick={() => sticker(n)}>
            <span className="inkwell-art">
              <PresetArt name={n} />
            </span>
          </button>
        ))}
        <span className="inkwell-rule" aria-hidden="true" />
        <button type="button" className="inkwell-btn" aria-label="Washi tape" aria-expanded={drawer === 'washi'} onClick={() => toggle('washi')}>
          <span className="inkwell-washi" aria-hidden="true" />
        </button>
        <button type="button" className="inkwell-btn" aria-label="My stickers" aria-expanded={drawer === 'mine'} onClick={() => toggle('mine')}>
          <MyStickersIcon />
        </button>
        <button
          type="button"
          className="inkwell-pill inkwell-cabinet"
          aria-expanded={drawer !== null && drawer !== 'washi' && drawer !== 'mine'}
          onClick={() => toggle(drawer && drawer !== 'washi' && drawer !== 'mine' ? drawer : 'grimoire')}
        >
          <CabinetIcon />
          Cabinet
        </button>
        <button type="button" className="inkwell-pill inkwell-photo" onClick={() => fileRef.current?.click()} disabled={busy}>
          <PhotoIcon />
          {busy ? 'Shrinking…' : 'Photo'}
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
      </div>
    </div>
  );
}
