import { Sticker, type StickerProps } from './Sticker';

const PATH = 'M50 84C20 64 12 48 16 36C20 22 38 18 50 32C62 18 80 22 84 36C88 48 80 64 50 84Z';

export default function Heart(props: StickerProps) {
  return (
    <Sticker {...props}>
      <path d={PATH} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round" />
      <path d={PATH} fill="var(--lilac)" />
      <ellipse cx="30" cy="38" rx="7" ry="4.5" fill="#FFFFFF" fillOpacity="0.7" transform="rotate(-30 30 38)" />
    </Sticker>
  );
}
