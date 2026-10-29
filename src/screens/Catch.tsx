import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useOwner } from '../auth/AuthProvider';
import Logo from '../components/Logo';
import MoodPicker from '../components/MoodPicker';
import Photo from '../components/Photo';
import ScrapCard from '../components/ScrapCard';
import { WashiStrip } from '../stickers/washi';
import { CloseIcon, PhotoIcon, TrashIcon, TuckIcon } from '../components/Icons';
import { bookDay, formatClock, formatMoment } from '../data/day';
import type { Mood } from '../data/moods';
import { PhotoError, photoSrc, preparePhoto, type PreparedPhoto } from '../data/photos';
import {
  createScrap,
  deleteScrap,
  updateScrap,
  useDayScraps,
  useTrayScraps,
  type PhotoChange,
  type Scrap,
} from '../data/scraps';
import { useSettings } from '../data/settings';
import { useNow } from '../useNow';
import '../components/Shell.css';
import './Catch.css';

type PhotoState =
  | { kind: 'none' }
  /** Editing a scrap whose stored photo stays as it is. */
  | { kind: 'existing'; id: string }
  | { kind: 'preparing' }
  | { kind: 'ready'; photo: PreparedPhoto };

const WRITE_FAILED = 'That one didn’t save. Check you’re still signed in, then try again.';

