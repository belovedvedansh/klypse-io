// ============================================
// Clip Types
// ============================================

export type ClipStatus = 'candidate' | 'approved' | 'rejected' | 'exported' | 'expired';

export type AspectRatio = '9:16' | '1:1' | '16:9';

export interface ClipCandidate {
  id: string;
  projectId: string;
  userId: string;
  status: ClipStatus;
  title: string;
  hookText: string | null;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  scores: ClipScores;
  reframingTrack: ReframingTrack | null;
  captionTrack: CaptionTrack | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClipScores {
  overall: number; // 0-100
  virality: number;
  coherence: number;
  hookStrength: number;
  contextCompleteness: number;
  excitement: number;
  memeSuitability: number;
  platformFit: Record<string, number>; // e.g. { tiktok: 85, reels: 78, shorts: 82 }
  reframeConfidence: number;
  subtitleReadability: number;
  exportConfidence: number;
}

export interface ReframingTrack {
  id: string;
  clipId: string;
  aspectRatio: AspectRatio;
  keyframes: ReframingKeyframe[];
  confidence: number;
  method: 'face_tracking' | 'saliency' | 'speaker' | 'static' | 'manual';
  fallbackUsed: boolean;
}

export interface ReframingKeyframe {
  time: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface CaptionTrack {
  id: string;
  clipId: string;
  language: string;
  style: CaptionStyle;
  segments: CaptionSegment[];
}

export interface CaptionStyle {
  preset: string; // e.g. 'bold-center', 'minimal', 'karaoke', 'highlight'
  fontSize: number;
  fontFamily: string;
  primaryColor: string;
  highlightColor: string;
  backgroundColor: string;
  position: 'bottom' | 'center' | 'top';
  animation: 'none' | 'word-by-word' | 'line-by-line' | 'karaoke';
}

export interface CaptionSegment {
  startTime: number;
  endTime: number;
  text: string;
  words: CaptionWord[];
}

export interface CaptionWord {
  word: string;
  startTime: number;
  endTime: number;
  isEmphasis: boolean;
}
