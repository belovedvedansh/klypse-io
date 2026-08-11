import type { QuotaConfig } from '@klypse/shared';
import { DEFAULT_QUOTAS } from '@klypse/shared';

/**
 * Resolves the active quota configuration.
 * In production this merges defaults with admin overrides from the database.
 * For now returns defaults with env-var overrides.
 */
export function getQuotaConfig(overrides?: Partial<QuotaConfig>): QuotaConfig {
  const envOverrides: Partial<QuotaConfig> = {};

  if (process.env.DEFAULT_DAILY_EXPORT_LIMIT) {
    envOverrides.dailyExportLimit = parseInt(process.env.DEFAULT_DAILY_EXPORT_LIMIT, 10);
  }
  if (process.env.DEFAULT_DAILY_PROCESSING_MINUTES) {
    envOverrides.dailyProcessingMinutes = parseInt(
      process.env.DEFAULT_DAILY_PROCESSING_MINUTES,
      10,
    );
  }
  if (process.env.DEFAULT_MAX_SOURCE_DURATION_MINUTES) {
    envOverrides.maxSourceDurationMinutes = parseInt(
      process.env.DEFAULT_MAX_SOURCE_DURATION_MINUTES,
      10,
    );
  }
  if (process.env.DEFAULT_MAX_ACTIVE_JOBS) {
    envOverrides.maxActiveJobs = parseInt(process.env.DEFAULT_MAX_ACTIVE_JOBS, 10);
  }

  return {
    ...DEFAULT_QUOTAS,
    ...envOverrides,
    ...overrides,
  };
}
