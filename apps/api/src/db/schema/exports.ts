import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { projects } from './projects.js';
import { clipCandidates } from './clips.js';

// ---- Enums ----
export const exportStatusEnum = pgEnum('export_status', [
  'queued',
  'rendering',
  'completed',
  'failed',
  'expired',
]);
export const exportPlatformEnum = pgEnum('export_platform', [
  'tiktok',
  'reels',
  'shorts',
  'twitter',
  'general',
]);

// ---- Exports ----
export const exports = pgTable(
  'exports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clipId: uuid('clip_id')
      .notNull()
      .references(() => clipCandidates.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: exportStatusEnum('status').notNull().default('queued'),
    platform: exportPlatformEnum('platform').notNull().default('general'),
    aspectRatio: varchar('aspect_ratio', { length: 10 }).notNull().default('9:16'),
    resolution: varchar('resolution', { length: 20 }).notNull().default('1080x1920'),
    fps: integer('fps').notNull().default(30),
    fileSize: integer('file_size'),
    fileUrl: text('file_url'),
    watermarked: boolean('watermarked').default(true),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => ({
    userIdx: index('exports_user_id_idx').on(table.userId),
    clipIdx: index('exports_clip_id_idx').on(table.clipId),
    statusIdx: index('exports_status_idx').on(table.status),
    expiresIdx: index('exports_expires_at_idx').on(table.expiresAt),
  }),
);

// ---- Relations ----
export const exportsRelations = relations(exports, ({ one }) => ({
  clip: one(clipCandidates, {
    fields: [exports.clipId],
    references: [clipCandidates.id],
  }),
  project: one(projects, {
    fields: [exports.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [exports.userId],
    references: [users.id],
  }),
}));
