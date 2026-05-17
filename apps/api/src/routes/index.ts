import type { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance): void {
  app.get('/health', async () => ({ ok: true }));
  app.post('/v1/auth/anonymous', async () => ({
    token: 'anon-token-placeholder',
  }));
  app.get('/v1/leaderboard', async () => ({ entries: [] }));
  app.get('/v1/daily-seed', async () => ({ seed: 'daily-2026-05-10' }));
  app.post('/v1/analytics', async () => ({ accepted: true }));
  app.get('/v1/remote-config', async () => ({
    minVersion: '1.0.0',
    featureFlags: {},
  }));
}
