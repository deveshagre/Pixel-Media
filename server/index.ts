// ============================================================
// Pixel Media — Production Standalone Node HTTP/API Server
// Production server for payment webhooks, intents, and Stripe Connect
// ============================================================

import http from 'node:http';
import { handleApiRequest, sendJson } from '../src/server/apiHandler';

const PORT = Number(process.env.API_PORT || 4000);

export const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      sendJson(res, 404, { error: `Not found: ${req.method} ${req.url}` });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendJson(res, 500, { error: message });
  }
});

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  server.listen(PORT, () => {
    console.log(`[Pixel Media API Server] Running on http://localhost:${PORT}`);
  });
}
