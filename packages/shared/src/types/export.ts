// ============================================
// Export Types
// ============================================

export type ExportStatus = 'queued' | 'rendering' | 'completed' | 'failed' | 'expired';

export type ExportPlatform = 'tiktok' | 'reels' | 'shorts' | 'twitter' | 'general';

export interface Export {
  id: string;
  clipId: string;
  projectId: string;
  userId: string;
  status: ExportStatus;
  platform: ExportPlatform;
  aspectRatio: string;
  resolution: string;
  fps: number;
  fileSize: number | null;
  fileUrl: string | null;
  watermarked: boolean;
  metadata: ExportMetadata;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

export interface ExportMetadata {
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  suggestedTags: string[];
  suggestedHashtags: string[];
  filename: string;
}

export interface PlatformPreset {
  platform: ExportPlatform;
  aspectRatio: string;
  maxResolution: string;
  maxFps: number;
  maxDurationSeconds: number;
  maxFileSizeMb: number;
  codec: string;
}
