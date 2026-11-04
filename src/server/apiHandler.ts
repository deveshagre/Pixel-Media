// ============================================================
// Pixel Media — Unified Secure HTTP API Handler
// Shared between Vite dev middleware and standalone Node server
// Handles direct payments notice & secure Daily audio/video calling
// ============================================================

import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  authenticateRequest,
  authorizeProjectCall,
} from './auth';
import {
  getCallProviderStatus,
  createDailyCallSession,
  registerCallInvitation,
  getActiveInvitationForUser,
  updateCallInvitationStatus,
} from './callService';
import type { CallType, CallInvitation } from '../types';

// Simple in-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

export interface ParsedRequest {
  rawBuffer: Buffer;
  jsonBody: Record<string, unknown>;
}

export function readRawBody(
  req: IncomingMessage,
  maxBytes: number = 64 * 1024
): Promise<ParsedRequest> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        req.destroy();
        reject(new Error(`Payload too large. Limit is ${maxBytes} bytes.`));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const rawBuffer = Buffer.concat(chunks);
      if (rawBuffer.length === 0) {
        resolve({ rawBuffer, jsonBody: {} });
        return;
      }

      try {
        const text = rawBuffer.toString('utf8');
        const jsonBody = JSON.parse(text);
        if (typeof jsonBody !== 'object' || jsonBody === null || Array.isArray(jsonBody)) {
          reject(new Error('Invalid JSON: expected a JSON object.'));
          return;
        }
        resolve({ rawBuffer, jsonBody });
      } catch {
        reject(new Error('Malformed JSON payload.'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
  res.end(JSON.stringify(data));
}

/**
 * Unified request handler for Pixel Media APIs.
 * Returns true if the request was handled, false if not matched.
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';

  // Only handle Pixel Media APIs
  if (!url.startsWith('/api/calls') && !url.startsWith('/api/payments') && !url.startsWith('/api/payouts')) {
    return false;
  }

  // Set timeout safety: abort request after 15 seconds
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      sendJson(res, 504, { error: 'Service gateway timeout (15s).' });
    }
  }, 15000);

  res.on('finish', () => clearTimeout(timeoutId));
  res.on('close', () => clearTimeout(timeoutId));

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
    res.end();
    return true;
  }

  // Rate Limiting
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    sendJson(res, 429, { error: 'Too many requests. Please slow down.' });
    return true;
  }

  try {
    // ------------------------------------------------------------------------
    // 1. Audio & Video Calling APIs (/api/calls)
    // ------------------------------------------------------------------------

    // GET /api/calls/config — Calling provider readiness check
    if (method === 'GET' && url.startsWith('/api/calls/config')) {
      sendJson(res, 200, getCallProviderStatus());
      return true;
    }

    // POST /api/calls/session — Authoritative Daily room creation & token issuance
    if (method === 'POST' && url.startsWith('/api/calls/session')) {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated || !auth.user) {
        sendJson(res, 401, { error: auth.error || 'Authentication required.' });
        return true;
      }

      const { jsonBody } = await readRawBody(req, 64 * 1024);
      const requestId = String(jsonBody.requestId || '');
      const receiverId = String(jsonBody.receiverId || '');
      const callType = (jsonBody.callType === 'video' ? 'video' : 'audio') as CallType;
      const project = jsonBody.project as { clientId: string; editorId: string } | undefined;

      if (!requestId || !receiverId || !project) {
        sendJson(res, 400, { error: 'Missing required calling parameters (requestId, receiverId, project).' });
        return true;
      }

      // Enforce participant authorization: caller & receiver must belong to this specific project
      const authz = authorizeProjectCall(auth.user, project, receiverId);
      if (!authz.authorized) {
        sendJson(res, 403, { error: authz.reason });
        return true;
      }

      const result = await createDailyCallSession({
        requestId,
        callType,
        userId: auth.user.id,
        userName: auth.user.email || 'Pixel Media User',
        isOwner: auth.user.id === project.clientId,
      });

      sendJson(res, result.success ? 200 : result.code === 'PROVIDER_UNCONFIGURED' ? 503 : 400, result);
      return true;
    }

    // POST /api/calls/invitation — Register active call invitation for signaling
    if (method === 'POST' && url.startsWith('/api/calls/invitation')) {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated || !auth.user) {
        sendJson(res, 401, { error: auth.error || 'Authentication required.' });
        return true;
      }

      const { jsonBody } = await readRawBody(req, 64 * 1024);
      const invitation = jsonBody.invitation as CallInvitation | undefined;
      const project = jsonBody.project as { clientId: string; editorId: string } | undefined;

      if (!invitation || !invitation.id || !invitation.requestId || !invitation.receiverId || !project) {
        sendJson(res, 400, { error: 'Invalid or incomplete call invitation payload.' });
        return true;
      }

      // Verify caller is who they claim to be
      if (invitation.callerId !== auth.user.id) {
        sendJson(res, 403, { error: 'Forbidden: Caller ID mismatch.' });
        return true;
      }

      // Verify project membership
      const authz = authorizeProjectCall(auth.user, project, invitation.receiverId);
      if (!authz.authorized) {
        sendJson(res, 403, { error: authz.reason });
        return true;
      }

      const registered = registerCallInvitation(invitation);
      sendJson(res, 200, { success: true, invitation: registered });
      return true;
    }

    // GET /api/calls/invitations/active — Check for incoming ringing invitation
    if (method === 'GET' && url.startsWith('/api/calls/invitations/active')) {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated || !auth.user) {
        sendJson(res, 401, { error: auth.error || 'Authentication required.' });
        return true;
      }

      const active = getActiveInvitationForUser(auth.user.id);
      sendJson(res, 200, { success: true, invitation: active || null });
      return true;
    }

    // POST /api/calls/respond — Accept, decline, or end an active invitation
    if (method === 'POST' && url.startsWith('/api/calls/respond')) {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated || !auth.user) {
        sendJson(res, 401, { error: auth.error || 'Authentication required.' });
        return true;
      }

      const { jsonBody } = await readRawBody(req, 64 * 1024);
      const invitationId = String(jsonBody.invitationId || '');
      const action = String(jsonBody.action || '') as CallInvitation['status'];

      if (!invitationId || !action) {
        sendJson(res, 400, { error: 'Missing invitationId or action.' });
        return true;
      }

      const updated = updateCallInvitationStatus(invitationId, action);
      sendJson(res, 200, { success: Boolean(updated), invitation: updated || null });
      return true;
    }

    // ------------------------------------------------------------------------
    // 2. Direct Payments & Commercial Ledger APIs (/api/payments, /api/payouts)
    // Pixel Media does NOT process payments, escrow funds, or hold deposits.
    // All commercial compensation is settled directly between client and creator.
    // ------------------------------------------------------------------------

    // GET /api/payments/config — Direct settlement configuration
    if (method === 'GET' && url.startsWith('/api/payments/config')) {
      sendJson(res, 200, {
        directSettlement: true,
        escrowEnabled: false,
        inAppCardProcessing: false,
        stripePublishableKey: null,
        notice:
          'Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'],
      });
      return true;
    }

    // Deprecated in-app card charge & payout initiation endpoints (410 Gone with direct-payment guidance)
    if (
      (method === 'POST' && url.startsWith('/api/payments/create-intent')) ||
      (method === 'POST' && url.startsWith('/api/payouts/connect'))
    ) {
      sendJson(res, 410, {
        error:
          'In-app payment processing is disabled. Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.',
        directSettlement: true,
      });
      return true;
    }

    sendJson(res, 404, { error: `Not found: ${method} ${url}` });
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendJson(res, 500, { error: message });
    return true;
  }
}
