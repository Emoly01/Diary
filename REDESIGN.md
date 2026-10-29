# Daybook — Redesign Brief (Phase 6: Ember Grimoire)

Oct 29, 2026 · @Emily

## What changes

v1 works; it just doesn't look like it's mine. The pastel planner reads too sweet and too flat. This phase replaces the whole visual system and turns the desk into an **open book**. Data, rules, sync, offline, autosave and every behaviour in `BRIEF.md` stay as they are unless this file says otherwise.

- **The desk is a two-page spread** on a forest-green leather cover: the left page is the *pocket* (the scrap tray plus On this day), the right page is *today*.
- **New look everywhere:** ash-dark desk lit by an ember glow, parchment pages, gold filigree, watercolour stickers, Cormorant Garamond + Newsreader + IBM Plex Mono.
- **Mood becomes moon phases** (same 1–5 values, new art).
- **The sticker set grows** from 8 presets and 6 tapes to 27 stickers, 8 word labels, 5 mood moons and 10 washi tapes.

`BRIEF.md` stays the source of truth for everything else. Where the two disagree, this file wins.

## Design reference

The boards are exported in `design/redesign/`. Treat them as the spec: copy colours, sizes, radii, shadows and SVG paths from the markup exactly, don't eyeball them.

| Board | File | What it specifies |
| --- | --- | --- |
| 4.3 · Open Book, ember grimoire | `BookGrimoire.dc.html` | The desk at 1440 px: cover, spread, tabs, pocket page, today's page, inkwell tray |
| 4.3 · Sticker cabinet & washi | `StickerCabinet.dc.html` | Every sticker, word label, mood moon and washi tape, with names |

- The files are Claude Design components: plain HTML with inline styles. Ignore `support.js`, `<x-dc>`, `<helmet>`, `{{…}}` holes and the `data-dc-script` block; read the markup and styles.
- `design/project/` (the pastel boards) is superseded. Leave it in the repo for history, but don't build from it.
- The other screens (Catch, Pages, Settings, Sign in, Locked) have **no board yet**. Build them from the rules in "Screens" below, using only tokens and components that already exist on the two boards. If something there needs a new pattern, stop and ask.

## Tokens

Replace `src/styles/tokens.css` wholesale. All text pairs below are checked against WCAG AA (ratios in brackets).

| Token | Value | Used for |
| --- | --- | --- |
| desk | `#15100E` + `radial-gradient(ellipse 75% 55% at 50% 108%, rgba(232,116,42,0.24), transparent 70%)` | App background, ember glow from below |
| on-desk | `#F3E6D3` (15.4:1) | Text on the desk |
| on-desk-soft | `#BCA893` (8.2:1) | Secondary text on the desk |
| gold | `#D9B46A` (9.6:1 on desk) | Wordmark, filigree, hairlines, outline buttons |
| gold-edge | `#C9A45C` | Gilt page edges, ornament rules |
| ember | `#E8742A`; light `#F4B183` | Accent on dark: active ring, photo button, glow |
| cover | `#1E3127` + 5 px / 7 px dot grain | Leather book cover |
| parchment | `#F4ECDD` | Pages |
| slip | `#FBF6EC` | Scrap slips, letters, photo frames |
| die-cut | `#FFFBF3` | Sticker edge |
| ink | `#2B1F19` (13.6:1 on parchment) | Main text on pages |
| ink-soft | `#6A5747` (5.8:1) | Labels, running heads, footer |
| ink-body-soft | `#4A3A30` (9.2:1) | Italic secondary lines |
| ember-ink | `#A3401A` (5.4:1) | Accent text on parchment: title italics, add buttons, cursor |
| moss-ink | `#4C6141` (6.3:1 on slip) | "Bound in" state |
| oxblood | `#8E2A14`; ribbon gradient to `#B4402A`; pocket `#4A1A16` | Ribbon, wax seals, the pocket |
| tray | `#1A1411` + inset 1 px `rgba(217,180,106,0.45)` | Inkwell tray |
| tabs | current `#F4ECDD`, then `#D9824F`, `#9DB38D`, `#B3C2CF`; text `#1A1411` (6.3–10:1) | Index tabs |
| display font | Cormorant Garamond 500–700, roman + italic | Headings, titles, date line, mood word |
| body font | Newsreader 400–600, roman + italic; page body 18 px / 1.75 | Writing, scraps |
| label font | IBM Plex Mono 400–500, 12 px, uppercase, letter-spacing 0.14–0.18em | Running heads, timestamps, buttons |
| page shadow | stacked edges `±1…5px` alternating `#E2D5BE` / parchment, last one `#C9A45C` | The page block |
| book shadow | `0 40px 80px rgba(0,0,0,0.6), 0 8px 18px rgba(0,0,0,0.45)` | Cover |

