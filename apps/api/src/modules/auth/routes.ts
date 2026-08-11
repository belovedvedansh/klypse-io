import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Auth service is running',
  }));
}
