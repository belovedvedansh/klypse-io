import { FastifyInstance } from 'fastify';

export async function adminRoutes(app: FastifyInstance) {
  app.get('/metrics', async (request, reply) => {
    return { totalUsers: 100, activeProjects: 45 };
  });
}

export default adminRoutes;