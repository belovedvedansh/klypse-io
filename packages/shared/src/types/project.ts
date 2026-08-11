// ============================================
// Project & Source Types
// ============================================

export type SourceType = 'upload' | 'youtube' | 'twitch' | 'kick';

export type ProjectStatus =
  | 'created'
  | 'uploading'
  | 'ingesting'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying';

export type JobType =
  | 'ingest'
  | 'normalize'
  | 'transcribe'
  | 'analyze'
  | 'score'
  | 'reframe'
  | 'caption'
  | 'render_preview'
  | 'export'
  | 'cleanup';

export interface Project {
  id: string;
  userId: string;
  title: string;
  status: ProjectStatus;
  sourceType: SourceType;
  sourceUrl: string | null;
  sourceFileName: string | null;
  sourceDurationSeconds: number | null;
  sourceMetadata: SourceMetadata | null;
  clipCount: number;
  exportCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface SourceMetadata {
  title: string | null;
  channel: string | null;
  game: string | null;
  category: string | null;
  language: string | null;
  resolution: string | null;
  fps: number | null;
  codec: string | null;
  fileSize: number | null;
  thumbnailUrl: string | null;
}

export interface ProcessingJob {
  id: string;
  projectId: string;
  userId: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0-100
  error: string | null;
  retryCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  projectId: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker: string | null;
  confidence: number;
  language: string;
  words: TranscriptWord[];
}

export interface TranscriptWord {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
}
