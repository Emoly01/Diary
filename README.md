# Daybook

A private sticker journal. One person, one book. The full brief is in [BRIEF.md](BRIEF.md);
the design boards it builds from are exported in `design/project/`.

**Status:** Phase 1 (foundation): Google sign-in, owner lock, Firestore rules and tests,
theme and fonts, app shell.

## Run it locally

```sh
npm install
cp .env.example .env.local   # fill in the Firebase web config
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck and production build into `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run test:rules` | Starts the Firestore emulator and runs `tests/rules.test.ts` (needs Java 11+) |

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
11. Reload the site. The page footer should say **Book unlocked**. If it says the lock
    refused the account, the UID in the deployed rules doesn't match.

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
