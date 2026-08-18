import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { clipCandidates, processingJobs } from '../../db/schema/index.js';
import { enqueueVideoJob } from '../../queues/workers/videoQueue.js';
import { AppError } from '../../utils/errors.js';

interface ExportBody {
  clipId: string;
  aspectRatio?: '9:16' | '1:1' | '16:9';
  format?: string;
}

export async function exportRoutes(app: FastifyInstance) {
  // POST /api/exports — kick off an export job for a clip
  app.post<{ Body: ExportBody }>('/', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { clipId, aspectRatio = '9:16' } = request.body ?? {};

    if (!clipId) {
      return reply.status(400).send({ error: { message: '`clipId` is required', code: 'VALIDATION_ERROR', statusCode: 400 } });
    }

    try {
      // Verify clip belongs to user and is approved
      const [clip] = await db
        .select()
        .from(clipCandidates)
        .where(and(eq(clipCandidates.id, clipId), eq(clipCandidates.userId, userId)));

      if (!clip) {
        return reply.status(404).send({ error: { message: 'Clip not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      // Create a processing job row for the export
      const [job] = await db
        .insert(processingJobs)
        .values({
          projectId: clip.projectId,
          userId,
          type: 'export',
          status: 'queued',
        })
        .returning();

      // Enqueue the export worker task
      await enqueueVideoJob({
        type: 'export',
        projectId: clip.projectId,
        clipId,
        jobId: job.id,
        userId,
        aspectRatio,
      });

      return reply.status(202).send({ exportId: job.id, status: 'queued', clipId });
    } catch (err) {
      throw new AppError('Failed to create export job', 500, 'DB_ERROR');
    }
  });

  // GET /api/exports/:jobId — poll export job status
  app.get<{ Params: { jobId: string } }>('/:jobId', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { jobId } = request.params;

    try {
      const [job] = await db
        .select()
        .from(processingJobs)
        .where(and(eq(processingJobs.id, jobId), eq(processingJobs.userId, userId)));

      if (!job) {
        return reply.status(404).send({ error: { message: 'Export job not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      return job;
    } catch (err) {
      throw new AppError('Failed to fetch export status', 500, 'DB_ERROR');
    }
  });
}

export default exportRoutes;