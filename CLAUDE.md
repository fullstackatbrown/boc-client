## Project Overview & Tech Stack
This repository serves as the frontend of the Brown Outing Club's website. The primary purpose of the website is to serve as a platform for trip leaders to plan trips that trip participants can sign up on. The secondary purpose of the website is to act as a source of information about the club and the services it offers.

Tech Stack:
- Node.js - dependency management
- Next.js 16 (App Router) w/ TypeScript and Tailwind - frontend framework, language, and styling choices
- next-auth v5 (beta) - authentication
    - Google Auth - external API used with next-auth for authentication
- axios - web requests; used primarily to communicate with the site's backend
- firebase (Firestore, client SDK) - communications with the site's Firebase

Backend Components:
- SQL Data Server - primary data store, storing core data regarding all users, trips, and trip signups - interactable via REST API. Lives in the sibling `boc-server/` repository; see `../CLAUDE.md` for cross-repo context.
- Firebase - auxiliary data store used for club *content* (leader profiles, gear room hours, photos)

Deployment: this app is deployed on Vercel. The Express backend runs separately on a GCP VM. `NEXT_PUBLIC_BACKEND` selects which backend the app talks to; `.env` keeps the alternatives commented out so you can switch between local (`http://localhost:8080`) and the deployed server.

## Local Development
```
npm run dev      # next dev on :3000
npm run build    # production build
npx tsc --noEmit # typecheck — currently clean, keep it that way
```
Almost nothing on this site renders usefully without the backend running. For any work touching trips, users, or signups, start `boc-server` locally first (`node server.mjs` in ../boc-server, with `default_insts.mjs` run once to seed). The backend's CORS allowlist already includes `http://localhost:3000`.

Env vars (`.env` / `.env.local`, both gitignored):
- `NEXT_PUBLIC_BACKEND` - base URL for the Express server; consumed by `src/scripts/api.ts`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - Google OAuth app credentials
- `NEXT_PUBLIC_E2E` - set to `1` to register the test-login provider (see Test Logins). Never set in a deployed environment.
- `AUTH_SECRET` - next-auth JWT secret. Note the auth route reads `process.env.NEXTAUTH_SECRET`, which is unset; next-auth v5 falls back to `AUTH_SECRET`, so this works, but the explicit `secret:` line is misleading.

Firebase config is **hardcoded** in `src/scripts/firebase.ts`, not env-driven. That is a public client config (Firestore read rules do the actual protecting), but it means the Firebase project cannot be swapped per-environment without editing code.

## Annotated File Tree
```
./
| - src/
| | - app/
| | | - about/
| | | | - our-team/ - leaders and their roles; reads Firestore `team` collection + `assets/team-picture`
| | | | - financial-aid/ - mostly static, but pulls treasurer names/emails from Firestore `team/treasurer1` and `team/treasurer2`
| | | | - land-tribute/, page.tsx - static, text-only about pages
| | | | - photo-album/page.disabled.tsx - DEAD (see Known Dead Code)
| | | - gear-room/ - gear rental info + policies subpage; pulls Firestore `gear-room/contact` and `gear-room/hours`
| | | - get-involved/ - listserv signup button; posts to /user/listserv-add
| | | - logout/ - auto-signOut page with a 2s delay
| | | - trips/
| | | | - page.tsx, TripDisp.tsx, CreationButton.tsx - trips browse page (Open trips vs. past/closed)
| | | | - creation-form/ - trip creation form, leaders/admins only
| | | | - view/ - trip detail page; the most complex area of the site (see Trip Page Architecture)
| | | | - trips-form/ - DEAD (see Known Dead Code)
| | | - user/ - profile page: user info, editable phone, tables of hosted/upcoming/past trips
| | | - api/auth/[...nextauth]/route.ts - next-auth config: Google provider, token refresh, @brown.edu/@risd.edu allowlist
| | | - api/auth/error/page.tsx - shown when the email-domain check rejects a login
| | | - layout.tsx - SessionProvider, Header/Footer, fonts, mobile-view blocker
| | | - page.tsx - splash/home page
| | - assets/ - static images, icons
| | - components/ - React components shared across the site
| | - models/models.tsx - types/interfaces mirroring the JSON shapes the backend returns
| | - scripts/
| | | - api.ts - the bare axios instance (baseURL = NEXT_PUBLIC_BACKEND)
| | | - firebase.ts - Firestore app init; exports the `db` handle
| | | - requests.ts - THE way to talk to the backend; see Backend Request Pattern
| | - styles/ - Google font imports (Chelsea Market, Gabarito) + Tailwind entrypoint
| | - types/next-auth.d.ts - module augmentation putting accessToken/refreshToken on Session and JWT
| | - utils/utils.ts - shared utilities (currently just formatDateString)
| - helpers/add_leadership.py - one-off admin script for seeding Firestore leadership history; not part of the app
| - tailwind.config.ts - the BOC color palette and font families
```

