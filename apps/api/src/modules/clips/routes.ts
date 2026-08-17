import { FastifyInstance } from 'fastify';

export async function clipRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { clips: [] };
  });

  app.post('/', async (request, reply) => {
    return reply.status(201).send({ id: 'clip_123', status: 'processing' });
  });
}

export default clipRoutes;