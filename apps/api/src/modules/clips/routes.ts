import { FastifyInstance } from 'fastify';

export async function clipRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Clips service is running',
  }));
}
