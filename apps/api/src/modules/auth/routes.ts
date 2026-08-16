import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    message: 'Auth service is running',
  }));

  app.post('/login', async (request, reply) => {
    return { status: 'success', message: 'User logged in successfully' };
  });

  app.post('/register', async (request, reply) => {
    return reply.status(201).send({ status: 'success', message: 'User registered' });
  });

  app.post('/logout', async (request, reply) => {
    return { status: 'success', message: 'User logged out' };
  });
}

export default authRoutes;
