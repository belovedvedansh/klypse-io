// ============================================
// Shared Utility Functions
// ============================================

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Generate a URL-safe slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a project-safe filename from clip title and platform
 */
export function generateExportFilename(
  projectTitle: string,
  clipIndex: number,
  platform: string,
): string {
  const slug = slugify(projectTitle).slice(0, 40);
  const ts = Date.now();
  return `${slug}_clip${clipIndex + 1}_${platform}_${ts}.mp4`;
}

/**
 * Check if a URL is a valid YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url);
}

/**
 * Check if a URL is a valid Twitch VOD URL
 */
export function isTwitchVodUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?twitch\.tv\/videos\/\d+/.test(url);
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}
