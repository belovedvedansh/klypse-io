import type { RetentionPolicy } from '@klypse/shared';
import { DEFAULT_RETENTION } from '@klypse/shared';

/**
 * Resolves the active retention configuration.
 * Merges defaults with env-var and admin overrides.
 */
export function getRetentionConfig(overrides?: Partial<RetentionPolicy>): RetentionPolicy {
  const envOverrides: Partial<RetentionPolicy> = {};

  if (process.env.DEFAULT_RETENTION_DAYS_RAW) {
    envOverrides.rawUploadDays = parseInt(process.env.DEFAULT_RETENTION_DAYS_RAW, 10);
  }
  if (process.env.DEFAULT_RETENTION_DAYS_EXPORT) {
    envOverrides.exportDays = parseInt(process.env.DEFAULT_RETENTION_DAYS_EXPORT, 10);
  }

  return {
    ...DEFAULT_RETENTION,
    ...envOverrides,
    ...overrides,
  };
}
