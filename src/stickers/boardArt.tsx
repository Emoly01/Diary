// Generated from design/redesign/StickerCabinet.dc.html: the board's sticker and moon art,
// copied as drawn. Filter and gradient ids point at <SvgDefs> (`db-…`).

import type { ReactNode } from 'react';

export type BoardArt = { caption: string; label: string; tilt: number; art: ReactNode };

export const BOARD_ART: Record<string, BoardArt> = {
  'moth': {
    caption: 'moth',
    label: 'Moth',
    tilt: -5,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M50 50C30 20 8 24 10 42C12 56 32 58 50 52Z" fill="url(#db-stone)" /><path d="M50 50C70 20 92 24 90 42C88 56 68 58 50 52Z" fill="url(#db-stone)" /><path d="M50 54C36 60 24 76 34 82C42 86 48 70 50 56Z" fill="url(#db-gold)" /><path d="M50 54C64 60 76 76 66 82C58 86 52 70 50 56Z" fill="url(#db-gold)" /><ellipse cx="50" cy="56" rx="4" ry="15" fill="url(#db-ink)" /></g><circle cx="28" cy="40" r="5" fill="none" stroke="#5B4A40" strokeWidth="1.2" /><circle cx="72" cy="40" r="5" fill="none" stroke="#5B4A40" strokeWidth="1.2" /><path d="M48 42C44 32 40 28 34 26M52 42C56 32 60 28 66 26" fill="none" stroke="#2B1F19" strokeWidth="1.6" strokeLinecap="round" /></g>
      </>
    ),
  },
  'moon-star': {
    caption: 'moon & star',
    label: 'Crescent moon and star',
    tilt: 6,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M58 14C34 16 18 36 20 58C22 80 44 92 66 86C48 80 38 64 40 48C42 32 50 20 58 14Z" fill="url(#db-gold)" /><path d="M74 26l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="url(#db-gold)" /></g></g>
      </>
    ),
  },
  'candle': {
    caption: 'candle',
    label: 'Candle',
    tilt: -3,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><ellipse cx="50" cy="82" rx="24" ry="7" fill="url(#db-gold)" /><rect x="39" y="40" width="22" height="42" rx="3" fill="url(#db-cream)" /><path d="M50 12C57 22 59 30 50 37C41 30 43 22 50 12Z" fill="url(#db-ember)" /></g><path d="M50 36v5" stroke="#2B1F19" strokeWidth="1.6" /><path d="M57 40v9a3 3 0 0 1-6 0" fill="none" stroke="#D9C7A5" strokeWidth="2" /></g>
      </>
    ),
  },
  'crystals': {
    caption: 'crystals',
    label: 'Crystal cluster',
    tilt: 4,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M28 40L39 56L37 88H25L21 58Z" fill="url(#db-stone)" /><path d="M72 46L80 62L76 88H65L63 62Z" fill="url(#db-plum)" /><path d="M50 10L63 38L57 88H43L37 38Z" fill="url(#db-plum)" /></g><path d="M50 10V88M37 38H63" stroke="#FFFBF3" strokeWidth="1" opacity="0.7" /></g>
      </>
    ),
  },
  'potion': {
    caption: 'potion',
    label: 'Potion bottle',
    tilt: -6,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><circle cx="50" cy="64" r="25" fill="url(#db-stone)" /><path d="M26 66a24 24 0 0 0 48 0z" fill="url(#db-ember)" /><rect x="43" y="22" width="14" height="22" fill="url(#db-stone)" /><rect x="41" y="12" width="18" height="11" rx="2" fill="#8A5A3A" /></g><circle cx="44" cy="76" r="2.5" fill="#FFFBF3" opacity="0.8" /><circle cx="56" cy="71" r="1.6" fill="#FFFBF3" opacity="0.8" /><path d="M34 54q4-8 10-10" stroke="#FFFBF3" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" /></g>
      </>
    ),
  },
  'tarot-moon': {
    caption: 'tarot · the moon',
    label: 'Tarot card, The Moon',
    tilt: 5,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><rect x="27" y="8" width="46" height="84" rx="4" fill="url(#db-cream)" /></g><rect x="31" y="12" width="38" height="76" rx="2" fill="none" stroke="#B88A3E" strokeWidth="1.4" /><path d="M56 32C46 33 40 41 40 49s6 16 16 17c-6-4-9-10-9-17s3-13 9-17z" fill="#B88A3E" /><circle cx="38" cy="22" r="1.2" fill="#B88A3E" /><circle cx="62" cy="26" r="1" fill="#B88A3E" /><text x="50" y="82" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="10" fontWeight="700" letterSpacing="1" fill="#6A2018">XVIII</text></g>
      </>
    ),
  },
  'mushroom': {
    caption: 'mushroom',
    label: 'Mushroom',
    tilt: -4,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M40 56C40 72 36 84 44 88H56C64 84 60 72 60 56Z" fill="url(#db-cream)" /><path d="M14 58C14 30 86 30 86 58Z" fill="url(#db-ox)" /></g><circle cx="32" cy="46" r="4" fill="#FBF3E4" /><circle cx="52" cy="40" r="3" fill="#FBF3E4" /><circle cx="69" cy="48" r="4.5" fill="#FBF3E4" /><circle cx="46" cy="52" r="2.2" fill="#FBF3E4" /></g>
      </>
    ),
  },
  'crow-feather': {
    caption: 'crow feather',
    label: 'Crow feather',
    tilt: 8,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M72 8C42 20 26 50 28 90C52 72 76 44 72 8Z" fill="url(#db-ink)" /></g><path d="M28 90Q48 52 72 8" stroke="#D9B46A" strokeWidth="1.6" fill="none" /><path d="M44 54l-9-2M50 42l-8-3M57 31l-7-4M40 66l-9-1" stroke="#8A7A70" strokeWidth="1" /></g>
      </>
    ),
  },
  'd20': {
    caption: 'd20 · nat 20',
    label: 'Twenty-sided die',
    tilt: -7,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="url(#db-plum)" /></g><g fill="none" stroke="#FBF3E4" strokeWidth="1.2" opacity="0.85"><polygon points="50,28 72,64 28,64" /><path d="M50 8L50 28M86 29L72 64M14 29L28 64M50 92L72 64M50 92L28 64M14 29L50 28M86 29L50 28M14 71L28 64M86 71L72 64" /></g><text x="50" y="58" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="17" fontWeight="700" fill="#F6E6B8">20</text></g>
      </>
    ),
  },
  'old-key': {
    caption: 'old key',
    label: 'Old key',
    tilt: -20,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)" fill="url(#db-gold)"><circle cx="28" cy="50" r="15" /><rect x="40" y="46" width="48" height="8" rx="2" /><rect x="70" y="53" width="6" height="13" /><rect x="80" y="53" width="6" height="9" /></g><circle cx="28" cy="50" r="6" fill="#FFFBF3" /><circle cx="28" cy="50" r="10.5" fill="none" stroke="#B88A3E" strokeWidth="1" /></g>
      </>
    ),
  },
  'fern': {
    caption: 'fern',
    label: 'Fern sprig',
    tilt: 10,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)" fill="url(#db-moss)"><path d="M50 96Q46 56 56 6" fill="none" stroke="#5E7550" strokeWidth="2.4" strokeLinecap="round" /><ellipse cx="42" cy="78" rx="10" ry="4" transform="rotate(-25 42 78)" /><ellipse cx="60" cy="70" rx="10" ry="4" transform="rotate(20 60 70)" /><ellipse cx="42" cy="58" rx="9" ry="3.6" transform="rotate(-25 42 58)" /><ellipse cx="61" cy="50" rx="9" ry="3.6" transform="rotate(20 61 50)" /><ellipse cx="45" cy="38" rx="8" ry="3.2" transform="rotate(-25 45 38)" /><ellipse cx="62" cy="30" rx="7" ry="3" transform="rotate(20 62 30)" /><ellipse cx="50" cy="18" rx="6" ry="2.6" transform="rotate(-25 50 18)" /></g></g>
      </>
    ),
  },
  'lavender': {
    caption: 'lavender',
    label: 'Lavender sprig',
    tilt: -8,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M50 94Q48 60 52 20" fill="none" stroke="#7E9670" strokeWidth="2.6" strokeLinecap="round" /><ellipse cx="42" cy="78" rx="3" ry="14" transform="rotate(-25 42 78)" fill="url(#db-moss)" /><ellipse cx="58" cy="74" rx="3" ry="13" transform="rotate(25 58 74)" fill="url(#db-moss)" /><g fill="url(#db-plum)"><ellipse cx="52" cy="16" rx="4" ry="6" /><ellipse cx="47" cy="25" rx="4" ry="6" transform="rotate(-20 47 25)" /><ellipse cx="57" cy="27" rx="4" ry="6" transform="rotate(20 57 27)" /><ellipse cx="47" cy="35" rx="4" ry="6" transform="rotate(-20 47 35)" /><ellipse cx="57" cy="37" rx="4" ry="6" transform="rotate(20 57 37)" /><ellipse cx="48" cy="45" rx="4" ry="6" transform="rotate(-20 48 45)" /><ellipse cx="56" cy="47" rx="4" ry="6" transform="rotate(20 56 47)" /><ellipse cx="49" cy="55" rx="3.5" ry="5" transform="rotate(-20 49 55)" /><ellipse cx="55" cy="57" rx="3.5" ry="5" transform="rotate(20 55 57)" /></g></g></g>
      </>
    ),
  },
  'pressed-rose': {
    caption: 'pressed rose',
    label: 'Pressed rose',
    tilt: 5,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M50 52Q46 74 50 94" fill="none" stroke="#7E9670" strokeWidth="3" strokeLinecap="round" /><ellipse cx="38" cy="74" rx="10" ry="4" transform="rotate(-30 38 74)" fill="url(#db-moss)" /><g fill="url(#db-rose)"><ellipse cx="50" cy="26" rx="11" ry="14" /><ellipse cx="50" cy="26" rx="11" ry="14" transform="rotate(72 50 40)" /><ellipse cx="50" cy="26" rx="11" ry="14" transform="rotate(144 50 40)" /><ellipse cx="50" cy="26" rx="11" ry="14" transform="rotate(216 50 40)" /><ellipse cx="50" cy="26" rx="11" ry="14" transform="rotate(288 50 40)" /></g><circle cx="50" cy="40" r="7" fill="url(#db-gold)" /></g></g>
      </>
    ),
  },
  'ginkgo': {
    caption: 'ginkgo',
    label: 'Ginkgo leaf',
    tilt: -10,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M50 62C30 60 12 46 14 22C28 30 40 24 50 32C60 24 72 30 86 22C88 46 70 60 50 62Z" fill="url(#db-gold)" /><path d="M50 62V92" stroke="#B88A3E" strokeWidth="3" strokeLinecap="round" /></g><path d="M50 58L30 30M50 58L70 30M50 58L40 27M50 58L60 27" stroke="#B88A3E" strokeWidth="0.8" opacity="0.7" /></g>
      </>
    ),
  },
  'oak-leaf': {
    caption: 'oak leaf',
    label: 'Oak leaf',
    tilt: 12,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M50 92V80C40 80 34 74 38 68C28 70 22 62 30 56C20 54 18 44 28 42C20 36 24 26 34 30C32 20 42 14 48 22C50 14 58 14 60 22C66 14 76 20 72 30C82 26 86 36 78 42C88 44 86 54 76 56C84 62 78 70 68 68C72 74 66 80 56 80V92Z" fill="url(#db-ember)" /></g><path d="M50 88V24M50 44L36 36M50 44L64 36M50 58L34 52M50 58L66 52M50 70L40 66M50 70L60 66" stroke="#8E2A14" strokeWidth="1" fill="none" opacity="0.7" /></g>
      </>
    ),
  },
  'rowan': {
    caption: 'rowan berries',
    label: 'Rowan berries',
    tilt: -6,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M50 94Q50 62 48 42M48 50L36 34M49 46L62 30" fill="none" stroke="#7E9670" strokeWidth="2.4" strokeLinecap="round" /><ellipse cx="34" cy="70" rx="12" ry="4.5" transform="rotate(-30 34 70)" fill="url(#db-moss)" /><ellipse cx="66" cy="66" rx="12" ry="4.5" transform="rotate(30 66 66)" fill="url(#db-moss)" /><g fill="url(#db-ox)"><circle cx="34" cy="30" r="7" /><circle cx="46" cy="24" r="7" /><circle cx="58" cy="28" r="7" /><circle cx="42" cy="38" r="6.5" /><circle cx="64" cy="20" r="6" /></g></g><g fill="#2B1F19"><circle cx="34" cy="27" r="1" /><circle cx="46" cy="21" r="1" /><circle cx="58" cy="25" r="1" /><circle cx="64" cy="17" r="1" /></g></g>
      </>
    ),
  },
  'teacup': {
    caption: 'teacup',
    label: 'Teacup',
    tilt: -6,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M24 42h44v12c0 13-10 23-22 23s-22-10-22-23z" fill="url(#db-ember)" /><path d="M68 47h5a8 8 0 0 1 0 16h-6" fill="none" stroke="#D9692F" strokeWidth="5" strokeLinecap="round" /><rect x="14" y="76" width="64" height="9" rx="4.5" fill="url(#db-gold)" /></g><path d="M38 32c-4-5 4-8 0-14M52 32c-4-5 4-8 0-14" fill="none" stroke="#8A6E58" strokeWidth="1.8" strokeLinecap="round" /></g>
      </>
    ),
  },
  'black-cat': {
    caption: 'black cat',
    label: 'Black cat',
    tilt: 4,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M30 90C26 70 30 56 38 48L34 28L44 38C48 37 52 37 56 38L66 28L62 48C70 56 74 70 70 90Z" fill="url(#db-ink)" /><path d="M70 86C84 84 90 70 82 60" fill="none" stroke="#2B1F19" strokeWidth="5" strokeLinecap="round" /></g><ellipse cx="43" cy="52" rx="3.4" ry="4.2" fill="#E8A35E" /><ellipse cx="57" cy="52" rx="3.4" ry="4.2" fill="#E8A35E" /><ellipse cx="43" cy="52" rx="1.1" ry="3.4" fill="#1C1411" /><ellipse cx="57" cy="52" rx="1.1" ry="3.4" fill="#1C1411" /></g>
      </>
    ),
  },
  'sleeping-tabby': {
    caption: 'sleeping tabby',
    label: 'Sleeping tabby cat',
    tilt: -3,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)" fill="url(#db-stone)"><path d="M22 70C22 52 38 44 56 44C76 44 88 56 86 70C84 82 70 86 52 86C34 86 22 82 22 70Z" /><circle cx="30" cy="60" r="16" /><path d="M17 50L18 35L28 45Z" /><path d="M32 44L40 33L43 47Z" /><path d="M84 72C92 84 72 92 60 86" fill="none" stroke="#B3C2CF" strokeWidth="7" strokeLinecap="round" /></g><path d="M23 62q3 2 6 0M33 62q3 2 6 0" fill="none" stroke="#2B1F19" strokeWidth="1.5" strokeLinecap="round" /><path d="M58 48q-2 8 2 14M68 48q-2 8 2 14M77 52q-2 7 1 12" fill="none" stroke="#7A8C9E" strokeWidth="2" strokeLinecap="round" /><circle cx="31" cy="67" r="1.4" fill="#C9796B" /></g>
      </>
    ),
  },
  'yarn-hook': {
    caption: 'yarn & hook',
    label: 'Yarn ball and crochet hook',
    tilt: 6,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><circle cx="46" cy="54" r="30" fill="url(#db-ember)" /><path d="M70 78Q84 88 90 78" fill="none" stroke="#D9692F" strokeWidth="3" strokeLinecap="round" /></g><g fill="none" stroke="#FBF3E4" strokeWidth="1.6" opacity="0.6"><path d="M20 44C34 36 58 38 72 52" /><path d="M18 58C34 48 60 52 74 66" /><path d="M28 78C38 62 52 54 70 40" /><path d="M40 26C48 40 50 60 44 84" /></g><path d="M70 12L28 94" stroke="#C9A45C" strokeWidth="5" strokeLinecap="round" /><path d="M70 12q5-3 6 2" fill="none" stroke="#C9A45C" strokeWidth="3" strokeLinecap="round" /></g>
      </>
    ),
  },
  'glazed-vase': {
    caption: 'glazed vase',
    label: 'Glazed ceramic vase',
    tilt: -4,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M38 14H62V22C62 28 76 36 76 56C76 76 64 88 50 88C36 88 24 76 24 56C24 36 38 28 38 22Z" fill="url(#db-moss)" /></g><ellipse cx="50" cy="14" rx="12" ry="3" fill="#5E7550" /><path d="M27 50C36 55 42 47 50 54C58 47 64 55 73 50" fill="none" stroke="#DDBB72" strokeWidth="3" strokeLinecap="round" /><path d="M40 52v8M60 52v6" stroke="#DDBB72" strokeWidth="2" strokeLinecap="round" /></g>
      </>
    ),
  },
  'heart-anatomical': {
    caption: 'heart, anatomical',
    label: 'Anatomical heart',
    tilt: 5,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M58 30L64 12H72L66 32Z" fill="url(#db-stone)" /><path d="M36 33L29 18H36L42 31Z" fill="url(#db-stone)" /><path d="M50 90C30 78 20 62 22 47C24 34 34 28 44 31L44 14H53V29C64 25 78 33 78 48C78 65 68 79 50 90Z" fill="url(#db-rose)" /></g><path d="M40 48C46 58 58 56 62 66M52 40C50 52 56 70 48 82" stroke="#8E2A14" strokeWidth="1.4" fill="none" opacity="0.7" /><path d="M44 18h9" stroke="#8E2A14" strokeWidth="1" /></g>
      </>
    ),
  },
  'rain': {
    caption: 'rain',
    label: 'Rain cloud',
    tilt: -5,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><path d="M26 62a14 14 0 0 1 4-27a20 20 0 0 1 38-2a15 15 0 0 1 6 29Z" fill="url(#db-stone)" /><path d="M36 72l-4 10M52 72l-4 12M68 72l-4 10" stroke="#8396A8" strokeWidth="4" strokeLinecap="round" /></g></g>
      </>
    ),
  },
  'sun': {
    caption: 'sun',
    label: 'Sun',
    tilt: 8,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><circle cx="50" cy="50" r="20" fill="url(#db-gold)" /><path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l8 8M69 69l8 8M23 77l8-8M69 31l8-8" stroke="#DDBB72" strokeWidth="5" strokeLinecap="round" /></g></g>
      </>
    ),
  },
  'sealed-letter': {
    caption: 'sealed letter',
    label: 'Sealed letter',
    tilt: -6,
    art: (
      <>
        <g filter="url(#db-cut)"><g filter="url(#db-wc)"><rect x="14" y="26" width="72" height="50" rx="3" fill="url(#db-cream)" /></g><path d="M14 28L50 56L86 28" fill="none" stroke="#B89A72" strokeWidth="1.5" /><circle cx="50" cy="56" r="10" fill="#8E2A14" filter="url(#db-seal)" /><path d="M53 49c-4 .5-7 3.5-7 7s3 6.5 7 7c-2.4-1.6-3.6-4-3.6-7s1.2-5.4 3.6-7z" fill="#C2533A" /></g>
      </>
    ),
  },
  'star': {
    caption: 'star',
    label: 'Gold star',
    tilt: 12,
    art: (
      <>
        <g filter="url(#db-cut)"><path d="M50 14L60 38.3L86.1 40.3L66.2 57.3L72.3 82.7L50 69L27.7 82.7L33.8 57.3L13.9 40.3L40 38.3Z" fill="url(#db-gold)" filter="url(#db-wc)" /></g>
      </>
    ),
  },
  'heart': {
    caption: 'heart',
    label: 'Heart',
    tilt: -10,
    art: (
      <>
        <g filter="url(#db-cut)"><path d="M50 84C20 64 12 48 16 36C20 22 38 18 50 32C62 18 80 22 84 36C88 48 80 64 50 84Z" fill="url(#db-rose)" filter="url(#db-wc)" /></g>
      </>
    ),
  },
  'moon-1': {
    caption: 'rough',
    label: 'Rough: new moon',
    tilt: 0,
    art: (
      <>
        <g filter="url(#db-cut)"><circle cx="50" cy="50" r="34" fill="url(#db-ink)" filter="url(#db-wc)" /></g>
      </>
    ),
  },
  'moon-2': {
    caption: 'meh',
    label: 'Meh: crescent moon',
    tilt: 0,
    art: (
      <>
        <g filter="url(#db-cut)"><circle cx="50" cy="50" r="34" fill="url(#db-ink)" /><path d="M50 16a34 34 0 0 1 0 68a20 34 0 0 0 0-68z" fill="url(#db-gold)" filter="url(#db-wc)" /></g>
      </>
    ),
  },
  'moon-3': {
    caption: 'okay',
    label: 'Okay: half moon',
    tilt: 0,
    art: (
      <>
        <g filter="url(#db-cut)"><circle cx="50" cy="50" r="34" fill="url(#db-ink)" /><path d="M50 16a34 34 0 0 1 0 68z" fill="url(#db-gold)" filter="url(#db-wc)" /></g>
      </>
    ),
  },
  'moon-4': {
    caption: 'good',
    label: 'Good: waxing gibbous moon',
    tilt: 0,
    art: (
      <>
        <g filter="url(#db-cut)"><circle cx="50" cy="50" r="34" fill="url(#db-ink)" /><path d="M50 16a34 34 0 0 1 0 68a16 34 0 0 1 0-68z" fill="url(#db-ember)" filter="url(#db-wc)" /></g>
      </>
    ),
  },
  'moon-5': {
    caption: 'great',
    label: 'Great: full moon',
    tilt: 0,
    art: (
      <>
        <g filter="url(#db-cut)"><circle cx="50" cy="50" r="34" fill="url(#db-gold)" filter="url(#db-wc)" /><circle cx="40" cy="42" r="5" fill="#DDBB72" opacity="0.6" /><circle cx="60" cy="60" r="7" fill="#DDBB72" opacity="0.5" /></g>
      </>
    ),
  },
};
