import { useState, useEffect, useRef, useCallback } from 'react';
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js';
import { CallType, CallStatus, CallSession, CallInvitation } from '../types';
import { useAuth } from '../context/AuthContext';

interface UseProjectCallsOptions {
  projectId: string;
  recipientId?: string;
  recipientName?: string;
}

export function useProjectCalls({ projectId, recipientId }: UseProjectCallsOptions) {
  const { user } = useAuth();
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [incomingInvitation, setIncomingInvitation] = useState<CallInvitation | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [callError, setCallError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({});
  
  const dailyCallRef = useRef<DailyCall | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for incoming call invitations for this project
  const checkIncomingInvitations = useCallback(async () => {
    if (!user || callStatus !== 'idle') return;
    try {
      const res = await fetch(`/api/calls/invitations/active?projectId=${encodeURIComponent(projectId)}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.invitation && data.invitation.status === 'ringing') {
          // Verify that this invitation is meant for the current user
          if (data.invitation.receiverId === user.id) {
            setIncomingInvitation(data.invitation);
          }
        } else {
          setIncomingInvitation(null);
        }
      }
    } catch {
      // In local/demo offline mode, fetch might fail silently
    }
  }, [user, projectId, callStatus]);

  useEffect(() => {
    if (!user) return;
    checkIncomingInvitations();
    pollTimerRef.current = setInterval(checkIncomingInvitations, 3000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [checkIncomingInvitations, user]);

  // Handle call duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callStatus === 'idle') {
        setCallDurationSec(0);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Clean up daily call object
  const cleanupCall = useCallback(async () => {
    if (dailyCallRef.current) {
      try {
        await dailyCallRef.current.leave();
        dailyCallRef.current.destroy();
      } catch (err) {
        console.warn('Error destroying Daily call object:', err);
      }
      dailyCallRef.current = null;
    }
    setParticipants({});
    setCallStatus('idle');
    setActiveCallSession(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  // Initialize and join Daily room with token
  const joinDailyRoom = useCallback(async (session: CallSession) => {
    try {
      setCallStatus('connecting');
      setCallError(null);

      // Create Daily Call instance
      const call = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: session.callType === 'video',
      });
      dailyCallRef.current = call;

      // Event handlers
      call.on('joined-meeting', () => {
        setCallStatus('connected');
        setParticipants(call.participants());
      });

      call.on('participant-joined', () => {
        setParticipants({ ...call.participants() });
      });

      call.on('participant-updated', () => {
        setParticipants({ ...call.participants() });
      });

      call.on('participant-left', () => {
        setParticipants({ ...call.participants() });
      });

      call.on('left-meeting', () => {
        cleanupCall();
      });

      call.on('error', (e) => {
        setCallError(e?.errorMsg || 'A media connection error occurred.');
        setCallStatus('failed');
      });

      // Join with server-issued token
      await call.join({
        url: session.roomUrl,
        token: session.token,
      });

    } catch (err: any) {
      console.error('Failed to join call:', err);
      setCallError(err?.message || 'Unable to join call.');
      setCallStatus('failed');
    }
  }, [cleanupCall]);

  // Initiate call
  const startCall = async (type: CallType) => {
    if (!user) return;
    if (!recipientId) {
      setCallError('Recipient information is missing for this project.');
      return;
    }

    setCallStatus('initiating');
    setCallError(null);

    try {
      // 1. Request room session and short-lived token from server
      const sessionRes = await fetch('/api/calls/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          projectId,
          callType: type,
          recipientId,
        }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok) {
        if (sessionData.code === 'PROVIDER_UNCONFIGURED') {
          setCallError('Daily.co audio/video calling is not configured on this server. The server administrator must set the DAILY_API_KEY environment variable.');
        } else {
          setCallError(sessionData.error || 'Failed to initiate call session.');
        }
        setCallStatus('failed');
        return;
      }

      const session: CallSession = sessionData.session;
      setActiveCallSession(session);

      // 2. Dispatch call invitation signal
      const inviteRes = await fetch('/api/calls/invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          projectId,
          callType: type,
          receiverId: recipientId,
          roomUrl: session.roomUrl,
        }),
      });

      if (!inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setCallError(inviteData.error || 'Failed to dispatch call invitation.');
        setCallStatus('failed');
        return;
      }

      // 3. Now join room as caller
      await joinDailyRoom(session);

    } catch (err: any) {
      console.error('Call initiation error:', err);
      setCallError(err?.message || 'Failed to connect call.');
      setCallStatus('failed');
    }
  };

  // Accept incoming invitation
  const acceptInvitation = async () => {
    if (!incomingInvitation || !user) return;
    const inv = incomingInvitation;
    setIncomingInvitation(null);
    setCallStatus('initiating');

    try {
      // Respond accepted
      await fetch('/api/calls/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          invitationId: inv.id,
          action: 'accept',
        }),
      });

      // Request own join token for this session
      const sessionRes = await fetch('/api/calls/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          projectId,
          callType: inv.callType,
          recipientId: inv.callerId,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        setCallError(sessionData.error || 'Failed to obtain access token for room.');
        setCallStatus('failed');
        return;
      }

      const session: CallSession = sessionData.session;
      setActiveCallSession(session);
      await joinDailyRoom(session);

    } catch (err: any) {
      setCallError(err?.message || 'Failed to accept invitation.');
      setCallStatus('failed');
    }
  };

  // Decline incoming invitation
  const declineInvitation = async () => {
    if (!incomingInvitation || !user) return;
    const inv = incomingInvitation;
    setIncomingInvitation(null);

    try {
      await fetch('/api/calls/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          invitationId: inv.id,
          action: 'decline',
        }),
      });
    } catch (err) {
      console.error('Failed to decline call invitation:', err);
    }
  };

  // Toggle microphone
  const toggleMute = () => {
    if (!dailyCallRef.current) return;
    const newMuted = !isMuted;
    dailyCallRef.current.setLocalAudio(!newMuted);
    setIsMuted(newMuted);
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!dailyCallRef.current) return;
    const newCameraOff = !isCameraOff;
    dailyCallRef.current.setLocalVideo(!newCameraOff);
    setIsCameraOff(newCameraOff);
  };

  // End call
  const endCall = async () => {
    setCallStatus('ended');
    await cleanupCall();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dailyCallRef.current) {
        dailyCallRef.current.leave().catch(() => {});
        dailyCallRef.current.destroy().catch(() => {});
      }
    };
  }, []);

  return {
    callStatus,
    activeCallSession,
    incomingInvitation,
    isMuted,
    isCameraOff,
    callDurationSec,
    callError,
    participants,
    dailyCall: dailyCallRef.current,
    startCall,
    acceptInvitation,
    declineInvitation,
    toggleMute,
    toggleCamera,
    endCall,
    clearError: () => setCallError(null),
  };
}
