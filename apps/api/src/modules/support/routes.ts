import { FastifyInstance } from 'fastify';

export async function supportRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Support service is running',
  }));
}
