import type { CrashReporter } from 'src/lib/telemetry/types';

export class ConsoleCrashReporter implements CrashReporter {
  recordError(error: Error): void {
    console.log('[crash] recordError:', error.message);
  }

  crash(): void {
    throw new Error('[crash] Deliberate test crash');
  }
}