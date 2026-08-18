import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { projects, processingJobs } from '../../db/schema/index.js';
import { enqueueVideoJob } from '../../queues/videoQueue.js';
import { AppError } from '../../utils/errors.js';

interface ProjectBody {
  title: string;
  sourceType: 'upload' | 'youtube' | 'twitch' | 'kick';
  sourceUrl?: string;
  sourceFileName?: string;
}

interface ProjectParams {
  id: string;
}

export async function projectRoutes(app: FastifyInstance) {
  // GET /api/projects — list all projects for authenticated user
  app.get('/', async (request, reply) => {
    // TODO: Replace with real session lookup once auth middleware is wired
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    try {
      const rows = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt));

      return { projects: rows, total: rows.length };
    } catch (err) {
      throw new AppError('Failed to fetch projects', 500, 'DB_ERROR');
    }
  });

  // POST /api/projects — create a new project and enqueue ingest job
  app.post<{ Body: ProjectBody }>('/', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { title, sourceType, sourceUrl, sourceFileName } = request.body ?? {};

    if (!title || !sourceType) {
      return reply.status(400).send({
        error: { message: '`title` and `sourceType` are required', code: 'VALIDATION_ERROR', statusCode: 400 },
      });
    }

    try {
      const [project] = await db
        .insert(projects)
        .values({
          userId,
          title,
          sourceType,
          sourceUrl: sourceUrl ?? null,
          sourceFileName: sourceFileName ?? null,
          status: 'created',
        })
        .returning();

      // Enqueue the initial ingest job
      await enqueueVideoJob({
        type: 'ingest',
        projectId: project.id,
        userId,
      });

      return reply.status(201).send(project);
    } catch (err) {
      throw new AppError('Failed to create project', 500, 'DB_ERROR');
    }
  });

  // GET /api/projects/:id — fetch a single project with its jobs
  app.get<{ Params: ProjectParams }>('/:id', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { id } = request.params;

    try {
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)));

      if (!project) {
        return reply.status(404).send({ error: { message: 'Project not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      const jobs = await db
        .select()
        .from(processingJobs)
        .where(eq(processingJobs.projectId, id))
        .orderBy(desc(processingJobs.createdAt));

      return { ...project, jobs };
    } catch (err) {
      throw new AppError('Failed to fetch project', 500, 'DB_ERROR');
    }
  });

  // PATCH /api/projects/:id — update project status or metadata
  app.patch<{ Params: ProjectParams; Body: Partial<ProjectBody & { status: string }> }>(
    '/:id',
    async (request, reply) => {
      const userId = (request.headers['x-user-id'] as string) ?? '';
      if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

      const { id } = request.params;
      const { title, status } = request.body ?? {};

      try {
        const [existing] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, id), eq(projects.userId, userId)));

        if (!existing) {
          return reply.status(404).send({ error: { message: 'Project not found', code: 'NOT_FOUND', statusCode: 404 } });
        }

        const updates: Record<string, unknown> = { updatedAt: new Date() };
        if (title) updates.title = title;
        if (status) updates.status = status;

        const [updated] = await db
          .update(projects)
          .set(updates)
          .where(eq(projects.id, id))
          .returning();

        return updated;
      } catch (err) {
        throw new AppError('Failed to update project', 500, 'DB_ERROR');
      }
    },
  );

  // DELETE /api/projects/:id
  app.delete<{ Params: ProjectParams }>('/:id', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { id } = request.params;

    try {
      const [existing] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)));

      if (!existing) {
        return reply.status(404).send({ error: { message: 'Project not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      await db.delete(projects).where(eq(projects.id, id));
      return reply.status(204).send();
    } catch (err) {
      throw new AppError('Failed to delete project', 500, 'DB_ERROR');
    }
  });
}

export default projectRoutes;