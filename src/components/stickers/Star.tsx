import { Sticker, type StickerProps } from './Sticker';

const PATH = 'M50 14L60 38.3L86.1 40.3L66.2 57.3L72.3 82.7L50 69L27.7 82.7L33.8 57.3L13.9 40.3L40 38.3Z';

export default function Star(props: StickerProps) {
  return (
    <Sticker {...props}>
      <path d={PATH} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round" />
      <path d={PATH} fill="var(--butter)" stroke="var(--butter)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="44" cy="50" r="2.6" fill="var(--ink)" />
      <circle cx="56" cy="50" r="2.6" fill="var(--ink)" />
      <path d="M45 57q5 4 10 0" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
    </Sticker>
  );
}
