// Lives at module scope, not in Zustand, deliberately: apiFetch (this layer)
// must not depend on src/features/auth (a higher layer), and the single-flight
// refresh promise below has to be a plain module-scope value regardless —
// React state was never going to hold a Promise. See DECISIONS.md.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
    return accessToken;
}

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

// Holds the in-flight refresh call, if one is happening. When two requests
// get a 401 at the same time, both check this before starting their own
// refresh — whichever one is set second reuses the first's promise instead
// of firing a second refresh request. Cleared once the refresh settles
// (success or failure) so the next 401 starts a fresh one.
let refreshPromise: Promise<string> | null = null;

export function getRefreshPromise(): Promise<string> | null {
    return refreshPromise;
}

export function setRefreshPromise(promise: Promise<string> | null): void {
    refreshPromise = promise;
}

// A callback the app registers once (in App.tsx) to react when the session
// dies for good — refresh failed, nothing left to retry. Kept as a plain
// slot for the same reason accessToken and refreshPromise are: this layer
// must not import src/features/auth to call signOut() directly. Whatever
// registers the handler decides what "session expired" means to the UI.
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export function notifySessionExpired(): void {
  onSessionExpired?.();
}