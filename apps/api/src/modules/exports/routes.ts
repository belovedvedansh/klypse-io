import { FastifyInstance } from 'fastify';

export async function exportRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    return reply.status(202).send({ exportId: 'exp_123', status: 'queued' });
  });
}

export default exportRoutes;