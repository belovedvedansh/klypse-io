import { FastifyInstance } from 'fastify';

export async function projectRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Projects service is running',
  }));
}
