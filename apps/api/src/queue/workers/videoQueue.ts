/**
 * videoQueue.ts
 * ─────────────────────────────────────────────────────────
 * BullMQ Queue + Worker for Klypse video-processing jobs.
 *
 * Enqueue a job:
 *   import { enqueueVideoJob } from './queues/videoQueue.js';
 *   await enqueueVideoJob({ type: 'ingest', projectId, userId });
 *
 * The worker is started automatically when this module is
 * imported in a process that sets ENABLE_WORKER=true, or
 * from a dedicated worker entry point (recommended for prod).
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { jobs } from '../../db/schema/index.js';
import { logger } from '../../utils/logger.js';

// ─── Types ───────────────────────────────────────────────

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

export interface VideoJobData {
  type: JobType;
  projectId: string;
  userId: string;
  /** Set for jobs that already have a processingJobs row. */
  jobId?: string;
  /** For export / reframe jobs. */
  clipId?: string;
  aspectRatio?: '9:16' | '1:1' | '16:9';
  /** Arbitrary extra payload for specific job types. */
  meta?: Record<string, unknown>;
}

// ─── Redis connection ─────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

const connection = {
  // BullMQ accepts a parsed URL object or connection options
  host: new URL(REDIS_URL).hostname,
  port: Number(new URL(REDIS_URL).port) || 6379,
  password: new URL(REDIS_URL).password || undefined,
  tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
};

// ─── Queue ───────────────────────────────────────────────

export const videoQueue = new Queue<VideoJobData>('video-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  },
});

// ─── Enqueue helper ──────────────────────────────────────

/**
 * Enqueue a new video-processing job.
 * If `jobId` is not provided, a processingJobs row is created first.
 */
export async function enqueueVideoJob(data: VideoJobData): Promise<void> {
  let dbJobId = data.jobId;

  // Create a DB record if the caller didn't pre-create one
  if (!dbJobId) {
    const [row] = await db
      .insert(processingJobs)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        type: data.type,
        status: 'queued',
      })
      .returning();

    dbJobId = row.id;
  }

  await videoQueue.add(data.type, { ...data, jobId: dbJobId }, {
    jobId: `${data.type}-${dbJobId}`,
  });

  logger.info({ jobId: dbJobId, type: data.type, projectId: data.projectId }, 'Job enqueued');
}

// ─── Worker ──────────────────────────────────────────────

/**
 * Mark a processingJobs row as 'processing' and update project status.
 */
async function markProcessing(jobId: string, projectId: string): Promise<void> {
  await db
    .update(processingJobs)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(processingJobs.id, jobId));

  await db
    .update(projects)
    .set({ status: 'processing', updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

/**
 * Mark a processingJobs row as 'completed'.
 */
async function markCompleted(jobId: string, projectId: string, jobType: JobType): Promise<void> {
  await db
    .update(processingJobs)
    .set({ status: 'completed', progress: 100, completedAt: new Date() })
    .where(eq(processingJobs.id, jobId));

  // After the final pipeline step, mark the project completed
  if (jobType === 'score' || jobType === 'export') {
    await db
      .update(projects)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  }
}

/**
 * Mark a processingJobs row as 'failed'.
 */
async function markFailed(jobId: string, projectId: string, errorMsg: string): Promise<void> {
  await db
    .update(processingJobs)
    .set({ status: 'failed', error: errorMsg, completedAt: new Date() })
    .where(eq(processingJobs.id, jobId));

  await db
    .update(projects)
    .set({ status: 'failed', updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

// ─── Job processor map ───────────────────────────────────
// Each handler receives the full job data and should perform
// its work (call AI APIs, run FFmpeg, etc.) then resolve.

type JobHandler = (data: VideoJobData) => Promise<void>;

const handlers: Partial<Record<JobType, JobHandler>> = {
  ingest: async (data) => {
    logger.info({ projectId: data.projectId }, '[ingest] Starting source ingest');
    // TODO: Download / copy source file to storage, update source metadata
    await new Promise((r) => setTimeout(r, 500)); // placeholder
  },

  normalize: async (data) => {
    logger.info({ projectId: data.projectId }, '[normalize] Normalising audio/video');
    // TODO: Run FFmpeg normalization pipeline
    await new Promise((r) => setTimeout(r, 500));
  },

  transcribe: async (data) => {
    logger.info({ projectId: data.projectId }, '[transcribe] Running Whisper transcription');
    // TODO: Call Whisper API / local model, insert transcript + segments rows
    await new Promise((r) => setTimeout(r, 500));
  },

  analyze: async (data) => {
    logger.info({ projectId: data.projectId }, '[analyze] Running clip analysis');
    // TODO: Run MediaPipe + OpenAI analysis, insert clipCandidates rows
    await new Promise((r) => setTimeout(r, 500));
  },

  score: async (data) => {
    logger.info({ projectId: data.projectId }, '[score] Scoring clips');
    // TODO: Update clip scores + ranks
    await new Promise((r) => setTimeout(r, 500));
  },

  export: async (data) => {
    logger.info({ projectId: data.projectId, clipId: data.clipId }, '[export] Rendering export');
    // TODO: Run FFmpeg export for the clip, upload to storage, update clip with outputUrl
    await new Promise((r) => setTimeout(r, 500));
  },
};

// ─── Worker startup ──────────────────────────────────────

export const videoWorker = new Worker<VideoJobData>(
  'video-processing',
  async (job: Job<VideoJobData>) => {
    const data = job.data;
    const jobId = data.jobId!;

    logger.info({ jobId, type: data.type, projectId: data.projectId }, 'Worker picked up job');

    await markProcessing(jobId, data.projectId);

    const handler = handlers[data.type];
    if (!handler) {
      throw new Error(`No handler registered for job type: ${data.type}`);
    }

    await handler(data);
    await markCompleted(jobId, data.projectId, data.type);

    logger.info({ jobId, type: data.type }, 'Job completed successfully');
  },
  {
    connection,
    concurrency: 4,
    limiter: { max: 10, duration: 1_000 },
  },
);

// ─── Worker lifecycle events ─────────────────────────────

videoWorker.on('failed', async (job, err) => {
  if (!job) return;
  const data = job.data as VideoJobData;
  const jobId = data.jobId;

  logger.error({ jobId, type: data.type, err: err.message }, 'Worker job failed');

  if (jobId) {
    // Only mark failed in DB after all BullMQ retries are exhausted
    const isExhausted = (job.attemptsMade ?? 0) >= (job.opts?.attempts ?? 3);
    if (isExhausted) {
      await markFailed(jobId, data.projectId, err.message).catch((dbErr) =>
        logger.error({ dbErr }, 'Failed to persist job failure to DB'),
      );
    }
  }
});

videoWorker.on('error', (err) => {
  logger.error({ err }, 'Video worker encountered an error');
});

// ─── Queue events (optional — useful for monitoring) ─────

export const videoQueueEvents = new QueueEvents('video-processing', { connection });

videoQueueEvents.on('completed', ({ jobId }) => {
  logger.debug({ bullJobId: jobId }, 'BullMQ job completed');
});

videoQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.warn({ bullJobId: jobId, failedReason }, 'BullMQ job failed');
});