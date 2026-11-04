// ============================================================
// Pixel Media — Daily.co Audio/Video Calling Service
// Handles server-side room creation, short-lived meeting tokens,
// and authorization enforcement without leaking API keys to client.
// ============================================================

import type { CallType, CallInvitation } from '../types';

export interface CallProviderStatus {
  configured: boolean;
  provider: 'daily';
  message: string;
}

export interface CallSessionResult {
  success: boolean;
  error?: string;
  code?: 'PROVIDER_UNCONFIGURED' | 'ROOM_CREATION_FAILED' | 'TOKEN_CREATION_FAILED' | 'UNAUTHORIZED';
  roomUrl?: string;
  roomName?: string;
  token?: string;
  exp?: number;
}

// In-memory call invitations store for active signaling & testing
const activeInvitations = new Map<string, CallInvitation>();

export function getCallProviderStatus(): CallProviderStatus {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return {
      configured: false,
      provider: 'daily',
      message:
        'Daily.co credentials (DAILY_API_KEY) are not configured on the server. Audio and video calling requires a valid provider API key.',
    };
  }
  return {
    configured: true,
    provider: 'daily',
    message: 'Daily.co audio/video calling provider is configured and ready.',
  };
}

/**
 * Creates a private, short-lived Daily.co room and meeting token server-side.
 * Never trust room names or credentials supplied by the client!
 */
export async function createDailyCallSession(params: {
  requestId: string;
  callType: CallType;
  userId: string;
  userName: string;
  isOwner: boolean;
}): Promise<CallSessionResult> {
  const apiKey = process.env.DAILY_API_KEY?.trim();

  if (!apiKey) {
    return {
      success: false,
      code: 'PROVIDER_UNCONFIGURED',
      error:
        'Daily.co credentials (DAILY_API_KEY) are not configured on the server. Audio and video calling requires server configuration.',
    };
  }

  const exp = Math.floor(Date.now() / 1000) + 3600; // 1-hour expiration
  const cleanId = params.requestId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  const roomName = `pixel-${cleanId}-${Date.now().toString(36)}`;

  try {
    // 1. Create Room via Daily REST API
    const roomRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp,
          enable_recording: false,
          enable_chat: false,
          start_video_off: params.callType === 'audio',
          start_audio_off: false,
          eject_at_room_exp: true,
        },
      }),
    });

    if (!roomRes.ok) {
      const errBody = await roomRes.text();
      return {
        success: false,
        code: 'ROOM_CREATION_FAILED',
        error: `Daily.co room creation failed (${roomRes.status}): ${errBody}`,
      };
    }

    const roomData = (await roomRes.json()) as { url: string; name: string };

    // 2. Create Scoped Meeting Token
    const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: params.userName || 'Pixel Media User',
          user_id: params.userId,
          is_owner: params.isOwner,
          exp,
          enable_recording: false,
        },
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return {
        success: false,
        code: 'TOKEN_CREATION_FAILED',
        error: `Daily.co token issuance failed (${tokenRes.status}): ${errBody}`,
      };
    }

    const tokenData = (await tokenRes.json()) as { token: string };

    return {
      success: true,
      roomUrl: roomData.url,
      roomName: roomData.name,
      token: tokenData.token,
      exp,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    return {
      success: false,
      code: 'ROOM_CREATION_FAILED',
      error: `Failed to contact Daily.co API: ${message}`,
    };
  }
}

// --- Active Call Invitations Signaling ---

export function registerCallInvitation(invitation: CallInvitation): CallInvitation {
  activeInvitations.set(invitation.id, invitation);
  return invitation;
}

export function getCallInvitation(id: string): CallInvitation | undefined {
  return activeInvitations.get(id);
}

export function getActiveInvitationForUser(userId: string): CallInvitation | undefined {
  for (const inv of activeInvitations.values()) {
    if (inv.receiverId === userId && inv.status === 'ringing') {
      // Auto-expire invitations older than 60 seconds
      const elapsedMs = Date.now() - new Date(inv.createdAt).getTime();
      if (elapsedMs > 60000) {
        inv.status = 'missed';
        return undefined;
      }
      return inv;
    }
  }
  return undefined;
}

export function updateCallInvitationStatus(
  id: string,
  status: CallInvitation['status']
): CallInvitation | undefined {
  const inv = activeInvitations.get(id);
  if (inv) {
    inv.status = status;
    return inv;
  }
  return undefined;
}

export function resetCallStateForTesting(): void {
  activeInvitations.clear();
}
