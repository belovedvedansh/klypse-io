import type { RetentionPolicy } from '../types/quota';

/**
 * Default retention policy for free-tier users.
 * Aggressive on raw uploads, generous on exports.
 * All values admin-overridable.
 */
export const DEFAULT_RETENTION: RetentionPolicy = {
  rawUploadDays: 3,
  normalizedAssetDays: 5,
  transcriptDays: 30,
  previewDays: 7,
  exportDays: 14,
  failedJobCleanupHours: 6,
  orphanCleanupHours: 24,
};

/** Grace period before hard deletion (hours) */
export const DELETION_GRACE_HOURS = 24;

/** How often the retention cleanup job runs (cron expression) */
export const RETENTION_CLEANUP_CRON = '0 */4 * * *'; // every 4 hours
