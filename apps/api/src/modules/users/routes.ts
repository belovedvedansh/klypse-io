import { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Users service is running',
  }));
}
