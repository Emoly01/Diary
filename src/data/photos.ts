import { useEffect, useRef, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
// Self-hosted copy of the compressor for its web worker. Without libURL the
// library fetches this file from cdn.jsdelivr.net.
import compressionLibUrl from 'browser-image-compression/dist/browser-image-compression.js?url';
import { photoDoc } from './paths';

/** A compressed JPEG ready to be stored in `photos/{id}`. */
export type PreparedPhoto = {
  /** Base64 JPEG, without the data: prefix. */
  data: string;
  width: number;
  height: number;
  /** Size of the JPEG before base64 encoding. */
  bytes: number;
};

// Firestore caps a document at 1 MiB. The compressor aims for ~500 KB of
// JPEG (~700 KB base64); this is the hard stop if it can't get there.
const MAX_BASE64_CHARS = 900_000;

export class PhotoError extends Error {}

function readAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function measure(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/** Shrinks a picked image to a ~1200 px JPEG of at most ~500 KB. */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (!file.type.startsWith('image/')) throw new PhotoError('That file isn’t a picture.');

  let jpeg: Blob;
  try {
    jpeg = await imageCompression(file, {
      maxWidthOrHeight: 1200,
      maxSizeMB: 0.5,
      fileType: 'image/jpeg',
      initialQuality: 0.85,
      useWebWorker: true,
      libURL: new URL(compressionLibUrl, window.location.href).href,
    });
  } catch (err) {
    console.error(err);
    throw new PhotoError('That picture couldn’t be read. Try another one.');
  }

  const [data, size] = await Promise.all([readAsBase64(jpeg), measure(jpeg)]);
  if (data.length > MAX_BASE64_CHARS) {
    throw new PhotoError('That picture is too big to keep, even shrunk. Try another one.');
  }
  return { data, ...size, bytes: jpeg.size };
}

export const photoSrc = (data: string) => `data:image/jpeg;base64,${data}`;

/**
 * The photo's data URL, loaded only once `ref`'s element is near the screen.
 * Reads from the local cache first, so photos caught offline show at once.
 */
export function usePhoto<T extends Element>(uid: string, photoId: string | null) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    setSrc(null);
    setMissing(false);
    if (!visible || !photoId) return;
    return onSnapshot(
      photoDoc(uid, photoId),
      (snap) => {
        const data = snap.get('data');
        if (typeof data === 'string') setSrc(photoSrc(data));
        else setMissing(true);
      },
      () => setMissing(true),
    );
  }, [uid, photoId, visible]);

  return { ref, src, missing };
}
