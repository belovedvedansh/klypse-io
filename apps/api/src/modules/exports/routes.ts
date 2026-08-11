import { FastifyInstance } from 'fastify';

export async function exportRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Exports service is running',
  }));
}
