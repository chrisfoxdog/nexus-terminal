import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const mod = await import('../dist/server.cjs');
  const app = (mod.default as any)?.default || mod.default;
  return app(req, res);
}