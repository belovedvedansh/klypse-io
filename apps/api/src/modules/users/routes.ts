import { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance) {
  app.get('/me', async (request, reply) => {
    return { id: 'usr_123', name: 'Demo User', email: 'user@example.com' };
  });

  app.patch('/me', async (request, reply) => {
    return { status: 'success', message: 'Profile updated' };
  });
}

export default userRoutes;