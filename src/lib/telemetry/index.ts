import { ConsoleAnalytics } from 'src/lib/telemetry/consoleAnalytics';
import { ConsoleCrashReporter } from 'src/lib/telemetry/consoleCrashReporter';
import type { AnalyticsService, CrashReporter } from 'src/lib/telemetry/types';

// Flipped by hand once the Firebase implementation is wired and verified in
// the Firebase console — not tied to __DEV__ (see DECISIONS.md). Until then,
// every event still gets logged, just to the console instead of Firebase.
const FIREBASE_ENABLED = false;

function createAnalytics(): AnalyticsService {
  if (FIREBASE_ENABLED) {
    // Swapped in once the Firebase implementation exists.
    return new ConsoleAnalytics();
  }
  return new ConsoleAnalytics();
}

function createCrashReporter(): CrashReporter {
  if (FIREBASE_ENABLED) {
    return new ConsoleCrashReporter();
  }
  return new ConsoleCrashReporter();
}

export const analytics: AnalyticsService = createAnalytics();
export const crashReporter: CrashReporter = createCrashReporter();