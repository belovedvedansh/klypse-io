import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { clipCandidates, projects } from '../../db/schema/index.js';
import { AppError } from '../../utils/errors.js';

interface ClipParams {
  id: string;
}

interface ClipStatusBody {
  status: 'approved' | 'rejected' | 'candidate';
}

export async function clipRoutes(app: FastifyInstance) {
  // GET /api/clips — list clips for user, optionally filtered by projectId
  app.get('/', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { projectId } = request.query as { projectId?: string };

    try {
      const conditions = [eq(clipCandidates.userId, userId)];
      if (projectId) conditions.push(eq(clipCandidates.projectId, projectId));

      const clips = await db
        .select()
        .from(clipCandidates)
        .where(and(...conditions))
        .orderBy(desc(clipCandidates.rank));

      return { clips, total: clips.length };
    } catch (err) {
      throw new AppError('Failed to fetch clips', 500, 'DB_ERROR');
    }
  });

  // GET /api/clips/:id — single clip detail
  app.get<{ Params: ClipParams }>('/:id', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { id } = request.params;

    try {
      const [clip] = await db
        .select()
        .from(clipCandidates)
        .where(and(eq(clipCandidates.id, id), eq(clipCandidates.userId, userId)));

      if (!clip) {
        return reply.status(404).send({ error: { message: 'Clip not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      return clip;
    } catch (err) {
      throw new AppError('Failed to fetch clip', 500, 'DB_ERROR');
    }
  });

  // PATCH /api/clips/:id/status — approve or reject a clip
  app.patch<{ Params: ClipParams; Body: ClipStatusBody }>('/:id/status', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { id } = request.params;
    const { status } = request.body ?? {};

    const validStatuses = ['approved', 'rejected', 'candidate'] as const;
    if (!status || !validStatuses.includes(status)) {
      return reply.status(400).send({
        error: { message: `status must be one of: ${validStatuses.join(', ')}`, code: 'VALIDATION_ERROR', statusCode: 400 },
      });
    }

    try {
      const [existing] = await db
        .select()
        .from(clipCandidates)
        .where(and(eq(clipCandidates.id, id), eq(clipCandidates.userId, userId)));

      if (!existing) {
        return reply.status(404).send({ error: { message: 'Clip not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      const [updated] = await db
        .update(clipCandidates)
        .set({ status, updatedAt: new Date() })
        .where(eq(clipCandidates.id, id))
        .returning();

      return updated;
    } catch (err) {
      throw new AppError('Failed to update clip status', 500, 'DB_ERROR');
    }
  });

  // DELETE /api/clips/:id
  app.delete<{ Params: ClipParams }>('/:id', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { id } = request.params;

    try {
      const [existing] = await db
        .select()
        .from(clipCandidates)
        .where(and(eq(clipCandidates.id, id), eq(clipCandidates.userId, userId)));

      if (!existing) {
        return reply.status(404).send({ error: { message: 'Clip not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      await db.delete(clipCandidates).where(eq(clipCandidates.id, id));
      return reply.status(204).send();
    } catch (err) {
      throw new AppError('Failed to delete clip', 500, 'DB_ERROR');
    }
  });
}

export default clipRoutes;