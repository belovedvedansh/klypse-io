// ============================================
// Quota Types
// ============================================

export interface QuotaConfig {
  dailyExportLimit: number;
  dailyProcessingMinutes: number;
  maxSourceDurationMinutes: number;
  maxActiveJobs: number;
  maxStorageMb: number;
  cooldownMinutes: number;
}

export interface UsageLedgerEntry {
  id: string;
  userId: string;
  action: UsageAction;
  amount: number;
  unit: string;
  jobId: string | null;
  projectId: string | null;
  createdAt: string;
}

export type UsageAction =
  | 'export'
  | 'processing_minutes'
  | 'upload_bytes'
  | 'transcode_minutes'
  | 'transcribe_minutes'
  | 'analyze_minutes';

export interface UsageSummary {
  userId: string;
  date: string;
  exportsUsed: number;
  exportsLimit: number;
  processingMinutesUsed: number;
  processingMinutesLimit: number;
  activeJobs: number;
  activeJobsLimit: number;
  storageUsedMb: number;
  storageMaxMb: number;
}

export interface RetentionPolicy {
  rawUploadDays: number;
  normalizedAssetDays: number;
  transcriptDays: number;
  previewDays: number;
  exportDays: number;
  failedJobCleanupHours: number;
  orphanCleanupHours: number;
}