- **Fonts are self-hosted**, as before: swap `@fontsource/fredoka` and `@fontsource/nunito` for `@fontsource/cormorant-garamond`, `@fontsource/newsreader` and `@fontsource/ibm-plex-mono` (only the weights above). Still no request to Google Fonts. That's three dependencies; they replace two, so it's pre-approved.
- Icons stay inline stroke SVGs at 1.5–2 px. Never emoji. Every tap target is at least 44 px.

## The desk (board 4.3)

- **Cover:** forest leather, a tooled double gold border inset 8 px, four art nouveau corner pieces (SVG in the board, mirrored with `scale(±1,±1)`). It holds the two pages with 22 px padding.
- **Index tabs** on the cover's right edge replace the header nav: **Today · Pages · October · The year**. Vertical text, 12 px mono caps. The current tab is parchment-coloured, as if it were the open page. "October" opens Pages filtered to the current month, "The year" opens Pages for the whole year.
- **Header** on the desk: crescent-and-flame mark, *Daybook* in Cormorant italic gold, "Book one · MMXXVI" in mono, then the search and account buttons (gold hairline circles).
- **Left page, the pocket:** running head "Gathered / Week xliv" (week in lower-case Roman numerals). Heading "Caught, *this week*". Scraps are torn paper slips (`clip-path` polygons from the board), newest first, ±0.7° tilt. Filed ones say **Bound in** with a check; unfiled ones get a 44 px ember-outline + button labelled "Bind into today's page: …". Below them sits the oxblood pocket with gold stitching: "The pocket · six scraps, waiting" and "Older pockets ›". The count is spelled out in words up to twelve.
- **On this day** sits top right of the pocket page as a letter with a wax seal. Empty state: "Sealed · 26 x 2025 / Year one. Nothing to haunt you with yet." When last year's page exists: same card, with its title in Cormorant and its first line in italics, and the seal "broken" (an opened-flap variant). Tapping opens that page read-only in the spread.
- **Right page, today:** running head "Monday · 26 · x · 2026 / Folio ccc" (folio = the day of the year in lower-case Roman numerals; the board's "ccc" is a placeholder). Then the date line in Cormorant italic, the moon-phase mood, the title (Cormorant 600, 62 px; the editor may italicise words), a gilt ornament rule, and the body. The **first letter of the body is an illuminated initial**: a 74 px gold-leaf square with an oxblood Cormorant capital, and the next few words in small caps. Render it from the text, don't store it. Footer: "Saved 23:21 · 62 words" in mono and the folio in italics.
- **Ribbon:** an oxblood silk ribbon falls from the top of the right page past the cover's bottom edge. It's decoration only.
- **Photos on the page** get a slip-coloured frame with a double gold hairline and an italic Cormorant caption. Polaroids from filed scraps use the same frame.
- **Inkwell tray** (replaces the sticker sheet): a dark pill centred on the cover's bottom edge. It holds five recent stickers, a washi button, "My stickers", a **Cabinet** button and an ember-outline "Photo" button. Cabinet opens a drawer above the tray styled like the cabinet board: parchment panel, tabs **Grimoire · Herbarium · Hearth · Words · Moods · Washi · Mine**, and the stickers in a grid with their names. Tap to add, exactly as today.

### Page width (decision, veto it if you want)

The spread gives today's page about 640 px at 1440 px, so the 960 px logical page would shrink the text to about 12 px. **Change `PAGE_WIDTH` to 640** and keep the scale-to-fit logic. Existing pages store sticker positions in 960-space, so migrate on read: if a page has no `layout: 2`, multiply every sticker's `x`, `y` and `scale` by 2/3, then save it with `layout: 2`. A washi `length` is unscaled, so it stays as it is. Write a unit test for the conversion. Body text simply re-wraps.

### Screen sizes

| Width | Layout |
| --- | --- |
| 1280 px and up | The spread as drawn, book centred, max-width 1360 px |
| 900–1279 px (tablet, incl. the Tab S9 FE in landscape) | One page: today, on the cover, tabs still on the edge. The pocket page slides in from the left as a page-turn panel, opened from a "The pocket · 6" button in the header. The tray stays at the bottom. |
| Under 900 px | Catch, as before. Desk pages are read-only and show as a single parchment page. |

## Stickers & washi (cabinet board)

- **Presets:** rebuild `src/stickers/presets.tsx` from the cabinet board. Kebab-case ids from the captions: `moth`, `moon-star`, `candle`, `crystals`, `potion`, `tarot-moon`, `mushroom`, `crow-feather`, `d20`, `old-key`, `fern`, `lavender`, `pressed-rose`, `ginkgo`, `oak-leaf`, `rowan`, `teacup`, `black-cat`, `sleeping-tabby`, `yarn-hook`, `glazed-vase`, `heart-anatomical`, `rain`, `sun`, `sealed-letter`, `star`, `heart`. Group them as on the board (Grimoire, Herbarium, Hearth & home).
- **Word labels** are presets too: `word-good-day`, `word-rough-one`, `word-small-win`, `word-remember-this`, `word-night-shift`, `word-session-night`, `word-tea-blanket`, `stamp-survived`. They're HTML/SVG as drawn, with fixed text.
- **Mood moons** `moon-1` … `moon-5` work both as stickers and as the mood picker art.
- **How they're drawn:** mount one hidden `<svg><defs>` at app root holding the board's filters and gradients: `wc` (feTurbulence + feDisplacementMap, the watercolour edge), `cut` (feMorphology dilate 4.5 → `#FFFBF3`, the die-cut rim), `seal`, plus the radial gradients `ember`, `moss`, `gold`, `stone`, `ink`, `rose`, `plum`, `ox`, `cream`. Each sticker is `<g filter="url(#cut)">` around its art, and its fills sit in `<g filter="url(#wc)">`. The drop shadow is CSS `drop-shadow(0 3px 3px rgba(43,31,25,0.25))`. Prefix the ids (`db-…`) so they can't collide.
- **Washi:** 10 tapes as SVG `<pattern>`s from the board: `ember-stripe`, `night-sky`, `fern-print`, `moonstone-moths`, `moss-gingham`, `oxblood-gold`, `manuscript`, `moon-phases`, `gilded-vine`, `mulberry`. Each strip is a path with torn ends at 0.85–0.92 opacity. They replace the CSS gradients in `washi.ts`.
- **Washi stretches (new):** today the resize handle scales a tape evenly, so making it bigger only makes it fatter. Tape should get *longer* too, like tearing off more from the roll.
  - A washi sticker gets an optional `length`: its unscaled length in logical px. A tape without one is the current default length, so old tapes look the same. Drawn size is `length × scale` by `height × scale`: `scale` still sets the thickness, `length` sets the run.
  - When a tape is selected it shows a **stretch handle on each end** (44 px, a ↔ icon, `aria-label` "Stretch (or press , and .)"). Dragging one changes `length` along the tape's own axis, whatever its rotation; the other end stays put. The corner handle and pinch keep scaling it evenly, as now. Keys: `.` lengthens and `,` shortens by 10 px, with Shift by 1 px, like the arrow keys.
  - `length` is clamped to 60–1280 logical px (up to twice `PAGE_WIDTH`, so a strip can run corner to corner), and `clampPosition`, the hit area and `stickerBottom` use the stretched width.
  - Stretching must **tile the pattern, never stretch it**: the board's strips use `preserveAspectRatio="none"` at 320 × 44, which smears stars and moths when the tape gets long. Build each strip's path from its length, with the board's torn ends kept at their drawn size and straight edges in between, and keep the `<pattern>`s in `userSpaceOnUse`.
  - Washi in the tray and cabinet stays at its default length.
  - Unit tests: `baseSize` with and without `length`, the clamp, and that stretching from one end keeps the other end where it was at 0°, 90° and 30°.
- **Old pages keep working through aliases, not data rewrites:** `cat→black-cat`, `moon→moon-star`, `yay→word-good-day`, `sparkle→star`, `rainbow→sun` (`teacup`, `star`, `heart` keep their names); washi `pink-dots→oxblood-gold`, `lilac-dots→night-sky`, `peach-dots→ember-stripe`, `mint-gingham→moss-gingham`, `butter-gingham→mulberry`, `pink-gingham→manuscript`. An unknown ref falls back to `star`, as now.
- **Performance:** filters cost paint time. If a page with 30+ stickers drops frames while dragging, rasterise each preset once to an offscreen canvas and use the bitmap while dragging, then swap the SVG back on drop.

## Mood

`moods.ts` keeps the values 1–5 and their labels (rough, meh, okay, good, great). Swap the faces for moon phases: new, crescent, half, waxing gibbous, full. "Good" uses the ember fill on the page and the rest use gold. On the page the mood is a row of five 18 px moons with the chosen one enlarged and outlined in ember, plus the word in Cormorant italic. The picker on Catch uses the same five moons as 44 px buttons with `aria-pressed`.

## Screens (no board yet — build from these rules)

- **Sign in:** the closed book. A full cover centred on the ember-lit desk, with filigree corners, the tooled border, *Daybook* foil-stamped in Cormorant italic gold, and "Book one · MMXXVI". "Continue with Google" is a parchment button with ink text and a gold hairline, at least 48 px tall.
- **Locked:** the same cover with a wax-sealed clasp across it. "This book is locked." in Cormorant, then the owner-UID copy row, unchanged from v1, in mono on parchment.
- **Catch, `/catch`:** the ash desk with one parchment slip as the form, tilted −0.6° with a strip of washi on top. Label "What happened?" in Cormorant italic; text in Newsreader 18 px. Then the five moon buttons, the photo button (gold outline) and the primary **Tuck into the pocket**: full-width ember (`#E8742A`) with ink text `#1A1411`, 56 px. Confirmation toast: "Tucked in." "Earlier today" shows torn slips like the pocket page. The tray link becomes "The pocket · 3".
- **Pages, `/pages`:** months as chapters. Each month has its name as a Cormorant italic heading with a gilt rule, then a grid of small parchment cards: date in mono, title in Cormorant, the moon, and up to three mini stickers. The search field is a parchment input with a mono label "Search the book". When search finds nothing: "Nothing in here by that name. Yet."
- **Settings:** a parchment sheet sliding in from the right with a gold rule under the heading. "Day starts at" (mono time input), "Copy out the whole book" (export JSON, ember outline), "Close the book" (sign out). Same behaviour as v1.

Keep the v1 behaviour of every screen; only the look and the words change.

## Words

| Was | Now |
| --- | --- |
| Scrap tray | The pocket |
| on today's page | Bound in |
| Add to page | Bind into today's page |
| Sticker sheet | Inkwell tray / Cabinet |
| Tuck into tray | Tuck into the pocket |
| On this day (empty) | Sealed · {date} — Year one. Nothing to haunt you with yet. |
| Export everything | Copy out the whole book |
| Sign out | Close the book |

## Out of scope

No change to the data model except `layout: 2` on pages and the optional `length` on washi stickers (update the `stickers[]` shape in `BRIEF.md` and `isSticker` in `pages.ts` to match). No new collections, no dark/light toggle (the desk is dark, the pages are light), no custom-sticker upload yet. Photo-to-sticker stays in "Later".

## Acceptance checks

- [ ] At 1440 px the desk matches board 4.3. Compare side by side; same tokens, sizes and SVGs.
- [ ] At 1152 px (tablet landscape) today's page shows with 18 px body text, and the pocket slides in.
- [ ] Every preset, word label, moon and tape on the cabinet board renders in the app under the name in its caption.
- [ ] A page saved before this phase opens with its stickers where they were, relative to the page, and old preset and washi refs show their new art.
- [ ] Text contrast is at least 4.5:1 everywhere (the token table lists the pairs), and every tap target is at least 44 px.
- [ ] The network tab shows no font requests to Google. Only Firebase, the app itself, and image links pasted on purpose.
- [ ] Dragging 30 stickers on one page stays smooth on the tablet.
- [ ] A washi tape can be stretched longer and shorter from either end without getting thicker, at any rotation, and its pattern repeats instead of smearing. Old tapes open at their old length.

## Kickoff prompt

Unzip this package into the repo root, commit it, then paste:

```
We're redesigning Daybook. Read REDESIGN.md first, then BRIEF.md for
everything it doesn't change. The design boards are in design/redesign/:
BookGrimoire.dc.html (the desk) and StickerCabinet.dc.html (stickers and
washi). Copy values and SVG paths from their markup exactly.

Plan before you code: list the files you'll change or add, the font
packages you'll swap, and how you'll migrate PAGE_WIDTH 960 → 640, and how washi
stretching fits the sticker model.
Then wait for my go.

Build in this order and stop after each so I can check the live site:
1. Tokens, fonts, the shared SVG defs, the new sticker/washi/moon
   presets with the old-name aliases.
2. The desk: cover, spread, tabs, pocket page, today's page, inkwell
   tray and cabinet drawer, the tablet layout, the PAGE_WIDTH migration,
   stretchable washi.
3. Catch, Pages, Settings, Sign in and Locked from the rules in
   REDESIGN.md. If a screen needs a pattern the boards don't have,
   ask before inventing it.

Same rules as before: the security rules are the lock, no analytics or
third-party scripts, ask before adding a dependency REDESIGN.md doesn't
name.
```
