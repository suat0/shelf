export type AnalyticsEventParams = Record<string, string | number | boolean>;

export interface AnalyticsService {
  logEvent(name: string, params?: AnalyticsEventParams): void;
}

export interface CrashReporter {
  recordError(error: Error): void;
  // Deliberately crashes the app. Only ever wired to a dev-only button
  // (see SPEC.md 4.4) to verify Crashlytics is actually receiving reports.
  crash(): void;
}