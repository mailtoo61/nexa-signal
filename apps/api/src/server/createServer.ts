import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { registerRoutes } from '../routes/index.js';

export function createServer() {
  const app = Fastify({ logger: false });
  app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  registerRoutes(app);
  return app;
}
