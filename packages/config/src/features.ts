import { DEFAULT_FEATURE_FLAGS } from '@klypse/shared';

/**
 * Resolves all feature flags.
 * In production, runtime values from the DB override these defaults.
 */
export function getFeatureFlags(
  dbOverrides?: Record<string, boolean>,
): Record<string, boolean> {
  const envOverrides: Record<string, boolean> = {};

  for (const [key] of Object.entries(DEFAULT_FEATURE_FLAGS)) {
    const envKey = `FF_${key.toUpperCase()}`;
    const envVal = process.env[envKey];
    if (envVal !== undefined) {
      envOverrides[key] = envVal === 'true';
    }
  }

  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...envOverrides,
    ...dbOverrides,
  };
}

/**
 * Check if a single feature is enabled.
 */
export function isFeatureEnabled(
  key: string,
  dbOverrides?: Record<string, boolean>,
): boolean {
  const flags = getFeatureFlags(dbOverrides);
  return flags[key] ?? false;
}
