import { FastifyInstance } from 'fastify';

export async function usageRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { plan: 'pro', creditsUsed: 42, creditsLimit: 500 };
  });
}

export default usageRoutes;