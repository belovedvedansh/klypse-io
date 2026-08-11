/**
 * Default feature flag definitions.
 * These are the initial values; runtime values come from the database
 * and are admin-overridable.
 */
export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  watermark_enabled: true,
  meme_overlay: false,
  sfx_suggestions: false,
  music_suggestions: false,
  advanced_reframe: true,
  multi_language: true,
  auto_publish: false,
  brand_kit: false,
  filler_word_cleanup: true,
  silence_cleanup: true,
  hook_text_suggestions: true,
  emergency_mode: false, // kills all processing when true
};

/** Feature flags that require admin confirmation to toggle */
export const DANGEROUS_FLAGS = [
  'emergency_mode',
] as const;

/** Feature flags that affect cost (shown with cost warning in admin) */
export const COST_SENSITIVE_FLAGS = [
  'advanced_reframe',
  'multi_language',
  'meme_overlay',
  'sfx_suggestions',
  'music_suggestions',
] as const;
