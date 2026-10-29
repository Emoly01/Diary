# Daybook — Claude Code Brief

Oct 27, 2026 · @Emily

## What we're building

Daybook is a private sticker journal. Moments get caught on the phone in seconds, then turned into a typed, decorated page at the desk. It exists because handwriting brings no joy, typing does, and small moments get forgotten fast.

- **One person, one book.** Only the owner's Google account can open it.
- **Catch (phone):** one line of text, an optional photo, an optional mood. Three seconds, done. Works with no signal.
- **Desk (desktop, tablet):** the week's scraps wait in a tray. The owner writes the day's page, pulls scraps onto it, and decorates it with stickers and washi tape.
- **On this day:** the desk shows the page from the same date one year ago (then two, three…).

## Design reference

The look is set: build from the Claude Design canvas [Sticker Journal](https://claude.ai/artifact/2DM8khXMfFUKUiKD3kfwMi), boards **"C · Pastel planner"** (desk), **"Sign in"** and **"Catch (phone)"**. Ignore boards A (Ink desk) and B (Kraft & ink); they are rejected directions. If the link can't be opened from Claude Code, export the canvas and put its files in a `design/` folder.

| Token | Value | Used for |
| --- | --- | --- |
| desk | `#EEE8FB` + white dots, 30 px grid | App background |
| page | `#FFFFFF` + grid lines `rgba(194,56,107,0.09)` every 22 px | Journal page |
| ink | `#2E2A3B` | Main text |
| ink-soft | `#5F5873` | Secondary text (passes 4.5:1 on desk) |
| accent | `#C2386B`, pressed edge `#9E2456` | Primary buttons, add buttons |
| pink | `#FF9EC0` · `#FFD3E2` · `#FFDCE8` | Stickers, washi, scrap cards |
| lilac | `#C9B8F5` · `#D5CEEA` · `#F3EFFC` | Stickers, spiral rings, quiet buttons |
| mint | `#9ED9C5` · `#D4F3E6` | Stickers, scrap cards |
| butter | `#FFE38A` · `#FFF1B8` | Stickers, mood chip |
| peach | `#FFC9A8` | Stickers |
| display font | Fredoka 500–600 | Headings, labels, buttons |
| body font | Nunito 400–800; page body 18 px / 1.75 | Writing, scraps |
| radius | page 24 px · cards 12–22 px · pills 999 px | All surfaces |
| shadow | `0 6px 14px rgba(94,72,140,0.16)`; page `0 24px 48px rgba(94,72,140,0.2)` | Cards, page |

- **Stickers** are vector SVGs with a die-cut white edge: the same path stroked white (14 px) under the coloured fill, a soft lilac drop shadow, a slight tilt. Take the cat, teacup, star, heart, moon, sparkle, rainbow and speech-bubble SVGs straight from the desk board.
- **Washi tape** = semi-transparent strips with polka-dot or gingham patterns, tilted ±5°.
- **Spiral rings** run down the page's left edge.
- Icons are inline stroke SVGs, never emoji. Every tap target is at least 44 px.

## Stack & hosting

Vite + React + Firebase, deployed GitHub → Vercel, the same pipeline as the owner's other apps. Add nothing outside this table without asking.

| Layer | Choice | Notes |
| --- | --- | --- |
| App | Vite + React + TypeScript, React Router | Single-page app |
| Sign-in | Firebase Auth, Google provider | `signInWithPopup` (see Lock it down) |
| Data | Cloud Firestore, `persistentLocalCache` + `persistentMultipleTabManager` | Offline writes queue and sync on reconnect |
| Photos | Stored in Firestore, one compressed JPEG per document | No Storage bucket; stays on the free Spark plan |
| Editor | TipTap, StarterKit only | Paragraphs, bold, italic, headings, lists |
| Sticker handling | Pointer events + `@use-gesture/react` | Drag, pinch, rotate on touch |
| Install | `vite-plugin-pwa` | Installable; phone opens at `/catch` |
| Photo prep | `browser-image-compression` | Long edge 1200 px, JPEG, at most \~500 KB before encoding |
| Search | Fuse.js over cached page text | Client-side, no search service |
| Fonts | Fredoka + Nunito via `@fontsource` | Self-hosted: no request to Google Fonts |
| Hosting | Vercel, Git-connected | `vercel.json` rewrite of all routes to `index.html` |

- **Free plan, no bucket.** Photos live in Firestore next to the entries, so the app runs on the free Spark plan: 1 GiB stored, 50,000 reads and 20,000 writes a day ([Firestore quotas](https://docs.cloud.google.com/firestore/quotas)). One document is capped at 1 MiB and base64 adds about a third, so keep each photo under \~500 KB before encoding.
- **Photos and offline:** photos are ordinary Firestore writes, so they queue offline and sync on reconnect just like text. No separate upload queue.
- **No analytics, no trackers,** no third-party scripts besides Firebase.

## Lock it down

The security rules are the lock, not the UI. Firebase's web config is public by design, and any Google account can sign in to a Firebase project, so every read and write must check for the owner's UID.

1. **Sign in** with Google through Firebase Auth using `signInWithPopup`. Redirect sign-in breaks in browsers that block third-party storage when the app isn't on Firebase Hosting. If redirect is ever needed, transparently proxy `/__/auth/*` to `https://<project>.firebaseapp.com/__/auth/` (a Vercel rewrite, not a 302) and set `authDomain` to the app's own domain ([Firebase guide](https://firebase.google.com/docs/auth/web/redirect-best-practices)).
2. **Get the owner UID:** sign in once, copy the UID from the Firebase console's Authentication users list, and put it in the rules below and in the `VITE_OWNER_UID` env var.
3. **Firestore rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(uid) {
      return request.auth != null
        && request.auth.uid == uid
        && uid == 'OWNER_UID';
    }
    match /users/{uid}/{document=**} {
      allow read, write: if isOwner(uid);
    }
  }
}
```

4. **Photos need no extra rules:** they're Firestore documents under `users/{uid}`, so the rule above already locks them. There's no Storage bucket to secure.

5) **In the app:** if the signed-in UID isn't the owner's, show "This book is locked" and sign out. That screen is a courtesy; the rules do the work.
6) **Authorized domains:** add the Vercel production domain in Firebase Auth settings. Preview URLs change per deploy, so test sign-in on production or on a fixed preview alias.
7) **Env vars** in Vercel: the `VITE_FIREBASE_*` config plus `VITE_OWNER_UID`. They're not secrets, but keep them out of the repo.
8) **Stay out of search:** `<meta name="robots" content="noindex">` plus a `robots.txt` that disallows everything.
9) **Prove it:** rules tests with the Firebase emulator and `@firebase/rules-unit-testing`. The owner can read and write; another signed-in user and a signed-out visitor are denied everywhere.

## Data model

Everything lives under `users/{uid}`, and each page's key is its date, so "on this day" is a direct read rather than a query.

```
users/{uid}
  settings/main          { dayStartsAt: "04:00", timezone: "Europe/Berlin" }
  scraps/{scrapId}       { text, mood?, photoId?, capturedAt, day, pageDay, createdAt }
  pages/{day}            { day, title, body, plainText, mood?, stickers[], scrapIds[],
                           wordCount, createdAt, updatedAt }
  photos/{photoId}       { data, width, height, bytes, createdAt }
  customStickers/{id}    { name, photoId, createdAt }
```

- **`day`** is `YYYY-MM-DD` in the owner's timezone, with a rollover: anything before `dayStartsAt` (default 04:00) counts as the previous day. A scrap caught at 02:30 belongs to the day just lived, not the one starting.
- **`mood`** is 1–5: rough, meh, okay, good, great.
- **`pageDay`** is `null` while a scrap waits in the tray, and the page's day once it's filed. The tray query is `pageDay == null`, newest first. Add the composite index Firestore asks for.
- **`body`** is TipTap JSON. `plainText` and `wordCount` are kept in sync on save, for search and the footer.
- **`photos`** hold one compressed JPEG each as a base64 string in `data`, under \~700 KB encoded so the document stays below Firestore's 1 MiB cap. They sit in their own collection so the tray, archive and search never download image bytes. Fetch a photo only when it's on screen.
- **`stickers[]`** items are `{ id, kind: "preset" | "washi" | "custom" | "photo" | "link", ref, x, y, rotation, scale, z, length? }`. `length` is a stretched washi tape's unscaled length in logical px; it is absent on every other sticker and on unstretched tape (REDESIGN.md). Pages carry `layout: 2` once their positions are on the 640 px page. `ref` is the preset name, a `photoId`, or the image URL for `link`. A filed scrap's photo becomes a `photo` sticker in a polaroid frame.
- **Fixed page width:** render the page at one logical width (960 px; 640 px since Phase 6, see REDESIGN.md) and scale it to fit the screen. Text then wraps the same on every device, and sticker `x`/`y` in logical px stay exactly where they were put.

## Screens & behaviour

There are four screens and one settings sheet. Catch is built for speed, the desk for writing, and nothing blocks on the network.

### Sign in (board "Sign in")

- Pink spiral-planner cover with stickers and a "Continue with Google" button (popup).
- Non-owner: "This book is locked", then sign out.

### Catch, `/catch` (board "Catch (phone)")

- The text box is focused on open. The installed app opens here on a phone.
- Optional photo from the camera or gallery (`<input type="file" accept="image/*">`), compressed before saving.
- Optional mood: five faces, one tap, tap again to clear.
- "Tuck into tray" saves instantly (optimistic), clears the form and shows a short confirmation. It never waits on the network.
- "Earlier today" lists today's scraps, newest first. Tap one to edit or delete it.
- The tray button (with a count) goes to the desk.

### Desk, `/` (board "C · Pastel planner")

- **Scrap tray (left):** unfiled scraps, newest first, plus today's filed ones marked "on today's page". "+" files a scrap: its text goes in at the cursor as a paragraph, its photo becomes a polaroid sticker, and the scrap is marked filed.
- **Today's page (centre):** date pill, mood chip, title, body editor, sticker layer, washi tape, spiral rings. Autosaves about 1 s after typing stops; the footer shows "saved hh:mm" and the word count.
- **On this day (right):** the page from this date one year back, then two, three…, as a small card that opens read-only. Year one shows the empty state.
- **Sticker sheet (right):** tabs Stickers / Washi / Mine. A tap adds the sticker to the middle of the page, then it can be dragged. A selected sticker shows rotate and scale handles and a delete button; Delete or Backspace removes it.
- **Photos on the page:** "Add photo" in the sticker sheet takes a picture from the device (compressed and saved like a scrap photo) or a pasted image link such as Imgur, for pictures that are already public. Every photo is a sticker: drag, rotate, resize and layer it anywhere on the page. A linked photo loads from its host and isn't covered by the lock.

### Pages, `/pages`

- Month-by-month grid of past pages: title, date, mood, a few stickers. Any page opens on the desk and stays editable.
- Search box over titles and text (Fuse.js, client-side).

### Settings (sheet from the account button)

- Day starts at (default 04:00).
- Export everything: one JSON file with every scrap, page and photo.
- Sign out.

### Screen sizes

| Width | Layout |
| --- | --- |
| 1600 px and up | Three columns, as drawn |
| 1280–1599 px | Tray on the left and the page; the sticker sheet opens from a header button (changed in Phase 4: a third column squeezed the 960 px page to ~10 px text at 1280 px) |
| 900–1279 px (tablet) | Tray and right rail become slide-over panels opened from the header; the page stays central |
| Under 900 px (phone) | Opens Catch; desk pages are read-only there, with a link back to Catch |

## Build phases

There are five phases, built one at a time. Stop at the end of each so the owner can check it on the live site before the next one starts.

1. **Foundation:** repo, Vite app, Firebase project (free Spark plan), Google sign-in, owner check, rules deployed and tested, theme tokens and fonts, app shell, Vercel deploy.
   - Done when: the owner signs in on the Vercel URL, and a second Google account gets "This book is locked" with every read denied.
2. **Catch:** `/catch`, PWA install, creating, editing and deleting scraps, mood, photos compressed and saved to Firestore.
   - Done when: a scrap with a photo caught in airplane mode shows up on the desk after reconnecting.
3. **Desk writing:** a page per day with the 04:00 rollover, the TipTap editor, autosave, the tray and filing.
   - Done when: three filed scraps land on today's page as paragraphs plus a polaroid, and a reload shows everything as it was left.
4. **Stickers & tape:** the preset set (SVGs from the canvas), washi tapes, photos added at the desk (device or pasted link), drag, rotate, scale, delete, stacking order, saving.
   - Done when: stickers stay exactly in place after resizing the window and after opening the page on another device.
5. **Memory:** On this day, the Pages archive, search, export.
   - Done when: a page seeded for 26 Oct 2025 in the emulator shows on 26 Oct 2026, and export downloads every scrap, page and photo.

**Later, not now:** photo-to-sticker with background removal in the browser, uploading custom stickers, a gentle "4 scraps waiting" nudge, dark mode, more than one page per day.

## Acceptance checks

Tick these off before calling v1 done.

- [ ] A second Google account can't read or write anything (emulator test and a live try)
- [ ] Signed-out requests to Firestore are denied
- [ ] Catch saves with no signal and syncs later, photo included
- [ ] A scrap caught at 02:30 lands on the previous day
- [ ] A quick reload right after typing never loses text
- [ ] Stickers keep their place across window sizes and devices
- [ ] On this day finds last year's page
- [ ] Every tap target is at least 44 px, and text meets 4.5:1 contrast
- [ ] The network tab shows no requests except Firebase, the app itself and image links pasted on purpose
- [ ] Export contains every scrap, page and photo

## Kickoff prompt

Export this doc as Markdown, save it as `BRIEF.md` in a new repo, then paste this into Claude Code:

```
You're building Daybook, a private sticker journal. The full brief is in BRIEF.md.
The design is the Claude Design canvas linked there: use the boards
"C · Pastel planner", "Sign in" and "Catch (phone)". Ignore boards A and B.

Build Phase 1 only. Before writing code, list the files you'll create and the
Firebase console steps I have to do by hand, then wait for my go.

Rules: the security rules are the lock, not the UI. No analytics or third-party
scripts. Ask before adding any dependency that isn't in the brief. Stop at the
end of each phase so I can check it on the live site.
```

## Decisions made for you (veto any)

These were judgment calls, not requirements. Change any line here before Phase 1 starts.

- **Name:** Daybook is a working title.
- **One page per day,** keyed by date.
- **The day rolls over at 04:00,** not midnight.
- **Phone = Catch.** On a phone the desk is read-only.
- **Fonts are self-hosted,** so the app makes no outside requests.
- **The lock is a single UID** written into the rules.
- **Photos live in Firestore,** shrunk to about 1200 px. That keeps the app on the free plan and puts photos behind the same lock as the text; the cost is no full-size originals. Pasted links (Imgur and the like) also work, but those pictures are only as private as their host.
- **Database region:** Frankfurt (europe-west3) keeps the journal close to home. Pick it when creating the database, because it can't be moved later.
- **Photo → sticker** comes later, not in v1.

## Sources

- [Firestore quotas and limits](https://docs.cloud.google.com/firestore/quotas)
- [Best practices for using signInWithRedirect on browsers that block third-party storage access](https://firebase.google.com/docs/auth/web/redirect-best-practices)
