import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectMessagesThread } from '../components/workspace/ProjectMessagesThread';
import { CallInterfaceModal } from '../components/workspace/CallInterfaceModal';
import { UnifiedInboxView } from '../components/dashboard/UnifiedInboxView';
import { AuthProvider } from '../context/AuthContext';
import { ProjectMessage, CallInvitation } from '../types';
import { authorizeProjectCall } from '../server/auth';
import { 
  registerCallInvitation, 
  updateCallInvitationStatus, 
  getActiveInvitationForUser,
  resetCallStateForTesting,
  getCallProviderStatus 
} from '../server/callService';

const mockMessages: ProjectMessage[] = [
  {
    id: 'msg-1',
    requestId: 'req-proj-1',
    senderId: 'client-user-1',
    senderRole: 'client',
    senderName: 'Client Alice',
    content: 'Hi! Here is the asset drive: https://assets.pixelmedia.test/raw-footage',
    readBy: ['client-user-1'],
    createdAt: '2026-10-29T10:00:00Z',
  },
  {
    id: 'msg-2',
    requestId: 'req-proj-1',
    senderId: 'editor-user-1',
    senderRole: 'editor',
    senderName: 'Lead Creator Bob',
    content: 'Received footage. Sound sync looks great! Checking timeline pacing.',
    readBy: ['editor-user-1', 'client-user-1'],
    createdAt: '2026-10-29T10:05:00Z',
  },
];

