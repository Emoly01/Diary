import type { CSSProperties } from 'react';
import type { Sticker } from '../data/pages';
import { usePhoto } from '../data/photos';

export const POLAROID_WIDTH = 230;

/** A photo sticker in a white polaroid frame. */
export default function Polaroid({ uid, sticker }: { uid: string; sticker: Sticker }) {
  const { ref, src, missing } = usePhoto<HTMLElement>(uid, sticker.ref);
  const style: CSSProperties = {
    left: sticker.x,
    top: sticker.y,
    width: POLAROID_WIDTH * sticker.scale,
    zIndex: sticker.z,
    transform: `rotate(${sticker.rotation}deg)`,
  };
  return (
    <figure ref={ref} className="polaroid" style={style}>
      {src ? (
        <img src={src} alt="A photo from the day" />
      ) : (
        <span className="polaroid-empty" role="img" aria-label={missing ? 'Photo unavailable' : 'Loading photo'} />
      )}
    </figure>
  );
}
