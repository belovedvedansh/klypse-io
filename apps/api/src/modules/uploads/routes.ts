import { FastifyInstance } from 'fastify';

export async function uploadRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Uploads service is running',
  }));
}
