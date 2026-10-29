import { useCallback, useState } from 'react';
import { PRESETS } from './presets';

// The tray's five recent stickers. A per-device convenience, so it lives in
// this browser's storage, not in the book. Starts as the board's five.

const KEY = 'daybook:recent-stickers';
const COUNT = 5;
export const DEFAULT_RECENT = ['moth', 'black-cat', 'fern', 'teacup', 'moon-star'];

/** The newest first, known presets only, topped up from the defaults. */
export function recentList(stored: unknown): string[] {
  const mine = Array.isArray(stored) ? stored.filter((n): n is string => typeof n === 'string' && !!PRESETS[n]) : [];
  return [...new Set([...mine, ...DEFAULT_RECENT])].slice(0, COUNT);
}

function read(): string[] {
  try {
    return recentList(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return DEFAULT_RECENT;
  }
}

export function useRecentStickers(): [string[], (name: string) => void] {
  const [recent, setRecent] = useState(read);
  const use = useCallback((name: string) => {
    setRecent((cur) => {
      const next = recentList([name, ...cur]);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Private window or storage off: it just won't be remembered.
      }
      return next;
    });
  }, []);
  return [recent, use];
}
