import { Sticker, type StickerProps } from './Sticker';

const PATH =
  'M20 70C20 52 25 41 30 35L27 14L45 27C48 26.5 52 26.5 55 27L73 14L70 35C75 41 80 52 80 70C80 83 66 89 50 89C34 89 20 83 20 70Z';

export default function Cat(props: StickerProps) {
  return (
    <Sticker {...props}>
      <path d={PATH} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round" />
      <path d={PATH} fill="var(--peach)" />
      <path d="M31 31L30 20L40 28Z" fill="var(--pink)" />
      <path d="M69 31L70 20L60 28Z" fill="var(--pink)" />
      <ellipse cx="39" cy="57" rx="3.6" ry="5" fill="var(--ink)" />
      <ellipse cx="61" cy="57" rx="3.6" ry="5" fill="var(--ink)" />
      <circle cx="40.5" cy="55" r="1.3" fill="#FFFFFF" />
      <circle cx="62.5" cy="55" r="1.3" fill="#FFFFFF" />
      <circle cx="31" cy="68" r="5" fill="var(--pink)" />
      <circle cx="69" cy="68" r="5" fill="var(--pink)" />
      <path d="M44 69q3 4 6 0q3 4 6 0" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
    </Sticker>
  );
}
