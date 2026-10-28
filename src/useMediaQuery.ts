import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** The brief's three layouts: phone < 900 px, tablet 900–1279 px, desk ≥ 1280 px. */
export function useLayout(): 'phone' | 'tablet' | 'desk' {
  const desk = useMediaQuery('(min-width: 1280px)');
  const tablet = useMediaQuery('(min-width: 900px)');
  return desk ? 'desk' : tablet ? 'tablet' : 'phone';
}

/**
 * The sticker sheet gets its own column only from 1600 px. Narrower, a third
 * column would squeeze the 960 px page to ~10 px text, so the sheet opens
 * from a header button instead.
 */
export const useSheetInRail = () => useMediaQuery('(min-width: 1600px)');
