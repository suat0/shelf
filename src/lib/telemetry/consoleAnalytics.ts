import type { AnalyticsService, AnalyticsEventParams } from 'src/lib/telemetry/types';

export class ConsoleAnalytics implements AnalyticsService {
  logEvent(name: string, params?: AnalyticsEventParams): void {
    console.log('[analytics]', name, params ?? {});
  }
}