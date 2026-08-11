import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// Module routes
import { authRoutes } from './modules/auth/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { projectRoutes } from './modules/projects/routes.js';
import { clipRoutes } from './modules/clips/routes.js';
import { uploadRoutes } from './modules/uploads/routes.js';
import { exportRoutes } from './modules/exports/routes.js';
import { usageRoutes } from './modules/usage/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { supportRoutes } from './modules/support/routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: false, // We use our own Pino instance
    maxParamLength: 256,
  });

  // ---- Plugins ----
  await app.register(cors, {
    origin: env.API_CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.AUTH_SECRET,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ---- Health check ----
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }));

  // ---- API Routes ----
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(clipRoutes, { prefix: '/api/clips' });
  await app.register(uploadRoutes, { prefix: '/api/uploads' });
  await app.register(exportRoutes, { prefix: '/api/exports' });
  await app.register(usageRoutes, { prefix: '/api/usage' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(supportRoutes, { prefix: '/api/support' });

  // ---- Global error handler ----
  app.setErrorHandler((error, request, reply) => {
    logger.error({ err: error, url: request.url, method: request.method }, 'Request error');

    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      error: {
        message: statusCode === 500 ? 'Internal server error' : error.message,
        code: error.code ?? 'INTERNAL_ERROR',
        statusCode,
      },
    });
  });

  // ---- Not found handler ----
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        message: `Route ${request.method} ${request.url} not found`,
        code: 'NOT_FOUND',
        statusCode: 404,
      },
    });
  });

  return app;
}