describe('Real-Time Communication & Calling System', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCallStateForTesting();
  });

  describe('1. Project Messages Thread Component', () => {
    it('renders project message history with timestamps, sender identity, and role badges', () => {
      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={vi.fn()}
          currentUserId="client-user-1"
        />
      );

      expect(screen.getByText('Project Conversation')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeInTheDocument();
      expect(screen.getByText('Lead Creator Bob')).toBeInTheDocument();
      expect(screen.getByText(/Received footage/i)).toBeInTheDocument();
    });

    it('safely renders shared URLs as clickable anchor tags', () => {
      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={vi.fn()}
          currentUserId="client-user-1"
        />
      );

      const link = screen.getByRole('link', { name: 'https://assets.pixelmedia.test/raw-footage' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('submits a new message on Enter and triggers onSendMessage callback', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);
      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={handleSend}
          currentUserId="client-user-1"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write a message/i);
      fireEvent.change(textarea, { target: { value: 'Looks fantastic, ready to review cut.' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(handleSend).toHaveBeenCalledWith('Looks fantastic, ready to review cut.');
      });
    });

    it('shows incoming call banner with Accept and Decline actions when an invitation is ringing', () => {
      const mockInvitation: CallInvitation = {
        id: 'inv-test-1',
        projectId: 'req-proj-1',
        callerId: 'editor-user-1',
        callerName: 'Lead Creator Bob',
        receiverId: 'client-user-1',
        callType: 'video',
        status: 'ringing',
        roomUrl: 'https://pixelmedia.daily.co/test-room',
        createdAt: new Date().toISOString(),
      };

      const handleAccept = vi.fn();
      const handleDecline = vi.fn();

      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={vi.fn()}
          currentUserId="client-user-1"
          incomingCall={mockInvitation}
          onAcceptCall={handleAccept}
          onDeclineCall={handleDecline}
        />
      );

      expect(screen.getByText(/Incoming Video Call/i)).toBeInTheDocument();
      expect(screen.getByText(/Lead Creator Bob is calling you/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Accept/i }));
      expect(handleAccept).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Decline/i }));
      expect(handleDecline).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Call Interface & States', () => {
    it('renders provider-unavailable error when Daily.co is not configured without pretending call succeeded', () => {
      const handleHangUp = vi.fn();
      render(
        <CallInterfaceModal
          isOpen={true}
          callType="video"
          callStatus="failed"
          participants={{}}
          dailyCall={null}
          durationSec={0}
          isMuted={false}
          isCameraOff={false}
          errorMessage="Daily.co credentials (DAILY_API_KEY) are not configured on this server."
          onToggleMute={vi.fn()}
          onToggleCamera={vi.fn()}
          onHangUp={handleHangUp}
          remoteParticipantName="Bob"
          projectTitle="Commercial Teaser"
        />
      );

      expect(screen.getByText(/Call Service Unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/DAILY_API_KEY/i)).toBeInTheDocument();

      const returnBtn = screen.getByRole('button', { name: /Return to Conversation/i });
      fireEvent.click(returnBtn);
      expect(handleHangUp).toHaveBeenCalledTimes(1);
    });

    it('displays active duration and call controls when call is connected', () => {
      const handleMute = vi.fn();
      const handleCamera = vi.fn();
      const handleHangUp = vi.fn();

      render(
        <CallInterfaceModal
          isOpen={true}
          callType="video"
          callStatus="connected"
          participants={{}}
          dailyCall={null}
          durationSec={125} // 02:05
          isMuted={false}
          isCameraOff={false}
          errorMessage={null}
          onToggleMute={handleMute}
          onToggleCamera={handleCamera}
          onHangUp={handleHangUp}
          remoteParticipantName="Bob"
          projectTitle="Documentary Cut"
        />
      );

      expect(screen.getByText('02:05')).toBeInTheDocument();
      expect(screen.getByLabelText(/Mute microphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Turn camera off/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Hang up call/i }));
      expect(handleHangUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Server-Side Project Calling Authorization & Signaling', () => {
    const mockProject = {
      id: 'req-auth-proj-1',
      clientId: 'client-user-1',
      editorId: 'editor-user-1',
      status: 'in_progress',
    };

    it('authorizes authenticated project participants to call each other', () => {
      const clientUser = { id: 'client-user-1', role: 'client' as const };
      const editorUser = { id: 'editor-user-1', role: 'editor' as const };

      const resClient = authorizeProjectCall(clientUser, mockProject, 'editor-user-1');
      expect(resClient.authorized).toBe(true);

      const resEditor = authorizeProjectCall(editorUser, mockProject, 'client-user-1');
      expect(resEditor.authorized).toBe(true);
    });

    it('strictly forbids non-participants from calling or joining project calls', () => {
      const intruderUser = { id: 'intruder-user-99', role: 'client' as const };

      const res = authorizeProjectCall(intruderUser, mockProject, 'editor-user-1');
      expect(res.authorized).toBe(false);
      expect(res.reason).toMatch(/participant/i);
    });

    it('strictly forbids calling arbitrary third-party user IDs outside the project', () => {
      const clientUser = { id: 'client-user-1', role: 'client' as const };

      const res = authorizeProjectCall(clientUser, mockProject, 'random-user-55');
      expect(res.authorized).toBe(false);
      expect(res.reason).toMatch(/recipient/i);
    });

    it('creates and updates call invitations through signaling lifecycle', () => {
      const invitation: CallInvitation = {
        id: 'inv-sig-1',
        projectId: 'req-auth-proj-1',
        callerId: 'client-user-1',
        callerName: 'Alice',
        receiverId: 'editor-user-1',
        callType: 'voice',
        status: 'ringing',
        roomUrl: 'https://pixelmedia.daily.co/sample-room',
        createdAt: new Date().toISOString(),
      };

      registerCallInvitation(invitation);

      expect(invitation.status).toBe('ringing');
      expect(getActiveInvitationForUser('editor-user-1')?.id).toBe(invitation.id);

      const accepted = updateCallInvitationStatus(invitation.id, 'connected');
      expect(accepted?.status).toBe('connected');

      const activeAfterAccept = getActiveInvitationForUser('editor-user-1');
      expect(activeAfterAccept).toBeUndefined();
    });
  });

  describe('4. Unified Inbox View', () => {
    it('renders unified inbox container with search filter and direct communication badge', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <UnifiedInboxView />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Messages & Communication')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Filter by project or participant/i)).toBeInTheDocument();
      expect(screen.getByText('End-to-End Direct Communications')).toBeInTheDocument();
    });
  });
});
