import { ConsoleAnalytics } from 'src/lib/telemetry/consoleAnalytics';
import { ConsoleCrashReporter } from 'src/lib/telemetry/consoleCrashReporter';
import { FirebaseAnalytics } from 'src/lib/telemetry/firebaseAnalytics';
import { FirebaseCrashReporter } from 'src/lib/telemetry/firebaseCrashReporter';
import type { AnalyticsService, CrashReporter } from 'src/lib/telemetry/types';

const FIREBASE_ENABLED = true;

function createAnalytics(): AnalyticsService {
  return FIREBASE_ENABLED ? new FirebaseAnalytics() : new ConsoleAnalytics();
}

function createCrashReporter(): CrashReporter {
  return FIREBASE_ENABLED ? new FirebaseCrashReporter() : new ConsoleCrashReporter();
}

export const analytics: AnalyticsService = createAnalytics();
export const crashReporter: CrashReporter = createCrashReporter();