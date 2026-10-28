import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, Timestamp } from 'firebase/firestore';
import { useEditor, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { clearDraft, pickStart, readDraft, writeDraft } from '../data/drafts';
import {
  countWords,
  emptyBody,
  emptyContent,
  plainTextOf,
  savePage,
  usePage,
  type PageContent,
  type SaveExtras,
  type Sticker,
  type StickerKind,
} from '../data/pages';
import { photosCol } from '../data/paths';
import type { PreparedPhoto } from '../data/photos';
import type { Scrap } from '../data/scraps';
import { bottomZ, clampPosition, newSticker, topZ } from '../stickers/geometry';

const AUTOSAVE_MS = 1000;

export type SaveStatus =
  | { kind: 'loading' }
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; editedAt: number }
  | { kind: 'error' };

export type PageSession = {
  editor: Editor | null;
  content: PageContent;
  wordCount: number;
  status: SaveStatus;
  /** True while the last save is only on this device. */
  pending: boolean;
  setTitle: (title: string) => void;
  setMood: (mood: PageContent['mood']) => void;
  file: (scrap: Scrap) => void;
  /** The sticker with handles showing, if any. Not saved. */
  selected: string | null;
  select: (id: string | null) => void;
  /** Move a sticker on screen during a gesture, without saving. */
  previewSticker: (s: Sticker) => void;
  /** Keep a sticker's new place, size or angle. */
  commitSticker: (s: Sticker) => void;
  addSticker: (kind: Exclude<StickerKind, 'photo'>, ref: string, center: { x: number; y: number }) => void;
  addPhoto: (photo: PreparedPhoto, center: { x: number; y: number }) => void;
  removeSticker: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
};

/** Where a newly filed photo lands: the right-hand column, cascading down. */
function nextPolaroid(photoId: string, stickers: Sticker[]): Sticker {
  const photos = stickers.filter((s) => s.kind === 'photo').length;
  return clampPosition({
    id: crypto.randomUUID(),
    kind: 'photo',
    ref: photoId,
    x: 606 + (photos % 2) * 56,
    y: 150 + photos * 120,
    rotation: photos % 2 ? 3 : -3,
    scale: 1,
    z: topZ(stickers),
  });
}

/**
 * One open page: the editor, the autosave, and the draft safety net.
 * Every edit is copied to a local draft at once and saved to Firestore a
 * second after typing stops, or immediately when the tab hides or the page
 * closes. On open, a draft newer than the saved page wins.
 */
