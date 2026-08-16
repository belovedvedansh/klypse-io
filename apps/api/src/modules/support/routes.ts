import { FastifyInstance } from 'fastify';

export async function supportRoutes(app: FastifyInstance) {
  app.post('/ticket', async (request, reply) => {
    return reply.status(201).send({ ticketId: 'tick_123', status: 'open' });
  });
}

export default supportRoutes;