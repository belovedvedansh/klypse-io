import 'dotenv/config';
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    logger.info(`Klypse API running at http://${env.API_HOST}:${env.API_PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start Klypse API');
    process.exit(1);
  }
}

main();
