// ============================================
// Drizzle Schema — Barrel Export
// ============================================

export * from './users.js';
export * from './projects.js';
export * from './clips.js';
export * from './exports.js';
import { db } from '../../db/index.js';
// Replace line 18 with explicit schema table imports:
import { jobs, projects } from '../../db/schema/index.js';