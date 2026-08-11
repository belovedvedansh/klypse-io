import { FastifyInstance } from 'fastify';

export async function adminRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Admin service is running',
  }));
}
