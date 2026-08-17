# Shelf

A React Native catalog client: token-refreshing auth, an offline-capable product list
backed by SQLite, and search that cancels itself.

**[▶ Download APK — v1.0.0](../../releases/latest)** (~95 MB, Android 7.0+)
React Native · TypeScript · TanStack Query · SQLite · React Native Paper · 12 tests


Test credentials (from [DummyJSON](https://dummyjson.com/docs/auth)) are prefilled on
the login screen — a deliberate demo affordance so a reviewer can get in with one tap:
`emilys` / `emilyspass`.

---

## Running it

Requires Node 22.13+ (Expo SDK 57).

```bash
git clone https://github.com/suat0/shelf.git
cd shelf
npm install
npx expo prebuild --platform android
npx expo run:android
```

This project uses native modules (SQLite, Firebase) that Expo Go doesn't support —
`expo run:android` builds and installs a development build, it doesn't open Expo Go.

## Running the tests

```bash
npm test
```

12 tests across auth, the API client, the read-through cache, search debounce, and
favourites persistence. See [Testing](#testing) below for what each area covers.

---

## Architecture

```
src/
├── features/
│   ├── auth/        # Login, session store, token coordination, refresh
│   ├── catalog/      # List, search, detail, product row, query hooks
│   └── favourites/    # Favourites screen
├── lib/
│   ├── api/          # Typed client, token attachment, 401 handling
│   ├── db/            # SQLite schema and hand-written queries
│   ├── auth/           # SecureStore wrapper
│   └── telemetry/       # AnalyticsService, CrashReporter
└── navigation/          # Auth stack, tab navigator, nested catalog stack
```

**Server state and client state are different problems.** Product pages, search
results, and favourites data all originate from the server (or from SQLite acting as
a local mirror of it) and are cached, invalidated, and refetched — that's TanStack
Query's job. Whether the user is signed in, and what the session status is, is owned
by the app itself — that's Zustand's job. Putting server data in Zustand would mean
hand-writing cache invalidation; putting UI flags in Query would mean abusing a cache
as a store.

**Layers don't reach upward.** `src/lib/api` never imports from `src/features/auth`,
even though the API layer needs to know about the access token and needs to react
when a session dies. Both problems are solved with module-scope state and a
registered callback (`setSessionExpiredHandler`) rather than a direct dependency —
the lower layer exposes a slot, the higher layer fills it in once, at app start.

### Decisions worth arguing

**A single-flight refresh promise, not per-request refresh.** When two requests hit a
401 at the same time, both check a module-scope promise slot before starting their
own refresh. The first one in sets the promise; the second finds it already set and
awaits the same one. The alternative — each failed request independently calling
`/auth/refresh` — would mean two refresh calls racing, and DummyJSON (like most real
auth servers) rotating the refresh token on every exchange means the second refresh
could arrive with a token the server had already invalidated.

**Access token in a module-scope variable, not Zustand.** The single-flight refresh
promise above has to live in module scope regardless — a `Promise` was never going to
be React state. Putting the token in Zustand as well would still leave the
coordination logic split across two places. Keeping both in `src/lib/api/tokenStore`
also means that layer never has to import `src/features/auth`, and keeps the token
out of reach of any Zustand devtools middleware that might get added later.

**Read-through cache with a separate state, not a queryFn fallback.** The catalog
reads cached SQLite rows into their own `useState` on mount, independent of the
TanStack Query that hits the network. The screen shows whichever has data —
cache first if the network hasn't answered yet, network once it has. The
alternative (try the network first, fall back to cache only on failure) would make
network the primary source and contradict the actual goal: cached rows should render
immediately regardless of network speed, not just when the network fails outright.

**SQLite over AsyncStorage or Realm/WatermelonDB.** AsyncStorage has no query engine —
filtering or sorting means pulling an entire JSON blob into memory and doing it in
JS, which doesn't scale past a few hundred rows and can't express a real `WHERE` or
`ORDER BY`. Realm/WatermelonDB are reactive object databases built for offline-first
apps where local writes auto-propagate to UI — a real strength, but a native
dependency with its own learning curve that's more surface area than a two-day scope
with one cached table and one favourites table justifies. SQLite gives real,
hand-written SQL at a complexity cost that fits the scope, and TanStack Query already
owns re-fetching and UI updates, so reactivity at the DB layer isn't needed.

**Analytics/crash composition behind an explicit flag, not `__DEV__`.** `AnalyticsService`
and `CrashReporter` are interfaces with a console-logging implementation and a
Firebase implementation, selected in one place (`src/lib/telemetry/index.ts`) by a
`FIREBASE_ENABLED` constant — not by checking `__DEV__`. `__DEV__` answers "am I in
development mode", not "is Firebase actually wired and working", and the two can
diverge. Given the two-hour hard stop budgeted for Firebase setup, an explicit flag
makes the fallback a one-line change rather than something implied by build mode.

**Nested navigation: the Catalog tab owns its own stack.** Tapping a product pushes
Detail on top of the Catalog tab's own stack, rather than Detail living as a
top-level screen outside the tabs. The core loop is browse → detail → favourite →
check favourites; hiding the tab bar on Detail (the alternative) would force
back-navigation before the user could get to Favourites to see what they just did.

---

### Things that bit, and what was done about them

**RNTL 14's async pattern isn't limited to `render()`.** React Native Testing
Library 14, on React 19's concurrent renderer, makes several helpers asynchronous —
not just `render()`, but `renderHook()`, `rerender()`, and `act()` too. Missing an
`await` on any of them didn't throw a clear error; it produced act() warnings,
overlapping-act() errors, or assertions silently reading stale state. Combining fake
timers with RNTL compounds this: `jest.advanceTimersByTime()` has to run inside
`await act(() => {...})`, or the state update it triggers escapes React's batching.

**`expo-secure-store` and `expo-sqlite` are unreliable or absent under Jest.**
SecureStore's `jest-expo` auto-mock doesn't round-trip values correctly in a Node
test environment (a known issue, expo/expo#5007) — `getItemAsync` didn't return what
`setItemAsync` had just written. `expo-sqlite` pulls in `expo-asset`, which isn't
installed, and fails to resolve entirely. Both needed explicit `jest.mock()` calls in
`jest.setup.ts` with Map-backed fakes, exported so individual tests can control what
they return.

**MSW's ESM-only dependency chain needed a hand-widened `transformIgnorePatterns`.**
Jest doesn't transform `node_modules` by default; MSW and its whole dependency tree
(`@mswjs/interceptors`, `rettime`, `until-async`, and others) ship ESM-first. Adding
`msw` to the ignore-exception list moved the error one level deeper each time,
eventually resolved by reading `msw/package.json`'s dependency list and adding all of
them at once rather than chasing the chain one error at a time. Separately, `.mjs`
files don't match jest-expo's own transform pattern (`\.[jt]sx?$`), so `rettime`'s
ESM-only build needed its own transform entry.

**DummyJSON doesn't guarantee every product has a `brand`.** The type declared
`brand: string` (required); some products omit it, which surfaced as a silent-looking
failure — the catalog kept showing rows (from cache), while the network write
actually failed with `NOT NULL constraint failed: products.brand`. Fixed by making
the field optional in the type and the schema, and writing `NULL` (not an empty
string) when it's genuinely absent.

**`crashlytics().crash()` doesn't reliably crash a development build.** A known,
long-standing issue across RNFB versions. Switched to throwing an uncaught `Error`
instead, reasoning that React Native's own global error handler (which Crashlytics
hooks into) would report more consistently — but in a development build, LogBox
intercepts the error and shows the red screen instead of a real crash. Verifying a
genuine fatal crash report would need a release build, where LogBox isn't present;
Firebase Analytics events were confirmed reaching the console (DebugView), which is
the stronger evidence the Firebase integration itself is sound.

---

## Performance

Measured with React Native's built-in Perf Monitor while scrolling the full
194-product catalog (DummyJSON's total — short of the "few hundred rows" target, a
limit of the data source, not a scope cut). Steady 60fps (JS + UI thread) under
normal scrolling. FPS drops to roughly 18fps specifically when a new page is fetched
mid-scroll.

The optimizations described in the architecture section — `getItemLayout` with a
fixed row height, a memoised `ProductRow` with a field-level comparator, `useCallback`
on the list's render/layout functions, and `expo-image` with `recyclingKey` — were
written into the list from the start rather than added after a baseline measurement,
so there's no true before/after number for those. The pagination-fetch FPS drop was
observed but not root-caused within scope; the two candidates are the sequential
SQLite writes in the cache-writing path (20 rows awaited one at a time per page) and/or
`FlatList`'s default render batching absorbing 20 new rows in one pass.

## Testing

Not coverage theatre — five areas chosen because they're the ways this app would
actually break:

1. **Token refresh** — a successful refresh replays the original request with the new
   token; a failed refresh clears the session and notifies; two concurrent 401s
   share exactly one refresh call; a non-401 error skips the refresh path entirely.
2. **Read-through cache** — cached rows render before the network resolves, and stay
   on screen (with an offline banner) if the fetch fails.
3. **Search debounce and cancellation** — no request fires until 300ms after typing
   stops; each debounced value fires exactly once, proving TanStack Query's own
   `AbortSignal` handling prevents duplicate/overlapping requests.
4. **Favourites persistence** — a favourite toggled in one hook instance is visible
   from a freshly mounted one, simulating an app relaunch against the same
   (mocked) SQLite table.
5. **A render smoke test** on app start (auth restore, schema init, navigation tree).

MSW handles all API mocking; SQLite and SecureStore are mocked at the Jest level
(see Things that bit, above).

---

## Known limitations

- **Back navigation from Favourites → Detail returns to the Catalog tab, not
  Favourites.** Cross-tab navigation into a nested stack (`navigation.navigate('Catalog',
  { screen: 'Detail', ... })`) writes a fresh history entry rather than recording
  where the user came from — a documented React Navigation behaviour, not a bug.
  A real fix means passing an origin param through Detail or restructuring the
  navigators.
- **No SQLite migration system.** `CREATE TABLE IF NOT EXISTS` means a schema change
  doesn't reach an already-created table; during development this was handled by
  clearing app data. Acceptable with no released version and no user data to
  preserve — would need addressing before a second release.
- **Cache read-through is capped at one page (20 rows).** Only the most recent page
  fetched is available offline; scrolling further before going offline won't have
  those rows cached for the next cold start.
- **iOS not verified.** Built and tested on Android only; the codebase has no
  Android-specific assumptions beyond the native config, but the iOS build hasn't
  been run on a device or simulator.
- **Pagination FPS drop not root-caused.** See Performance, above.
- **Crash test button's actual fatal-crash behaviour unverified in release build.**
  The button is correctly hidden in release builds (`__DEV__`-gated, as intended),
  which also means it's never been exercised in the one environment where
  `crashlytics().crash()` would behave predictably.

## Not included

Dark mode. i18n. A cart or checkout. Push notifications. Deep linking. CI/CD
pipelines. An App Store or Play Store submission. Animations beyond navigation
defaults. A design system. Any second data source. Pull-to-refresh (cut per the
original two-day plan — the underlying read-through behaviour exists, just not the
gesture).