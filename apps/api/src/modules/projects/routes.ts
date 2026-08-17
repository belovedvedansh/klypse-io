import { FastifyInstance } from 'fastify';

export async function projectRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { projects: [] };
  });

  app.post('/', async (request, reply) => {
    return reply.status(201).send({ id: 'proj_123', name: 'New Project' });
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return { id, name: `Project ${id}` };
  });
}

export default projectRoutes;