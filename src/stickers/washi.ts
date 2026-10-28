// Washi tape: semi-transparent strips, polka-dot or gingham.

type Washi = { label: string; background: string };

const dots = (rgba: string) => ({
  background: `radial-gradient(rgba(255,255,255,0.95) 2.5px, transparent 3px) 0 0 / 12px 12px, ${rgba}`,
});
const gingham = (rgba: string) => ({
  background: `repeating-linear-gradient(0deg, ${rgba} 0 6px, transparent 6px 12px), repeating-linear-gradient(90deg, ${rgba} 0 6px, transparent 6px 12px), rgba(255,255,255,0.6)`,
});

export const WASHI: Record<string, Washi> = {
  'pink-dots': { label: 'Pink polka-dot tape', ...dots('rgba(255,158,192,0.8)') },
  'lilac-dots': { label: 'Lilac polka-dot tape', ...dots('rgba(201,184,245,0.85)') },
  'peach-dots': { label: 'Peach polka-dot tape', ...dots('rgba(255,201,168,0.85)') },
  'mint-gingham': { label: 'Mint gingham tape', ...gingham('rgba(158,217,197,0.6)') },
  'butter-gingham': { label: 'Butter gingham tape', ...gingham('rgba(255,227,138,0.65)') },
  'pink-gingham': { label: 'Pink gingham tape', ...gingham('rgba(255,158,192,0.5)') },
};

export const WASHI_NAMES = Object.keys(WASHI);

export const washiStyle = (name: string) => ({ background: (WASHI[name] ?? WASHI['pink-dots']).background });