## Backend Request Pattern
**Never call `api` (raw axios) directly from a page or component.** Use `makeRequesters()` from `src/scripts/requests.ts`:

```ts
const reqs = makeRequesters();
const { backendGet, backendPost, sessionStatus } = reqs;
```

`makeRequesters` is a hook (it calls `useSession`) — it must be called at the top level of a client component, never conditionally or in a callback. It exists to solve one specific problem: next-auth's session starts in a `"loading"` state, and a naive request fires before the Google access token is available. So:
- `backendGet(path, noAuth?)` / `backendPost(path, body)` **await the session becoming ready** before attaching `Authorization: Bearer <googleAccessToken>`. Pass `noAuth: true` to `backendGet` for genuinely public data (e.g. `/trips`) so it doesn't block on auth.
- `sessionStatus()` resolves once the session is no longer loading, returning `AuthStat.Auth` or `AuthStat.Unauth`. Use it when the *shape* of the request depends on whether the user is logged in (see `trips/view/page.tsx`, which decides whether to send `noAuth`).
- Known sharp edge: if the user is unauthenticated, pending authenticated requests **hang forever** rather than rejecting — they just log to the console. Gate on `sessionStatus()` first rather than relying on a `.catch`.

`src/components/Header.tsx` is the one place that still calls `api.get` directly with a manually-attached token. That's legacy; don't copy it.

The token sent to the backend is the raw **Google** access token, not a next-auth session token. `boc-server` validates it by calling Google's userinfo endpoint on every request. That means backend auth failures usually trace back to token refresh, not to anything in this repo.

## Type Mirroring
`src/models/models.tsx` hand-mirrors the JSON that `boc-server` returns. There is no codegen and no runtime validation — if a backend response shape changes, TypeScript will happily lie to you. When a task spans both repos, change `models.tsx` and `../boc-server/route_descs.txt` together.

