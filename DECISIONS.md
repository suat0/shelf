# Decisions

A running log, written as each decision is taken. Format is fixed by `CLAUDE.md`.

---

## 2026-08-14 — Android only; iOS is not built
Options: install Xcode (~10 GB) and target both platforms; Android only; neither, and run in Expo Go.
Chose: Android only — the machine has no Xcode and no Android SDK, and spending Friday evening on two toolchains puts Saturday's 90-minute scaffold budget at risk before a line of code exists.
Rejected because: a second platform doubles the surface for native build failures during U3, which `TASKS.md` already names as the most likely way the weekend fails. iOS is recorded as a known limitation in the README rather than pretended.

## 2026-08-14 — React Navigation, not expo-router
Options: `create-expo-app` default template (expo-router, file-based routing); `blank-typescript` template with React Navigation wired by hand.
Chose: `blank-typescript` + React Navigation native stack and tabs, as `SPEC.md` §3 specifies.
Rejected because: expo-router hides the navigator setup inside the file system. The auth-stack-to-tab-navigator transition is a thing to be able to explain out loud, and "I created a folder" is not an explanation of it.

## 2026-08-14 — `android/` is committed, `ios/` is not
Options: keep the Expo template's default (both native folders gitignored, regenerated via `expo prebuild`); commit both; commit `android/` only.
Chose: commit `android/` — `SPEC.md` §3 justifies running `expo prebuild` specifically so the native config is inspectable, and that claim is empty if the folder never reaches the repo.
Rejected because: leaving it ignored means a reviewer cannot see how Firebase is wired in — the Gradle plugin lines, `google-services.json` placement, the config-plugin output. That is precisely the JD line about native environments. `ios/` stays ignored because without Xcode it cannot be generated or built, and an uncompilable folder is noise.

## 2026-08-14 — App identity: Shelf / `com.suatkarabicak.shelf`
Options: leave the template's `ReactNativeProject` and rename near the release build; set the identity now.
Chose: set it now — `app.json` name `Shelf`, slug `shelf`, `android.package` `com.suatkarabicak.shelf`.
Rejected because: `android.package` is baked into the prebuild output. Changing it after `android/` is generated and committed means regenerating and re-reviewing the whole native folder during U5, which is the ship block with the least slack.

## 2026-08-15 — Named exports everywhere, including screens
Options: CLAUDE.md allows default exports for screen components (React Navigation convention)
Chose: Named exports for all components, including screens
Rejected because: Default exports allow inconsistent import naming across files; named exports keep IDE rename/auto-import reliable, which matters more than saving a few characters per import

## 2026-08-15 — Nested navigation: Catalog tab owns its own stack
Options: (a) Detail nested inside Catalog's stack, tab bar stays visible; (b) Detail as a top-level modal-style screen, tab bar hidden
Chose: (a) nested stack
Rejected because: the core loop is browse -> detail -> favourite -> check favourites; hiding the tab bar on Detail would force back-navigation before the user can check what they favourited

## 2026-08-15 — Access token in a module-scope store, not Zustand
Options: (a) accessToken as Zustand state; (b) accessToken in a plain module-scope
variable inside src/lib/api, Zustand only holds UI-facing session status
Chose: (b)
Rejected because: the single-flight refresh promise already has to live in module
scope (SPEC.md requires it) — putting the token in Zustand would still leave the
promise outside React state, splitting the coordination logic across two places.
(b) also keeps src/lib/api free of any dependency on src/features/auth, and keeps
the token out of reach of any Zustand devtools/inspection middleware that might
get added later.

## 2026-08-15 — Cold start: NetworkError keeps the session, ApiError clears it
Options: (a) any refresh failure on cold start signs the user out; (b) only a
real ApiError (expired/invalid token) signs out — a NetworkError (no internet)
leaves the stored session in place and lets the app continue as signed-in
Chose: (b)
Rejected because: (a) punishes a user for having no internet, not for having
an invalid session — indistinguishable from the "empty screen when cached data
exists" failure SPEC.md already warns against for the catalog. The risk (stale
token treated as valid until the next real request) is self-correcting once
the 401-refresh-replay flow in apiFetch exists.

## 2026-08-15 — Skip /auth/me on cold start restore
Options: (a) call GET /auth/me after a successful refresh to get the username;
(b) sign in with an empty username, since nothing currently displays it
Chose: (b)
Rejected because: no screen in the app shows the username outside a
hypothetical future profile screen — an extra network call for a value nothing
reads yet is unjustified. Revisit if a profile/account screen is added.

## 2026-08-16 — SQLite over AsyncStorage/Realm for the offline cache
Options: (a) AsyncStorage — single JSON blob per key; (b) Realm/WatermelonDB —
reactive NoSQL object databases; (c) SQLite via expo-sqlite, hand-written schema
Chose: (c)
Rejected because:
- AsyncStorage has no query engine — filtering or sorting means pulling the
  entire JSON blob into memory and doing it in JS. Fine at this app's scale,
  but doesn't scale past a few hundred rows, and there's no way to write a
  real WHERE/ORDER BY against it.
- Realm/WatermelonDB are reactive object databases built for offline-first
  apps where local writes need to auto-propagate to UI — real strength, but
  it's a native dependency with its own learning curve and mental model
  (not SQL), which is more setup and surface area than a two-day scope with
  one cached table justifies.
- SQLite gives real SQL — WHERE, ORDER BY, hand-written schema — at a
  complexity cost that fits a single products table and a single favourites
  table. The read-through pattern (SPEC.md 4.2) doesn't need reactivity from
  the DB layer either; TanStack Query already owns re-fetching and UI updates.

## 2026-08-16 — Read-through cache: separate state, not queryFn fallback
Options: (a) queryFn tries network first, falls back to SQLite only on
NetworkError; (b) pass cached rows as TanStack Query's initialData; (c) load
cached rows into their own useState via useEffect, network query runs
independently, screen merges the two for display
Chose: (c)
Rejected because: (a) makes network the primary source and cache the fallback
— the opposite of SPEC.md 4.2's "render from SQLite immediately, then fetch
and reconcile." (b) doesn't work structurally: initialData must be synchronous
and a SQLite read is async. (c) is more state to manage in CatalogScreen, but
it's the only option that actually shows cached rows first regardless of
network speed, not just on failure.
