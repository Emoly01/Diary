# Daybook

A private sticker journal. One person, one book. The full brief is in [BRIEF.md](BRIEF.md);
the design boards it builds from are exported in `design/project/`.

**Status:** Phase 4 (stickers and washi tape). Built so far:
- **Phase 1:** Google sign-in, the owner lock, Firestore rules and tests, theme and fonts, the app shell.
- **Phase 2:** quick capture at `/catch` (text, photo, mood) that works offline, the scrap tray on the
  desk, and installing as an app.
- **Phase 3:** one page per day with the TipTap editor and autosave, filing scraps from the tray onto
  the page (text as paragraphs, photos as polaroids), and the tablet and phone layouts.
- **Phase 4:** the sticker sheet (eight presets, six washi tapes), photos added at the desk from
  the device or a pasted link, and drag, rotate, scale, delete and stacking order for every sticker.

## Run it locally

```sh
npm install
cp .env.example .env.local   # fill in the Firebase web config
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server against the real Firebase project in `.env.local` |
| `npm run build` | Typecheck and production build into `dist/` (includes the service worker) |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests (`src/**/*.test.ts`), e.g. the 04:00 day rollover |
| `npm run test:rules` | Starts the Firestore emulator and runs `tests/rules.test.ts` (needs Java 11+) |
| `npm run emulators` | Starts the Auth and Firestore emulators for local dev |
| `npm run dev:emulator` | Dev server against those emulators (settings in `.env.emulator`) |

With the emulators, the Google pop-up signs you in as a fake emulator account. That account is
locked out unless it has the owner UID. Create one from the browser console with
`daybookEmulatorSignIn('<uid>')`, which exists only in emulator builds.

The rules tests use whatever UID is written in `firestore.rules`, so they run before and
after you fill in the real one.

## One-time setup

### Firebase (console.firebase.google.com)

1. **Create a project** on the free Spark plan. **Turn Google Analytics off** in the wizard.
2. **Add a Web app** (the `</>` icon). Copy the config values. Leave Firebase Hosting unticked.
3. **Authentication → Get started → Sign-in method → Google → Enable.**
4. **Firestore Database → Create database**, location **europe-west3 (Frankfurt)**,
   **production mode**. The location can't be changed later.

### Vercel

5. **Add New → Project → import `Emoly01/Diary`.** Framework preset: Vite.
6. **Environment variables:** every `VITE_FIREBASE_*` value from step 2.
   Leave `VITE_OWNER_UID` out for now. Deploy.
7. Back in Firebase: **Authentication → Settings → Authorized domains → Add** the Vercel
   production domain (e.g. `daybook-xyz.vercel.app`). Preview URLs change per deploy, so
   test sign-in on production.

### Lock it to you

8. Open the production site and sign in. You'll see "This book is locked" with your
   account ID and a copy button (that only shows while no owner is set).
9. Put that ID in two places:
   - `firestore.rules`: replace `OWNER_UID`, commit.
   - Vercel: add `VITE_OWNER_UID`, then redeploy.
10. **Deploy the rules**, either:
    - paste `firestore.rules` into **Firestore → Rules → Publish**, or
    - `npx firebase login` then `npx firebase deploy --only firestore:rules --project <project-id>`.
11. Reload the site. The desk opens on today's page. If a yellow banner says the lock refused
    this account, the UID in the deployed rules doesn't match.

### Prove it

12. Sign in with a second Google account: it gets "This book is locked" and is signed out.
    The rules deny it every read and write regardless (`npm run test:rules`).

## Notes

- The Firebase web config isn't secret; the rules are the lock. The owner UID is in
  `firestore.rules` in plain text on purpose: it's an identifier, not a credential.
- `package.json` pins `@firebase/app` and `@firebase/app-compat` via `overrides`. Firebase
  12.19 pins older copies than npm hoists for its other packages, which splits the SDK
  into two registries ("Service firestore is not available"). Drop the overrides when
  upgrading Firebase and check that `npm ls @firebase/app` shows a single version.
- No analytics, no third-party scripts. Fonts are self-hosted via `@fontsource`.
- Two requests to Google hosts come from the Firebase SDK itself:
  - `apis.google.com/js/api.js`: Firebase Auth's pop-up helper, loaded when you sign in.
  - `www.google.com/images/cleardot.gif`: Firestore's connectivity probe, sent while the
    network is down.
- The photo compressor's web worker script is served from the app (see `src/data/photos.ts`).
  Without that, `browser-image-compression` loads it from `cdn.jsdelivr.net`.
- Scrap lists are sorted on the device, so Firestore needs no composite indexes.
- **Autosave and drafts.** The page saves to Firestore a second after typing stops, and at once
  when the tab hides or closes. Every keystroke is also copied to a draft in `localStorage`, so a
  reload never loses text: on open, a draft newer than the saved page wins. A draft is deleted
  once Firestore has the page.
- `/` is today's page, using the 04:00 rollover; `/day/YYYY-MM-DD` opens any other day.
- Filing is one-way: deleting a filed scrap's paragraph doesn't send it back to the tray.
- **Stickers** are stored on the page as logical-px positions on the 960 px page, so they sit in the
  same spot at every window size and on every device. Handling them:
  - **Mouse or touch:** drag to move, pinch to scale and turn on touch, or use the handles.
  - **Keyboard** (on a focused sticker): arrows move it (Shift for 1 px steps), `[` and `]` turn it,
    `+` and `-` resize it, and Delete or Backspace removes it.
- Removing a photo added at the desk deletes the stored picture too. Removing the polaroid of a
  filed scrap keeps the picture, because the scrap still uses it.
- Pasted image links must be `https`, and they're loaded with `referrerpolicy="no-referrer"`.
- **Screen sizes:**
  - **1600 px and up:** tray, page and sticker sheet, side by side.
  - **1280–1599 px:** tray and page; the sticker sheet opens from the **Stickers** button. This
    keeps page text at 16–18 px; three columns would shrink it to ~10 px.
  - **900–1279 px:** the page alone; tray and sheet slide over.
  - **Under 900 px:** the page is read-only.

## Installing on a phone

Open the site in the phone's browser and sign in once.
- **iPhone (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu (⋮) → Install app.

The installed app opens at Catch and works with no signal. Scraps and photos caught offline
sync the next time there's a connection; until then they show "not synced yet".
