import { useState } from 'react';
import { usePhoto } from '../data/photos';

/**
 * A photo in a slip-coloured frame with a double gold hairline, filling its
 * sticker box, with an italic caption when it has one. `photoId` is a stored
 * photo; `url` is a pasted image link, loaded from its host without telling
 * it where it's shown.
 */
export default function Polaroid({ uid, photoId, url, caption }: { uid: string; photoId?: string; url?: string; caption?: string }) {
  const { ref, src, missing } = usePhoto<HTMLElement>(uid, photoId ?? null);
  const [broken, setBroken] = useState(false);
  const shown = url && !broken ? url : src;

  return (
    <figure ref={ref} className="polaroid">
      {shown ? (
        <img
          src={shown}
          alt={url ? 'A linked photo' : caption ? `Photo: ${caption}` : 'A photo from the day'}
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => url && setBroken(true)}
        />
      ) : (
        <span
          className="polaroid-empty"
          role="img"
          aria-label={broken ? 'Linked photo unavailable' : missing ? 'Photo unavailable' : 'Loading photo'}
        />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
