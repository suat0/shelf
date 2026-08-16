import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import type { AnalyticsService, AnalyticsEventParams } from 'src/lib/telemetry/types';

export class FirebaseAnalytics implements AnalyticsService {
  logEvent(name: string, params?: AnalyticsEventParams): void {
    logEvent(getAnalytics(), name, params);
  }
}