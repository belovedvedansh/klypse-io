import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  jsonb,
  index,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';

// ---- Enums ----
export const sourceTypeEnum = pgEnum('source_type', ['upload', 'youtube', 'twitch', 'kick']);
export const projectStatusEnum = pgEnum('project_status', [
  'created',
  'uploading',
  'ingesting',
  'processing',
  'completed',
  'failed',
  'expired',
]);
export const jobStatusEnum = pgEnum('job_status', [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
  'retrying',
]);
export const jobTypeEnum = pgEnum('job_type', [
  'ingest',
  'normalize',
  'transcribe',
  'analyze',
  'score',
  'reframe',
  'caption',
  'render_preview',
  'export',
  'cleanup',
]);

// ---- Projects ----
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    status: projectStatusEnum('status').notNull().default('created'),
    sourceType: sourceTypeEnum('source_type').notNull(),
    sourceUrl: text('source_url'),
    sourceFileName: varchar('source_file_name', { length: 500 }),
    sourceDurationSeconds: integer('source_duration_seconds'),
    sourceMetadata: jsonb('source_metadata'),
    clipCount: integer('clip_count').default(0),
    exportCount: integer('export_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => ({
    userIdx: index('projects_user_id_idx').on(table.userId),
    statusIdx: index('projects_status_idx').on(table.status),
    expiresIdx: index('projects_expires_at_idx').on(table.expiresAt),
  }),
);

// ---- Processing Jobs ----
export const processingJobs = pgTable(
  'processing_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: jobTypeEnum('type').notNull(),
    status: jobStatusEnum('status').notNull().default('queued'),
    progress: integer('progress').default(0),
    error: text('error'),
    retryCount: integer('retry_count').default(0),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index('jobs_project_id_idx').on(table.projectId),
    userIdx: index('jobs_user_id_idx').on(table.userId),
    statusIdx: index('jobs_status_idx').on(table.status),
    typeStatusIdx: index('jobs_type_status_idx').on(table.type, table.status),
  }),
);

// ---- Transcripts ----
export const transcripts = pgTable('transcripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  fullText: text('full_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Transcript Segments ----
export const transcriptSegments = pgTable(
  'transcript_segments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    transcriptId: uuid('transcript_id')
      .notNull()
      .references(() => transcripts.id, { onDelete: 'cascade' }),
    startTime: real('start_time').notNull(),
    endTime: real('end_time').notNull(),
    text: text('text').notNull(),
    speaker: varchar('speaker', { length: 100 }),
    confidence: real('confidence').notNull().default(0),
    language: varchar('language', { length: 10 }).notNull().default('en'),
    words: jsonb('words').default([]),
  },
  (table) => ({
    projectIdx: index('segments_project_id_idx').on(table.projectId),
    timeIdx: index('segments_time_idx').on(table.startTime, table.endTime),
  }),
);

// ---- Relations ----
export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  jobs: many(processingJobs),
  transcript: one(transcripts, {
    fields: [projects.id],
    references: [transcripts.projectId],
  }),
}));

export const processingJobsRelations = relations(processingJobs, ({ one }) => ({
  project: one(projects, {
    fields: [processingJobs.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [processingJobs.userId],
    references: [users.id],
  }),
}));

export const transcriptsRelations = relations(transcripts, ({ one, many }) => ({
  project: one(projects, {
    fields: [transcripts.projectId],
    references: [projects.id],
  }),
  segments: many(transcriptSegments),
}));

export const transcriptSegmentsRelations = relations(transcriptSegments, ({ one }) => ({
  transcript: one(transcripts, {
    fields: [transcriptSegments.transcriptId],
    references: [transcripts.id],
  }),
}));
