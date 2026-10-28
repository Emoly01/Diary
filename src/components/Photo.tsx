import { usePhoto } from '../data/photos';
import './Photo.css';

/** A stored photo in a white-bordered frame. Loads when it scrolls into view. */
export default function Photo({
  uid,
  photoId,
  alt,
  size = 48,
}: {
  uid: string;
  photoId: string;
  alt: string;
  size?: number;
}) {
  const { ref, src, missing } = usePhoto<HTMLSpanElement>(uid, photoId);
  return (
    <span ref={ref} className="photo-frame" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="photo-placeholder" role="img" aria-label={missing ? 'Photo unavailable' : 'Loading photo'} />
      )}
    </span>
  );
}