Key correspondences:
- `Trip` mirrors the Sequelize Trip model. `date: Date | null` is a frontend-only convenience field, not sent by the backend.
- `TripWithSignup` is what `GET /trip/:id` returns: a Trip plus `userData` (the requesting user's own signup, or null), `leaders`, and — for leaders on Pre-Trip-or-later trips — `participants`.
- `TripStatus` / `SignupStatus` string values must match the backend's ENUMs exactly, including the hyphen in `"Pre-Trip"` and the space in `"Signed Up"`.
- `TripClass.Free = 'Z'` — the free-trip sentinel, checked in SignupButton to suppress payment UI.

## Trip Lifecycle (drives most of the UI)
`Staging -> Open -> Pre-Trip -> Post-Trip -> Complete`, strictly forward. Nearly every conditional in `trips/view/` is a function of (trip status) x (viewer's role) x (viewer's signup status):
- **Staging** — private. `GET /trip/:id` returns 401 to non-leaders; the view page alerts and redirects to /trips.
- **Open** — public, signups accepted. Leaders see signup counts.
- **Pre-Trip** — lottery has run. Participants are Selected / Waitlisted / Not Selected; leaders can add from the waitlist, remove participants, and track confirm/pay.
- **Post-Trip** — the trip date has passed (the backend cron ticks this at 5am). Leaders take attendance.
- **Complete** — attendance recorded; the page is read-only.

The status bar in `BottomLeaderControls.tsx` renders each stage as Past / Current / Next / Future and only the "Next" button is clickable — that's how a leader advances the trip. Note that Post-Trip is *not* leader-triggered (the button just explains that it happens automatically on the trip date).

`SignupButton.tsx` is the participant-side mirror: a big switch over `trip.userData.status` and `trip.status` producing one of ~12 message/button states. Read it before changing anything about signup UX.

## Trip Page Architecture (`src/app/trips/view/`)
```
page.tsx               fetches GET /trip/:id (auth-aware), handles 401/404, renders:
  TripPageContents     title + blurb (editable in place for leaders)
    TripInfoBar        image, leaders, category, dates, cost + SignupButton
      EditableCost     cost editing (class vs priceOverride)
      SignupButton     participant-facing state machine
    BottomLeaderControls   leader-only: sentenceDesc, maxSize, status bar
      KeyInfoBar       participant lists and counts, varying by trip status
        ParticipantList
      AttendanceForm   Post-Trip only
```

**The inline-edit pattern.** `editable.tsx` exports `EditableString` / `EditableComponent`: click a value, it swaps to an input, Enter POSTs `{ field: newValue }` to `/trip/:id/lead/alter` and then `window.location.reload()`. Every leader-facing field edit goes through this. To make a new field editable, supply `currVal`, a display node `withIcon`, an `editEl` input element, and a `createBody` function. `TripInfoBar` extends this with an `EditItems` shape for fields needing a `<select>` or a custom current-value transform.

**Reload-after-mutate is the convention here.** Most mutations end in `window.location.reload()` or a `window.location.href` assignment rather than optimistic state updates. It's blunt but consistent — follow it unless you're deliberately reworking a flow.

**Error handling convention.** Backend 403/422 responses surface the server's `errMessage` in an `alert()`; anything else alerts a "you shouldn't be seeing this, contact an admin" message and logs. `AttendanceForm.tsx` has the cleanest version (`handleNetError`); prefer that shape for new code.

## Conventions & Gotchas
- **Dates.** Use `formatDateString` from `@/utils/utils` for `yyyy-mm-dd` strings from the backend. Do **not** use `new Date(str).toLocaleDateString()` — it shifts the date back a day due to UTC parsing. This bug has been fixed more than once; don't reintroduce it.
- **`useSearchParams` requires a Suspense boundary** in this Next version. Any component reading it must be wrapped — see `trips/view/page.tsx`, `SignupButton.tsx`, `get-involved/page.tsx`, `api/auth/error/page.tsx` for the established pattern (inner `*Content` component + exported wrapper).
- **Post-login actions.** Signing up for a trip or joining the listserv while logged out redirects to Google with a `post_login_action` query param, then an effect on return performs the action. Preserve that param plumbing if you touch those flows.
- **Styling.** Use the palette tokens in `tailwind.config.ts` (`boc_green`, `boc_darkbrown`, `boc_lightgreen`, `boc_yellow`, `boc_medbrown`, `boc_slate`, ...) rather than raw hex or stock Tailwind colors. `font-funky` (Chelsea Market) is for headings; `font-standard` (Gabarito) is body; `font-montserrat` is nav.
- **Navigation** is done with `window.location.href` and plain `<a>` tags throughout, not `next/link`. Consistent, if not idiomatic.
- **Desktop-only, for now.** Layouts assume a viewport of at least 1150px; nothing below that has been designed. `layout.tsx` still contains the mobile-view blocker that used to hide the site below that width, but it is currently commented out, so small screens get the desktop layout rather than the explanatory message. Bringing in real mobile views is a goal that hasn't been started — assume desktop when writing new UI, and don't assume any existing component is responsive.
- `@types/react` is pinned at 18.x while `react` is 19.x. Typecheck passes anyway; don't "fix" this without checking it doesn't cascade.

## Firebase / Firestore Content Model
Firestore holds editable club *content* so it can be changed without a deploy. Reads are client-side in `useEffect`, always wrapped in try/catch that logs and leaves a loading placeholder on failure. Documents in use:
- `team` (collection) — leader profiles: `{ name, image, index, display, position, category, email }`. `category` is `"core"` or `"general"`; `display: false` hides an entry; `index` controls sort order. Also read individually as `team/treasurer1` and `team/treasurer2` by the financial-aid page.
- `assets/team-picture` — `{ link }` for the group photo
- `gear-room/contact` — `{ managers, email }`
- `gear-room/hours` — `{ schedule: Day[] }` where `Day` is `{ day, hours[], info? }`
- `photo-album` (collection) — read only by the disabled photo album page

Note the split: leader *identity/photos* live in Firebase, while leader *trip statistics* come from the Express server's `/public/leader-stats` and `/public/leader-trips` routes (matched by first and last name, which is fragile).

## Verification Loop
The current bar for a change is:
0. `npm run test:e2e` for anything touching the trip lifecycle (see End-to-end tests)
1. `npm test` passes (Vitest, see Tests below)
2. `npx tsc --noEmit` passes clean (it currently does — a new error means you introduced it)
3. `npm run build` succeeds for anything touching routing, Suspense boundaries, or server/client component boundaries
4. Manual browser check with `boc-server` running locally. State which pages and which roles you exercised. Because so much UI branches on trip status and viewer role, say explicitly which branch you verified — e.g. "checked as leader on an Open trip" — and which you did not.

### Tests
```
npm test          # one-shot run
npm run test:watch # re-runs on save
```
Vitest, configured in `vitest.config.ts`, picking up `src/**/*.test.ts`. There is deliberately **no jsdom and no @testing-library** — these are pure-logic tests over plain TypeScript functions, which is why they need no DOM, no mocks, and no running backend, and finish in well under a second.

What's covered today is the trip page's decision logic, extracted out of its components precisely so it could be tested:
- `src/app/trips/view/signupVariant.ts` — `selectSignupVariant(trip)` returns which of 15 signup panels a viewer should see, given trip status, their role, and their signup's status/confirmed/paid. The JSX for each panel stays in `SignupButton.tsx` (it closes over request helpers and component state); only the choice is extracted.
- `src/app/trips/view/statusBarState.ts` — `stageState(stage, current)` decides Past/Current/Next/Future for each button in the leader status bar.

Both use a compile-time exhaustiveness guard (`const _exhaustive: never = ...`), so adding a new `SignupStatus` or `TripStatus` breaks the typecheck until every branch is handled. The guard deliberately does not throw at runtime.

When adding logic to the trip page, prefer this shape: pure decision function in its own module, JSX mapping in the component. Component-level tests would need jsdom and `@testing-library/react` added — don't reach for that without discussing it first.

### End-to-end tests
```
npm run test:e2e          # headless
npm run test:e2e:headed   # watch it drive a real browser
```
Playwright, configured in `playwright.config.ts`. It boots **both** servers itself (`boc-server` with `DEVELOPING`, `next dev` with `NEXT_PUBLIC_E2E=1`) and reseeds the database in `e2e/global-setup.ts`, so **running it replaces your local dev data**. Takes about 15 seconds. This is a pre-PR check, not a save-hook.

`e2e/lifecycle.spec.ts` walks one trip through the entire lifecycle — create, open, six signups, lottery, confirm, pay, remove a participant, pull a replacement off the waitlist, run the trip, take attendance (Attended / No Show / Excused Absence plus a walk-on who never signed up), and check the result on a participant's profile.

Conventions worth preserving if you extend it:
- **Actions go through the UI; the backend is queried only to discover state.** The lottery is random, so the test asks who was selected rather than assuming. `backendGet` in `e2e/fixtures/harness.ts` is for discovery only — don't use it to perform actions, or the test stops testing the wiring.
- **Any `alert()` fails the test.** `watchDialogs` records every dialog; a walk that is supposed to succeed must raise none. Since this app reports every backend rejection through `alert()`, that one assertion covers every 403/422 the server can produce.
- **Use `clickAndSettle` for anything that mutates.** Handlers here end in `window.location.reload()`, and navigating during that reload aborts it (`net::ERR_ABORTED`).
- `Pre-Trip -> Post-Trip` has no UI trigger and no route — only the 5am cron does it — so the test shells out to `boc-server/test-helpers/run-trip.mjs`. That is the single place it reaches around the interface, and `runTrip`'s own guards still apply.

To exercise leader/participant branches locally, seed with `node default_insts.mjs` in ../boc-server (users 1-4, trips 1-9 spanning Staging/Open/Pre-Trip/Post-Trip) and switch identity via the `TESTID` constant with `phonyAuth` enabled in server.mjs.

### Test Logins
Automated tests and manual multi-user testing both need to act as several different people in one session, which real Google auth can't do. Setting `NEXT_PUBLIC_E2E=1` registers an extra next-auth Credentials provider (id `e2e`) that signs in as any @brown.edu / @risd.edu address without contacting Google:

```ts
signIn("e2e", { email: "ada.lovelace@brown.edu" })
```

The session it mints carries an `e2e:<email>` access token in place of a Google one, which `boc-server` accepts while its own `DEVELOPING` flag is set. Both halves must be enabled for this to work, and both are separately gated off in production builds. See the Test Identity Bypass section of `../boc-server/CLAUDE.md` for the backend side and the security caveats.

This is what makes the trip lifecycle testable at all — reaching Pre-Trip or attendance states needs a leader plus several participants acting in sequence.

## Known Dead / Broken Code
Documented so you don't waste time on it. Leave it alone unless asked:
- `src/app/trips/trips-form/` — a legacy form posting to a Google Apps Script endpoint, superseded by `creation-form/`. Still routable at `/trips/trips-form`, unlinked from anywhere.
- `src/app/about/photo-album/page.disabled.tsx` — intentionally disabled by filename; its nav entry in `Header.tsx` is commented out.
- `our-team/page.tsx` cards `router.push` to `/team/${resource.id}`, but no `src/app/team/` route exists — clicking a leader card 404s.
- Trip filters on `/trips` (name/date/size) are fully implemented but commented out of the render, deemed "kinda silly".
- `src/app/user/page.tsx` reads `tripInfo.otherLeaders`, a field the backend never sends (`GET /trip/:id` returns `leaders`). That lookup always falls through to the empty-array branch, so the `leaders` column it builds is effectively dead.

## General Notes
- Please confirm changes with user before committing unless told otherwise