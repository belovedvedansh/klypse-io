import type { QuotaConfig } from '../types/quota';

/**
 * Default quota configuration for free-tier users.
 * All values are admin-overridable via system config.
 */
export const DEFAULT_QUOTAS: QuotaConfig = {
  dailyExportLimit: 5,
  dailyProcessingMinutes: 30,
  maxSourceDurationMinutes: 120,
  maxActiveJobs: 2,
  maxStorageMb: 2048, // 2 GB
  cooldownMinutes: 5,
};

/** Maximum file upload size in bytes (2 GB) */
export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

/** Supported upload MIME types */
export const SUPPORTED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/x-flv',
] as const;

/** Maximum number of clip candidates generated per project */
export const MAX_CLIP_CANDIDATES = 20;

/** Minimum clip duration in seconds */
export const MIN_CLIP_DURATION_SECONDS = 10;

/** Maximum clip duration in seconds */
export const MAX_CLIP_DURATION_SECONDS = 90;

/** Score threshold below which clips are auto-rejected */
export const MIN_CLIP_SCORE_THRESHOLD = 35;
