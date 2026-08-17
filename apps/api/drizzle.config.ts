import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Use a glob pattern or exact relative path
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});