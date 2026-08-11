import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  real,
  pgEnum,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { projects } from './projects.js';

// ---- Enums ----
export const clipStatusEnum = pgEnum('clip_status', [
  'candidate',
  'approved',
  'rejected',
  'exported',
  'expired',
]);
export const aspectRatioEnum = pgEnum('aspect_ratio', ['9:16', '1:1', '16:9']);
export const reframeMethodEnum = pgEnum('reframe_method', [
  'face_tracking',
  'saliency',
  'speaker',
  'static',
  'manual',
]);

// ---- Clip Candidates ----
export const clipCandidates = pgTable(
  'clip_candidates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: clipStatusEnum('status').notNull().default('candidate'),
    title: varchar('title', { length: 500 }).notNull(),
    hookText: text('hook_text'),
    startTime: real('start_time').notNull(),
    endTime: real('end_time').notNull(),
    durationSeconds: real('duration_seconds').notNull(),
    scores: jsonb('scores').notNull().$type<Record<string, number>>(),
    thumbnailUrl: text('thumbnail_url'),
    previewUrl: text('preview_url'),
    rank: integer('rank').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index('clips_project_id_idx').on(table.projectId),
    userIdx: index('clips_user_id_idx').on(table.userId),
    statusIdx: index('clips_status_idx').on(table.status),
    rankIdx: index('clips_rank_idx').on(table.projectId, table.rank),
  }),
);

// ---- Reframing Tracks ----
export const reframingTracks = pgTable('reframing_tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  clipId: uuid('clip_id')
    .notNull()
    .references(() => clipCandidates.id, { onDelete: 'cascade' }),
  aspectRatio: aspectRatioEnum('aspect_ratio').notNull().default('9:16'),
  keyframes: jsonb('keyframes').notNull().default([]),
  confidence: real('confidence').notNull().default(0),
  method: reframeMethodEnum('method').notNull().default('static'),
  fallbackUsed: boolean('fallback_used').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Caption Tracks ----
export const captionTracks = pgTable('caption_tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  clipId: uuid('clip_id')
    .notNull()
    .references(() => clipCandidates.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  style: jsonb('style').notNull(),
  segments: jsonb('segments').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Relations ----
export const clipCandidatesRelations = relations(clipCandidates, ({ one, many }) => ({
  project: one(projects, {
    fields: [clipCandidates.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [clipCandidates.userId],
    references: [users.id],
  }),
  reframingTracks: many(reframingTracks),
  captionTracks: many(captionTracks),
}));

export const reframingTracksRelations = relations(reframingTracks, ({ one }) => ({
  clip: one(clipCandidates, {
    fields: [reframingTracks.clipId],
    references: [clipCandidates.id],
  }),
}));

export const captionTracksRelations = relations(captionTracks, ({ one }) => ({
  clip: one(clipCandidates, {
    fields: [captionTracks.clipId],
    references: [clipCandidates.id],
  }),
}));
