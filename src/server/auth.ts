// ============================================================
// Pixel Media — Server-Side Identity & Authorization Guard
// ============================================================

import type { IncomingMessage } from 'node:http';
import { ProjectInvoice } from '../types/billing';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: 'client' | 'editor' | 'admin';
  isDemo: boolean;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

// In-memory registry of authorized demo users for testing & local development
const DEMO_USERS: Record<string, AuthenticatedUser> = {
  'mock-client-1': {
    id: 'mock-client-1',
    email: 'producer@nexusinteractive.com',
    role: 'client',
    isDemo: true,
  },
  'client-alice-1': {
    id: 'client-alice-1',
    email: 'alice@production.org',
    role: 'client',
    isDemo: true,
  },
  'mock-editor-1': {
    id: 'mock-editor-1',
    email: 'elena@rostovacinema.com',
    role: 'editor',
    isDemo: true,
  },
  'editor-bob-1': {
    id: 'editor-bob-1',
    email: 'bob@colorgrading.org',
    role: 'editor',
    isDemo: true,
  },
};

/**
 * Extracts and verifies the authenticated user from the HTTP Authorization header.
 * NEVER trust user IDs, roles, or permissions passed directly in request JSON bodies!
 */
export async function authenticateRequest(req: IncomingMessage): Promise<AuthResult> {
  const authHeader = req.headers['authorization'] || '';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or malformed Authorization header. Expected Bearer token.',
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      authenticated: false,
      error: 'Empty Bearer token provided.',
    };
  }

  // 1. Supabase JWT Verification (when configured in production)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseServiceKey && !token.startsWith('mock-') && !token.startsWith('demo-')) {
    try {
      // Validate JWT with Supabase Auth endpoint
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseServiceKey,
        },
      });

      if (userRes.ok) {
        const userData = (await userRes.json()) as Record<string, any>;
        const role = (userData.user_metadata?.role as 'client' | 'editor' | 'admin') || 'client';
        return {
          authenticated: true,
          user: {
            id: String(userData.id),
            email: userData.email,
            role,
            isDemo: false,
          },
        };
      }
    } catch {
      // Fall through to reject
    }
  }

  // 2. Demo / Test Token Verification
  // Format: "Bearer demo-token:<userId>:<role>" or "Bearer mock-<userId>"
  if (token.startsWith('demo-token:') || token.startsWith('mock-')) {
    let userId = '';
    let role: 'client' | 'editor' | 'admin' = 'client';

    if (token.startsWith('demo-token:')) {
      const parts = token.split(':');
      userId = parts[1] || '';
      role = (parts[2] as 'client' | 'editor' | 'admin') || 'client';
    } else {
      userId = token.replace('mock-', '');
      // Check preconfigured demo users
      if (DEMO_USERS[userId]) {
        return { authenticated: true, user: DEMO_USERS[userId] };
      }
      role = userId.includes('editor') ? 'editor' : 'client';
    }

    if (userId) {
      return {
        authenticated: true,
        user: {
          id: userId,
          email: `${userId}@pixelmedia.internal`,
          role,
          isDemo: true,
        },
      };
    }
  }

  return {
    authenticated: false,
    error: 'Invalid, expired, or unrecognized session token.',
  };
}

/**
 * Ensures the authenticated user is the designated client on an invoice before creating payment intents.
 * Strictly prevents clients from paying invoices belonging to other users or creators from initiating client charges.
 */
export function authorizeInvoicePayment(
  user: AuthenticatedUser,
  invoice: ProjectInvoice
): { authorized: boolean; reason?: string } {
  if (user.role === 'editor' && user.id === invoice.editorId) {
    return {
      authorized: false,
      reason: 'Forbidden: Creators cannot initiate client payment charges or fund their own invoices.',
    };
  }

  if (user.id !== invoice.clientId) {
    return {
      authorized: false,
      reason: 'Forbidden: Authenticated user is not the designated client for this invoice.',
    };
  }

  return { authorized: true };
}

/**
 * Ensures only the creator themselves can initiate their own Stripe Connect onboarding.
 */
export function authorizePayoutOnboarding(
  user: AuthenticatedUser,
  targetEditorId: string
): { authorized: boolean; reason?: string } {
  if (user.id !== targetEditorId) {
    return {
      authorized: false,
      reason: 'Forbidden: Users cannot manage Stripe Connect payout onboarding for another creator.',
    };
  }

  if (user.role !== 'editor' && user.role !== 'admin') {
    return {
      authorized: false,
      reason: 'Forbidden: Only verified creators can connect payout accounts.',
    };
  }

  return { authorized: true };
}

/**
 * Ensures audio/video calls can only be initiated and received between verified project participants.
 * Strictly prevents users from calling arbitrary users or accessing private project rooms.
 */
export function authorizeProjectCall(
  user: AuthenticatedUser,
  project: { clientId: string; editorId: string },
  receiverId: string
): { authorized: boolean; reason?: string } {
  // Caller must belong to the project
  if (user.id !== project.clientId && user.id !== project.editorId) {
    return {
      authorized: false,
      reason: 'Forbidden: You are not an authorized participant in this project.',
    };
  }

  // Counterparty must be the other participant
  const expectedCounterparty = user.id === project.clientId ? project.editorId : project.clientId;
  if (receiverId !== expectedCounterparty) {
    return {
      authorized: false,
      reason: 'Forbidden: Designated recipient is not a participant in this project.',
    };
  }

  return { authorized: true };
}
