// ============================================================
// Pixel Media — Vite API Dev Server Middleware Plugin
// Delegates to the unified secure payment API handler
// ============================================================

import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from './apiHandler';

export function pixelMediaApiPlugin(): Plugin {
  return {
    name: 'pixel-media-api-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        try {
          const handled = await handleApiRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          next();
        }
      });
    },
  };
}