export function usePageSession(
  uid: string,
  day: string,
  readOnly: boolean,
  /** Photos that belong to filed scraps: removing their sticker keeps the photo. */
  keepPhotoIds: string[] = [],
): PageSession {
  const pageState = usePage(uid, day);
  const [selected, setSelected] = useState<string | null>(null);
  const keepPhotos = useRef(keepPhotoIds);
  keepPhotos.current = keepPhotoIds;
  // Photos to delete with the next save, once their last sticker is gone.
  const dropPhotos = useRef<string[]>([]);

  const [content, setContentState] = useState<PageContent>(emptyContent);
  const [wordCount, setWordCount] = useState(0);
  const [status, setStatus] = useState<SaveStatus>({ kind: 'loading' });

  // Refs hold the truth for saving, so timers and unload handlers never see stale state.
  const contentRef = useRef<PageContent>(emptyContent());
  const editedAt = useRef(0); // last local edit
  const shownEditedAt = useRef(0); // version currently on screen
  const dirty = useRef(false);
  const createdAt = useRef<Timestamp | null>(null);
  const loaded = useRef(false);
  const applying = useRef(false);
  const focused = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(
    (extras: SaveExtras = {}) => {
      window.clearTimeout(timer.current);
      const hasExtras = !!(extras.file?.length || extras.addPhotos?.length);
      if (!dirty.current && !hasExtras) return;
      dirty.current = false;
      const at = editedAt.current || Date.now();
      shownEditedAt.current = at;
      createdAt.current ??= Timestamp.now();
      const deletePhotos = dropPhotos.current;
      dropPhotos.current = [];
      savePage(uid, day, contentRef.current, { editedAt: at, createdAt: createdAt.current }, { ...extras, deletePhotos }).catch(
        (err) => {
          console.error(err);
          setStatus({ kind: 'error' });
        },
      );
      setStatus({ kind: 'saved', editedAt: at });
    },
    [uid, day],
  );

  const touch = useCallback(() => {
    // Nothing counts as an edit until the saved page (or draft) is on screen.
    if (!loaded.current) return;
    editedAt.current = Date.now();
    dirty.current = true;
    writeDraft(uid, day, { ...contentRef.current, editedAt: editedAt.current });
    setStatus({ kind: 'saving' });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => flush(), AUTOSAVE_MS);
  }, [uid, day, flush]);

  const update = useCallback(
    (patch: Partial<PageContent>) => {
      contentRef.current = { ...contentRef.current, ...patch };
      setContentState(contentRef.current);
      touch();
    },
    [touch],
  );

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: emptyBody(),
    editable: false,
    editorProps: { attributes: { class: 'page-body', 'aria-label': 'Page text' } },
    onUpdate: ({ editor: e, transaction }) => {
      // Only real text changes. (Toggling editable also fires "update".)
      if (applying.current || !transaction.docChanged) return;
      const body = e.getJSON();
      contentRef.current = { ...contentRef.current, body };
      setWordCount(countWords(plainTextOf(body)));
      touch();
    },
    onFocus: () => {
      focused.current = true;
    },
  });

  useEffect(() => {
    // `false`: don't emit an update. TipTap does by default, and it would read as an edit.
    editor?.setEditable(!readOnly && status.kind !== 'loading', false);
  }, [editor, readOnly, status.kind]);

  // Show a version (saved page or draft) without counting it as an edit.
  const show = useCallback(
    (c: PageContent, version: number) => {
      if (!editor) return;
      contentRef.current = { ...c };
      setContentState(contentRef.current);
      applying.current = true;
      editor.commands.setContent(c.body as JSONContent, { emitUpdate: false });
      applying.current = false;
      shownEditedAt.current = version;
      setWordCount(countWords(plainTextOf(c.body)));
    },
    [editor],
  );

  useEffect(() => {
    if (pageState.status !== 'ready' || !editor) return;
    const page = pageState.page;
    if (page?.createdAt) createdAt.current ??= page.createdAt;
    const draft = readDraft(uid, day);

    if (!loaded.current) {
      loaded.current = true;
      const start = pickStart(page, draft);
      if (start.from === 'draft' && draft) {
        show(draft, draft.editedAt);
        // Not saved yet: save it now.
        editedAt.current = draft.editedAt;
        dirty.current = true;
        flush();
      } else {
        show(page ?? emptyContent(), start.editedAt);
        setStatus(page ? { kind: 'saved', editedAt: page.editedAt } : { kind: 'idle' });
      }
      return;
    }

    // The saved page has caught up with the draft: the draft has done its job.
    // (Firestore records the write in its offline store before it reports it here.)
    if (page && draft && page.editedAt >= draft.editedAt) clearDraft(uid, day);

    // A newer version from another tab or device, while nothing is unsaved here.
    if (page && !dirty.current && page.editedAt > shownEditedAt.current) {
      show(page, page.editedAt);
      setStatus({ kind: 'saved', editedAt: page.editedAt });
    }
  }, [pageState, editor, uid, day, show, flush]);

  // Save at once when the tab hides or the page goes away.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const onPageHide = () => flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      flush();
    };
  }, [flush]);

  const setTitle = useCallback((title: string) => update({ title }), [update]);
  const setMood = useCallback((mood: PageContent['mood']) => update({ mood }), [update]);

  const file = useCallback(
    (scrap: Scrap) => {
      if (!editor || readOnly || contentRef.current.scrapIds.includes(scrap.id)) return;
      const paragraphs = scrap.text
        .split(/\n+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] }));
      if (paragraphs.length) {
        // At the cursor if the owner has been writing, else at the end.
        const chain = editor.chain();
        (focused.current ? chain.focus() : chain.focus('end')).insertContent(paragraphs).run();
      }
      const { stickers, scrapIds } = contentRef.current;
      update({
        stickers: scrap.photoId ? [...stickers, nextPolaroid(scrap.photoId, stickers)] : stickers,
        scrapIds: [...scrapIds, scrap.id],
      });
      // Filing saves straight away, with the scrap marked filed in the same batch.
      flush({ file: [scrap.id] });
    },
    [editor, readOnly, update, flush],
  );

  const stickers = () => contentRef.current.stickers;
  const replace = (s: Sticker) => stickers().map((x) => (x.id === s.id ? s : x));

  const previewSticker = useCallback((s: Sticker) => {
    contentRef.current = { ...contentRef.current, stickers: replace(clampPosition(s)) };
    setContentState(contentRef.current);
  }, []);

  const commitSticker = useCallback((s: Sticker) => update({ stickers: replace(clampPosition(s)) }), [update]);

  const addSticker = useCallback(
    (kind: Exclude<StickerKind, 'photo'>, ref: string, center: { x: number; y: number }) => {
      if (readOnly) return;
      const s = newSticker(kind, ref, center, stickers());
      update({ stickers: [...stickers(), s] });
      setSelected(s.id);
    },
    [readOnly, update],
  );

  const addPhoto = useCallback(
    (photo: PreparedPhoto, center: { x: number; y: number }) => {
      if (readOnly) return;
      const id = doc(photosCol(uid)).id;
      const s = newSticker('photo', id, center, stickers());
      update({ stickers: [...stickers(), s] });
      setSelected(s.id);
      // The photo and the sticker that shows it land in one batch.
      flush({ addPhotos: [{ id, photo }] });
    },
    [readOnly, uid, update, flush],
  );

  const removeSticker = useCallback(
    (id: string) => {
      const gone = stickers().find((s) => s.id === id);
      if (!gone) return;
      const rest = stickers().filter((s) => s.id !== id);
      const photoStillUsed = rest.some((s) => s.kind === 'photo' && s.ref === gone.ref);
      if (gone.kind === 'photo' && !photoStillUsed && !keepPhotos.current.includes(gone.ref)) {
        dropPhotos.current.push(gone.ref);
      }
      update({ stickers: rest });
      setSelected(null);
    },
    [update],
  );

  const restack = useCallback(
    (id: string, z: (all: Sticker[]) => number) => {
      const s = stickers().find((x) => x.id === id);
      if (s) update({ stickers: replace({ ...s, z: z(stickers().filter((x) => x.id !== id)) }) });
    },
    [update],
  );
  const bringToFront = useCallback((id: string) => restack(id, topZ), [restack]);
  const sendToBack = useCallback((id: string) => restack(id, bottomZ), [restack]);

  const pending = pageState.status === 'ready' && pageState.pending;
  return {
    editor,
    content,
    wordCount,
    status,
    pending,
    setTitle,
    setMood,
    file,
    selected,
    select: setSelected,
    previewSticker,
    commitSticker,
    addSticker,
    addPhoto,
    removeSticker,
    bringToFront,
    sendToBack,
  };
}
