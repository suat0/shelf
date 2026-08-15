# Shelf — Specification

A React Native product catalog client. Built as a portfolio artifact to demonstrate
mobile engineering against a specific job description (see `JD-MAPPING.md`).

**Hard constraint: two days.** Every decision below is made in service of shipping a
polished, defensible slice in a weekend. Scope creep is the main failure mode.

---

## 1. What it is

A catalog browser backed by a public REST API. The user logs in, browses a paginated
product list, searches it, opens a detail view, and marks favourites. The list works
offline from a local cache.

This is deliberately a modest product. The interesting part is not the feature list —
it is the auth flow, the cache, the list performance and the way the layers are
separated. The README must make that explicit, the same way the Unity case study
READMEs do.

### Screens

| Screen | Contents |
| --- | --- |
| Login | Username + password, inline validation, error state from the API |
| Catalog | Paginated, searchable product list; pull-to-refresh; offline banner |
| Detail | Single product; favourite toggle; images |
| Favourites | Locally stored list; works with no network |

Four screens. Not five. A settings screen, a cart, a theme switcher and an onboarding
flow are all out of scope.

---

## 2. Backend

**DummyJSON** (`https://dummyjson.com`). No signup, no key, no server to write.

Chosen because it provides the API patterns the job description asks about:

- `POST /auth/login` returns an access token and a refresh token
- `POST /auth/refresh` exchanges the refresh token
- `GET /auth/me` requires a bearer token — a real 401 to handle
- `GET /products?limit=&skip=` real pagination
- `GET /products/search?q=` server-side search
- `GET /products/:id` detail

Test credentials are published in the DummyJSON docs — read them from there rather
than hardcoding a guess. Show them on the login screen as prefilled defaults so a
reviewer can get in with one tap; that is a deliberate demo affordance and should be
noted as such in the README.

**Do not write a backend.** Not a proxy, not a mock server, not a Node layer "just for
auth". The whole point of the two-day budget is that all of it goes into the client.

---

## 3. Stack

| Concern | Choice | Why (must be defensible out loud) |
| --- | --- | --- |
| Runtime | Expo SDK (latest stable) + `expo prebuild` | Fast setup, but real `android/` and `ios/` folders exist so native config is inspectable and Firebase's config plugins work |
| Language | TypeScript, `strict: true` | Non-negotiable; the JD names TypeScript explicitly |
| Navigation | React Navigation (native stack + tabs) | Stack for auth→app, tabs for Catalog/Favourites |
| Server state | TanStack Query | Caching, pagination, retry and background refetch are the problem it exists for |
| Client state | Zustand | Only for session and UI flags — small, and not worth a reducer framework |
| HTTP | `fetch` wrapped in a typed client | An axios dependency buys little here; the interceptor logic is ~40 lines and is the part worth showing |
| Secure storage | `expo-secure-store` | Refresh token belongs in the keystore, not AsyncStorage |
| Local DB | `expo-sqlite` | The JD asks for SQL specifically. Real tables, real queries |
| Images | `expo-image` | Disk caching and `recyclingKey` matter on a long list |
| Analytics / crash | `@react-native-firebase/analytics` + `/crashlytics` | Named in the JD |
| Tests | Jest + React Native Testing Library + MSW | MSW so the API layer is tested against real request/response shapes |

### The state split, stated plainly

Server state and client state are different problems. Product pages, search results and
the profile are owned by the server and are cached, invalidated and refetched —
TanStack Query. Whether the user is signed in, and which tab is active, are owned by
the app — Zustand. Putting server data in Zustand means hand-writing cache invalidation;
putting UI flags in Query means abusing a cache as a store.

Be ready to say this in one breath in an interview.

---

## 4. The parts that carry the project

Everything above is setup. These four are what a reviewer is actually looking at.

### 4.1 Auth and token refresh

- Login stores the access token in memory and the refresh token in SecureStore.
- A single `apiFetch` wrapper attaches the bearer token.
- On a `401`, it calls refresh **once**, then replays the original request.
- Concurrent 401s share one refresh call — a promise held in module scope, not three
  parallel refreshes racing each other. This is the single most interview-relevant
  piece of code in the project; write it carefully and test it.
- A failed refresh clears the session and returns the user to Login.
- Cold start: if a refresh token exists, exchange it before showing the app. A splash
  or skeleton covers that window.

### 4.2 Offline-capable catalog

- SQLite table `products(id INTEGER PRIMARY KEY, title, brand, category, price REAL,
  thumbnail, payload TEXT, cached_at INTEGER)`.
- Read-through: on load, render from SQLite immediately, then fetch and reconcile.
- On network failure, the cached rows stay on screen and an offline banner appears.
  Failing to an empty screen when there is usable data on disk is the thing to avoid.
- Favourites are a separate table and are the source of truth locally — a favourite
  survives a cache wipe.
- Write the SQL by hand. An ORM hides exactly the skill the JD is asking about.

### 4.3 List performance

- `FlatList` with a fixed row height and `getItemLayout`, a stable `keyExtractor`, and
  `React.memo` on the row with a comparison that only looks at the fields the row draws.
- `expo-image` with `recyclingKey` set to the product id.
- Search input debounced (300ms), and the in-flight request cancelled when the query
  changes — an `AbortController`, not a `setTimeout` and hope.
- Measure before and after with the built-in profiler on a list of a few hundred rows,
  and put the numbers in the README. A claim about performance without a measurement is
  the kind of thing that gets picked apart in an interview.

### 4.4 Analytics and crash reporting behind an interface

Define `AnalyticsService` and `CrashReporter` as interfaces with a console-logging
implementation and a Firebase implementation, selected at composition time.

This matters for two reasons. It is better design — nothing in the feature code imports
Firebase. And it de-risks the schedule: if Firebase's native setup runs long, the
console implementation ships and the architecture point survives intact. See the
timebox in `TASKS.md`.

Events worth sending: `login_succeeded`, `login_failed`, `product_opened`,
`search_performed` (with result count, not the query text), `favourite_toggled`,
`offline_render`. A deliberate `crash_test` button behind a dev flag proves Crashlytics
is wired.

---

## 5. Testing

Not coverage theatre. Test the things that would actually break:

1. Token refresh — success, failure, and two concurrent 401s sharing one refresh.
2. Cache read-through — cached rows render before the network resolves; a failed fetch
   leaves them in place.
3. Search debounce and cancellation — rapid typing issues one request, earlier ones abort.
4. Favourites persistence across a simulated restart.
5. One render test per screen: loading, loaded, error, empty.

MSW handles the API. Tests must run with `npm test` and pass in CI.

---

## 6. Repository requirements

The repo is the deliverable, not the app. Match the standard already set by the Unity
case studies:

- `README.md` following `README-TEMPLATE.md` — download link and GIF at the top,
  reasoning below.
- A **Decisions worth arguing** section. Every entry states the alternative that was
  rejected and why. This is the section reviewers read.
- A **Things that bit** section, written as they happen. Do not reconstruct it at the
  end from memory — keep notes while building.
- `DECISIONS.md` — a running log, one line per decision, dated (see `CLAUDE.md`).
- A GitHub Release with the APK attached and install notes, as in `search-it-vertical-slice`.
- A 20-second GIF in `docs/`.
- `.gitignore` correct from the first commit. No stray crash dumps, no `node_modules`.

## 7. Explicitly out of scope

Dark mode. i18n. A cart or checkout. Push notifications. Deep linking. CI/CD pipelines.
An App Store or Play Store submission. Animations beyond navigation defaults. A design
system. Any second data source.

If a task is not in `TASKS.md`, it is not in this project.
