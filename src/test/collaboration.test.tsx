import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  parseTimestamp,
  isValidTimestamp,
  getVideoEmbedInfo,
} from '../hooks/useProjectCollaboration';
import { ProjectMessagesThread } from '../components/workspace/ProjectMessagesThread';
import { ProjectReviewWorkspace } from '../components/workspace/ProjectReviewWorkspace';
import { ProjectWorkspaceView } from '../pages/ProjectWorkspaceView';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ClientDataProvider } from '../context/ClientDataContext';
import { ProjectMessage, ReviewVersion, ReviewComment, ProjectRequest } from '../types';

describe('Pixel Media — Collaboration & Review Workspace', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Timecode and Safe URL Embed Utilities', () => {
    it('accurately parses valid timecode formats to seconds and display string', () => {
      expect(parseTimestamp('00:14')).toEqual({ seconds: 14, display: '00:14' });
      expect(parseTimestamp('1:45')).toEqual({ seconds: 105, display: '01:45' });
      expect(parseTimestamp('01:15:30')).toEqual({ seconds: 4530, display: '01:15:30' });
      expect(parseTimestamp('45')).toEqual({ seconds: 45, display: '00:45' });

      expect(isValidTimestamp('00:14')).toBe(true);
      expect(isValidTimestamp('02:30:15')).toBe(true);
    });

    it('rejects malformed or invalid timecode formats', () => {
      expect(parseTimestamp('')).toBeNull();
      expect(parseTimestamp('invalid:time')).toBeNull();
      expect(parseTimestamp('abc')).toBeNull();
      expect(isValidTimestamp('abc')).toBe(false);
    });

    it('safely extracts YouTube and Vimeo embed URLs and identifies cloud drives', () => {
      // YouTube
      const yt = getVideoEmbedInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(yt.isEmbeddable).toBe(true);
      expect(yt.platform).toBe('youtube');
      expect(yt.embedUrl).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');

      // YouTube short url
      const ytShort = getVideoEmbedInfo('https://youtu.be/dQw4w9WgXcQ');
      expect(ytShort.isEmbeddable).toBe(true);

      // Vimeo
      const vimeo = getVideoEmbedInfo('https://vimeo.com/76979871');
      expect(vimeo.isEmbeddable).toBe(true);
      expect(vimeo.platform).toBe('vimeo');
      expect(vimeo.embedUrl).toContain('player.vimeo.com/video/76979871');

      // Frame.io / Cloud Drive (Non-embeddable, external review hub)
      const frameIo = getVideoEmbedInfo('https://app.frame.io/reviews/12345');
      expect(frameIo.isEmbeddable).toBe(false);
      expect(frameIo.platform).toBe('cloud');
      expect(frameIo.label).toContain('Frame.io');

      const gDrive = getVideoEmbedInfo('https://drive.google.com/file/d/12345/view');
      expect(gDrive.isEmbeddable).toBe(false);
      expect(gDrive.platform).toBe('cloud');
      expect(gDrive.label).toContain('Google Drive');
    });
  });

  describe('ProjectMessagesThread', () => {
    const mockMessages: ProjectMessage[] = [
      {
        id: 'msg-1',
        requestId: 'req-1',
        senderId: 'demo-client-01',
        senderRole: 'client',
        senderName: 'Client Producer',
        content: 'Hi Maya, footage has been uploaded to the shared folder.',
        createdAt: '2026-10-27T10:00:00Z',
      },
      {
        id: 'msg-2',
        requestId: 'req-1',
        senderId: 'demo-editor-01',
        senderRole: 'editor',
        senderName: 'Maya Chen',
        content: 'Received! Beginning assembly cut with the requested anamorphic look.',
        createdAt: '2026-10-27T10:15:00Z',
      },
    ];

    it('renders chronological message bubbles with roles and names', () => {
      const handleSend = vi.fn();
      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={handleSend}
          currentUserId="demo-client-01"
        />
      );

      expect(screen.getByText(/Project Conversation/i)).toBeInTheDocument();
      expect(screen.getByText(/Hi Maya, footage has been uploaded to the shared folder./i)).toBeInTheDocument();
      expect(screen.getByText(/Received! Beginning assembly cut with the requested anamorphic look./i)).toBeInTheDocument();
      expect(screen.getByText(/Maya Chen/i)).toBeInTheDocument();
    });

    it('submits a new message when clicking send or pressing enter', async () => {
      const handleSend = vi.fn().mockResolvedValue({});
      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={handleSend}
          currentUserId="demo-client-01"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write a message/i);
      fireEvent.change(textarea, { target: { value: 'Excited to see the first cut!' } });

      const sendBtn = screen.getByLabelText(/Send message/i);
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(handleSend).toHaveBeenCalledWith('Excited to see the first cut!');
      });
    });

    it('prevents sending empty or blank messages', () => {
      const handleSend = vi.fn();
      render(
        <ProjectMessagesThread
          messages={mockMessages}
          onSendMessage={handleSend}
          currentUserId="demo-client-01"
        />
      );

      const sendBtn = screen.getByLabelText(/Send message/i);
      fireEvent.click(sendBtn);

      expect(handleSend).not.toHaveBeenCalled();
    });
  });

  describe('ProjectReviewWorkspace', () => {
    const mockVersions: ReviewVersion[] = [
      {
        id: 'v1',
        requestId: 'req-1',
        versionNumber: 1,
        title: 'Version 1 — Rough Assembly',
        videoUrl: 'https://vimeo.com/76979871',
        notes: 'Initial assembly cut with placeholder temp audio score.',
        submittedBy: 'demo-editor-01',
        submittedByName: 'Maya Chen',
        status: 'pending_review',
        createdAt: '2026-10-27T11:00:00Z',
      },
    ];

    const mockComments: ReviewComment[] = [
      {
        id: 'c1',
        versionId: 'v1',
        requestId: 'req-1',
        authorId: 'demo-client-01',
        authorRole: 'client',
        authorName: 'Client Producer',
        timestampSeconds: 14,
        timestampDisplay: '00:14',
        content: 'Trim the intro transition by approximately 1 second.',
        resolved: false,
        createdAt: '2026-10-27T11:30:00Z',
      },
    ];

    it('renders active version, video stream player, and timecoded notes', () => {
      const handleAddComment = vi.fn();
      const handleResolve = vi.fn();
      const handleReply = vi.fn();
      const handleUpdateStatus = vi.fn();
      const handleSubmitVersion = vi.fn();

      render(
        <ProjectReviewWorkspace
          versions={mockVersions}
          activeVersion={mockVersions[0]}
          onSelectVersion={vi.fn()}
          comments={mockComments}
          onAddComment={handleAddComment}
          onResolveComment={handleResolve}
          onReplyComment={handleReply}
          onUpdateVersionStatus={handleUpdateStatus}
          onSubmitNewVersion={handleSubmitVersion}
          userRole="client"
        />
      );

      expect(screen.getByText(/Version 1 — Rough Assembly/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Client Review/i)).toBeInTheDocument();
      expect(screen.getByText(/Timecoded Review Feedback/i)).toBeInTheDocument();
      expect(screen.getByText(/\[00:14\]/i)).toBeInTheDocument();
      expect(screen.getByText(/Trim the intro transition by approximately 1 second./i)).toBeInTheDocument();
    });

    it('allows client to approve cut or request revisions', async () => {
      const handleUpdateStatus = vi.fn().mockResolvedValue({});

      render(
        <ProjectReviewWorkspace
          versions={mockVersions}
          activeVersion={mockVersions[0]}
          onSelectVersion={vi.fn()}
          comments={mockComments}
          onAddComment={vi.fn()}
          onResolveComment={vi.fn()}
          onReplyComment={vi.fn()}
          onUpdateVersionStatus={handleUpdateStatus}
          onSubmitNewVersion={vi.fn()}
          userRole="client"
        />
      );

      const approveBtn = screen.getByRole('button', { name: /Approve This Cut/i });
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(handleUpdateStatus).toHaveBeenCalledWith('v1', 'approved');
      });
    });

    it('validates timecode when submitting feedback comment', async () => {
      const handleAddComment = vi.fn();

      render(
        <ProjectReviewWorkspace
          versions={mockVersions}
          activeVersion={mockVersions[0]}
          onSelectVersion={vi.fn()}
          comments={mockComments}
          onAddComment={handleAddComment}
          onResolveComment={vi.fn()}
          onReplyComment={vi.fn()}
          onUpdateVersionStatus={vi.fn()}
          onSubmitNewVersion={vi.fn()}
          userRole="client"
        />
      );

      // Input invalid timecode
      const timeInput = screen.getByPlaceholderText('00:14');
      const commentInput = screen.getByPlaceholderText(/Leave creative note or revision/i);

      fireEvent.change(timeInput, { target: { value: 'invalid-timecode' } });
      fireEvent.change(commentInput, { target: { value: 'Need tighter pacing here' } });

      const postBtn = screen.getByRole('button', { name: /Post Note/i });
      fireEvent.click(postBtn);

      await waitFor(() => {
        expect(screen.getByText(/Invalid timecode. Format as MM:SS/i)).toBeInTheDocument();
      });

      expect(handleAddComment).not.toHaveBeenCalled();
    });

    it('successfully submits valid timecoded feedback note', async () => {
      const handleAddComment = vi.fn().mockResolvedValue({});

      render(
        <ProjectReviewWorkspace
          versions={mockVersions}
          activeVersion={mockVersions[0]}
          onSelectVersion={vi.fn()}
          comments={mockComments}
          onAddComment={handleAddComment}
          onResolveComment={vi.fn()}
          onReplyComment={vi.fn()}
          onUpdateVersionStatus={vi.fn()}
          onSubmitNewVersion={vi.fn()}
          userRole="client"
        />
      );

      const timeInput = screen.getByPlaceholderText('00:14');
      const commentInput = screen.getByPlaceholderText(/Leave creative note or revision/i);

      fireEvent.change(timeInput, { target: { value: '00:25' } });
      fireEvent.change(commentInput, { target: { value: 'Increase volume on sound riser effect' } });

      const postBtn = screen.getByRole('button', { name: /Post Note/i });
      fireEvent.click(postBtn);

      await waitFor(() => {
        expect(handleAddComment).toHaveBeenCalledWith('v1', {
          content: 'Increase volume on sound riser effect',
          timestampInput: '00:25',
        });
      });
    });
  });

  describe('ProjectWorkspaceView Lifecycle & Access Controls', () => {
    it('restricts workspace access if user is not a project participant', async () => {
      // Setup mock request owned by other participants
      const unauthRequest: ProjectRequest = {
        id: 'req-secret-999',
        clientId: 'stranger-user-id',
        editorId: 'another-user-id',
        title: 'Top Secret Feature Film',
        description: 'Classified commercial project.',
        requestQuote: false,
        referenceLinks: [],
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('pixel_media_requests_demo-client-01', JSON.stringify([unauthRequest]));

      render(
        <LanguageProvider>
          <AuthProvider>
            <ClientDataProvider>
              <MemoryRouter initialEntries={['/dashboard/workspace/req-secret-999']}>
                <Routes>
                  <Route path="/dashboard/workspace/:requestId" element={<ProjectWorkspaceView />} />
                </Routes>
              </MemoryRouter>
            </ClientDataProvider>
          </AuthProvider>
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
        expect(screen.getByText(/Only the client and the assigned lead creator have access/i)).toBeInTheDocument();
      });
    });

    it('displays proposal stage notice for pending briefs before active production', async () => {
      // Setup mock pending request where current user is client
      const pendingRequest: ProjectRequest = {
        id: 'req-pending-123',
        clientId: 'demo-client-01',
        editorId: 'demo-editor-01',
        title: 'Documentary Teaser Trailer',
        description: 'Need trailer edit for film festival submission.',
        requestQuote: false,
        referenceLinks: [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('pixel_media_requests_demo-client-01', JSON.stringify([pendingRequest]));

      render(
        <LanguageProvider>
          <AuthProvider>
            <ClientDataProvider>
              <MemoryRouter initialEntries={['/dashboard/workspace/req-pending-123']}>
                <Routes>
                  <Route path="/dashboard/workspace/:requestId" element={<ProjectWorkspaceView />} />
                </Routes>
              </MemoryRouter>
            </ClientDataProvider>
          </AuthProvider>
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Documentary Teaser Trailer/i)).toBeInTheDocument();
        expect(screen.getByText(/Project Brief Pending Creator Review/i)).toBeInTheDocument();
      });
    });
  });
});
