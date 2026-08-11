import { FastifyInstance } from 'fastify';

export async function usageRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Usage service is running',
  }));
}