export default function Catch() {
  const { uid } = useOwner();
  const settings = useSettings(uid);
  const now = useNow();
  const today = bookDay(now, settings.dayStartsAt, settings.timezone);
  const todayScraps = useDayScraps(uid, today);
  const tray = useTrayScraps(uid);

  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [photo, setPhoto] = useState<PhotoState>({ kind: 'none' });
  const [editing, setEditing] = useState<Scrap | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Bumped whenever the photo changes, so a slow compression can't land late.
  const photoJob = useRef(0);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const hasPhoto = photo.kind === 'ready' || photo.kind === 'existing';
  const canSave = photo.kind !== 'preparing' && (text.trim() !== '' || hasPhoto);

  function reset() {
    photoJob.current++;
    setText('');
    setMood(null);
    setPhoto({ kind: 'none' });
    setEditing(null);
    setConfirmDelete(false);
    textRef.current?.focus();
  }

  function failed(err: unknown) {
    console.error(err);
    setError(WRITE_FAILED);
  }

  function save(e?: FormEvent) {
    e?.preventDefault();
    if (!canSave) return;
    setError(null);
    const trimmed = text.trim();

    // Fire and forget: the write is queued locally at once and syncs whenever
    // there's a connection. Only a refusal comes back to us.
    if (editing) {
      const change: PhotoChange =
        photo.kind === 'existing'
          ? { kind: 'keep' }
          : photo.kind === 'ready'
            ? { kind: 'replace', photo: photo.photo }
            : editing.photoId
              ? { kind: 'remove' }
              : { kind: 'keep' };
      updateScrap(uid, editing, { text: trimmed, mood, photo: change }).catch(failed);
      setToast('Saved');
    } else {
      const photoToSave = photo.kind === 'ready' ? photo.photo : null;
      createScrap(uid, { text: trimmed, mood, photo: photoToSave }, settings).synced.catch(failed);
      setToast('Tucked in.');
    }
    reset();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // One line, then Enter tucks it in. Shift+Enter still makes a new line.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      save();
    }
  }

  async function onPickPhoto(file: File | undefined) {
    if (!file) return;
    const before = photo;
    const job = ++photoJob.current;
    setError(null);
    setPhoto({ kind: 'preparing' });
    try {
      const prepared = await preparePhoto(file);
      if (job === photoJob.current) setPhoto({ kind: 'ready', photo: prepared });
    } catch (err) {
      if (job !== photoJob.current) return;
      setPhoto(before);
      setError(err instanceof PhotoError ? err.message : 'That picture couldn’t be read. Try another one.');
    }
  }

  function removePhoto() {
    photoJob.current++;
    setPhoto({ kind: 'none' });
  }

  function startEdit(scrap: Scrap) {
    photoJob.current++;
    setEditing(scrap);
    setText(scrap.text);
    setMood(scrap.mood);
    setPhoto(scrap.photoId ? { kind: 'existing', id: scrap.photoId } : { kind: 'none' });
    setConfirmDelete(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    textRef.current?.focus();
  }

  function onDelete() {
    if (!editing) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteScrap(uid, editing).catch(failed);
    setToast('Deleted');
    reset();
  }

  return (
    <div className="catch">
      <header className="catch-header">
        <Logo size="sm" />
        <Link to="/" className="btn btn-gold" aria-label={`The pocket, ${tray.length} waiting`}>
          The pocket · {tray.length}
        </Link>
      </header>

      <div className="catch-heading">
        <h1 className="catch-title">{editing ? 'Fix it up' : 'Catch it'}</h1>
        <span className="label catch-when">{formatMoment(now, settings.timezone)}</span>
      </div>

      <form className="catch-card" onSubmit={save}>
        <span className="catch-washi" aria-hidden="true">
          <WashiStrip name="ember-stripe" length={120} />
        </span>
        <label htmlFor="catch-text" className="catch-label">
          {editing ? `Caught at ${formatClock(editing.capturedAt, settings.timezone)}` : 'What happened?'}
        </label>
        <textarea
          id="catch-text"
          ref={textRef}
          className="catch-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          enterKeyHint="done"
          autoComplete="off"
        />

        <div className="catch-photo-row">
          {photo.kind === 'ready' && (
            <span className="photo-frame" style={{ width: 48, height: 48 }}>
              <img src={photoSrc(photo.photo.data)} alt="Attached photo" />
            </span>
          )}
          {photo.kind === 'existing' && <Photo uid={uid} photoId={photo.id} alt="Attached photo" />}
          {photo.kind === 'preparing' && (
            <span className="photo-frame" style={{ width: 48, height: 48 }}>
              <span className="photo-placeholder catch-shrinking" />
            </span>
          )}

          <span className="label catch-photo-label" aria-live="polite">
            {photo.kind === 'preparing' ? 'Shrinking photo…' : hasPhoto ? '1 photo' : ''}
          </span>

          {hasPhoto && (
            <button type="button" className="btn btn-quiet catch-icon-btn" aria-label="Remove photo" onClick={removePhoto}>
              <CloseIcon />
            </button>
          )}
        </div>
      </form>

      <MoodPicker value={mood} onChange={setMood} />

      <div className="catch-photo-btn">
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => fileRef.current?.click()}
          disabled={photo.kind === 'preparing'}
        >
          <PhotoIcon />
          {hasPhoto ? 'Change photo' : 'Add photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void onPickPhoto(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <p className="catch-error" role="alert">
          {error}
        </p>
      )}

      <button type="button" className="btn btn-primary catch-save" onClick={() => save()} disabled={!canSave}>
        <TuckIcon />
        {editing ? 'Save changes' : 'Tuck into the pocket'}
      </button>

      {editing ? (
        <div className="catch-edit-actions">
          <button type="button" className="btn btn-gold" onClick={reset}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${confirmDelete ? 'catch-delete-confirm' : 'btn-gold'}`}
            onClick={onDelete}
          >
            <TrashIcon />
            {confirmDelete ? 'Tap again to delete' : 'Delete'}
          </button>
        </div>
      ) : (
        <p className="catch-hint">No formatting, no fuss. The desk is for making it pretty.</p>
      )}

      <section className="catch-earlier" aria-labelledby="earlier-heading">
        <h2 id="earlier-heading" className="catch-earlier-heading">
          Earlier today
        </h2>
        {todayScraps.length === 0 ? (
          <p className="catch-empty">Nothing yet today.</p>
        ) : (
          <ul className="catch-list">
            {todayScraps.map((s, i) => (
              <li key={s.id}>
                <ScrapCard
                  uid={uid}
                  scrap={s}
                  timezone={settings.timezone}
                  index={i}
                  filedLabel="Bound in"
                  onOpen={startEdit}
                  current={editing?.id === s.id}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="catch-toast-region" role="status" aria-live="polite">
        {toast && <span className="catch-toast">{toast}</span>}
      </div>
    </div>
  );
}
