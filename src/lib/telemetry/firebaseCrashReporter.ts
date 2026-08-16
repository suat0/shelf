import { getCrashlytics, recordError, crash } from '@react-native-firebase/crashlytics';
import type { CrashReporter } from 'src/lib/telemetry/types';

export class FirebaseCrashReporter implements CrashReporter {
  recordError(error: Error): void {
    recordError(getCrashlytics(), error);
  }

  crash(): void {
    crash(getCrashlytics());
  }
}