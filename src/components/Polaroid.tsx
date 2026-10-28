import { useState } from 'react';
import { usePhoto } from '../data/photos';

/**
 * A photo in a white polaroid frame, filling its sticker box. `photoId` is a
 * stored photo; `url` is a pasted image link, loaded from its host without
 * telling it where it's shown.
 */
export default function Polaroid({ uid, photoId, url }: { uid: string; photoId?: string; url?: string }) {
  const { ref, src, missing } = usePhoto<HTMLElement>(uid, photoId ?? null);
  const [broken, setBroken] = useState(false);
  const shown = url && !broken ? url : src;

  return (
    <figure ref={ref} className="polaroid">
      {shown ? (
        <img
          src={shown}
          alt={url ? 'A linked photo' : 'A photo from the day'}
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
    </figure>
  );
}
