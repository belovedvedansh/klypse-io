import { FastifyInstance } from 'fastify';

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/presigned-url', async (request, reply) => {
    return { uploadUrl: 'https://storage.example.com/upload-token' };
  });
}

export default uploadRoutes;