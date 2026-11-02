import { usePhoto } from '../data/photos';

/**
 * One of the owner's own stickers: the stored picture, transparent edge and
 * all, filling its box. Loads only once it's near the screen.
 */
export default function CustomArt({ uid, photoId, name }: { uid: string; photoId: string; name?: string }) {
  const { ref, src, missing } = usePhoto<HTMLSpanElement>(uid, photoId);
  return (
    <span ref={ref} className="custom-art">
      {src ? (
        <img src={src} alt={name ?? 'Your sticker'} draggable={false} />
      ) : (
        <span className="custom-art-empty" role="img" aria-label={missing ? 'Sticker unavailable' : 'Loading sticker'} />
      )}
    </span>
  );
}
