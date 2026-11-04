// ============================================================
// Pixel Media — Creative Collaboration & Review Workspace Hook
// Provides data access, messaging, and timecoded video review.
// Works with both Supabase and local demo mode.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  ProjectRequest,
  ProjectMessage,
  ReviewVersion,
  ReviewComment,
  ReviewVersionStatus,
} from '../types';

// --- Timecode Parsing & Validation Utilities ---

/**
 * Validates and normalizes timestamp strings into seconds and display string.
 * Supports formats: "SS", "M:SS", "MM:SS", "H:MM:SS", "HH:MM:SS"
 */
export function parseTimestamp(input?: string): { seconds: number; display: string } | null {
  if (!input || !input.trim()) return null;
  const clean = input.trim();

  // Pattern: optional (HH:)MM:SS or SS
  const match = clean.match(/^(?:(?:(\d{1,2}):)?([0-5]?\d):)?([0-5]?\d)$/);
  if (!match) return null;

  const hoursStr = match[1];
  const minutesStr = match[2];
  const secondsStr = match[3];

  let totalSeconds = 0;
  let formatted = '';

  if (hoursStr !== undefined && minutesStr !== undefined) {
    const h = parseInt(hoursStr, 10);
    const m = parseInt(minutesStr, 10);
    const s = parseInt(secondsStr, 10);
    totalSeconds = h * 3600 + m * 60 + s;
    formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else if (minutesStr !== undefined) {
    const m = parseInt(minutesStr, 10);
    const s = parseInt(secondsStr, 10);
    totalSeconds = m * 60 + s;
    formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    const s = parseInt(secondsStr, 10);
    totalSeconds = s;
    const m = Math.floor(s / 60);
    const remainderS = s % 60;
    formatted = `${m.toString().padStart(2, '0')}:${remainderS.toString().padStart(2, '0')}`;
  }

  return { seconds: totalSeconds, display: formatted };
}

export function isValidTimestamp(input: string): boolean {
  return parseTimestamp(input) !== null;
}

// --- Safe Video Preview / Embed Detector ---

export interface VideoEmbedInfo {
  platform: 'youtube' | 'vimeo' | 'direct' | 'cloud';
  embedUrl: string | null;
  directUrl: string;
  label: string;
  isEmbeddable: boolean;
}

export function getVideoEmbedInfo(rawUrl: string): VideoEmbedInfo {
  const url = (rawUrl || '').trim();

  // YouTube detection
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      directUrl: url,
      label: 'YouTube Embed',
      isEmbeddable: true,
    };
  }

  // Vimeo detection
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i);
  const vimeoId = vimeoMatch ? (vimeoMatch[3] || vimeoMatch[4]) : null;
  if (vimeoId) {
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?dnt=1`,
      directUrl: url,
      label: 'Vimeo Player',
      isEmbeddable: true,
    };
  }

  // Direct video file (.mp4, .webm)
  if (/\.(mp4|webm|mov)($|\?)/i.test(url)) {
    return {
      platform: 'direct',
      embedUrl: url,
      directUrl: url,
      label: 'Direct Video Stream',
      isEmbeddable: true,
    };
  }

  // Cloud providers (Frame.io, Google Drive, Dropbox, Box, WeTransfer, OneDrive)
  let cloudLabel = 'Cloud Video Review';
  if (/frame\.io/i.test(url)) cloudLabel = 'Frame.io Review Workspace';
  else if (/drive\.google\.com/i.test(url)) cloudLabel = 'Google Drive Master';
  else if (/dropbox\.com/i.test(url)) cloudLabel = 'Dropbox Transfer';
  else if (/wetransfer\.com/i.test(url)) cloudLabel = 'WeTransfer Package';
  else if (/box\.com/i.test(url)) cloudLabel = 'Box Cloud Vault';

  return {
    platform: 'cloud',
    embedUrl: null,
    directUrl: url,
    label: cloudLabel,
    isEmbeddable: false,
  };
}

// --- Local Storage Helpers ---

function getStorageMessagesKey(requestId: string): string {
  return `pixel_media_messages_${requestId}`;
}

function getStorageReviewsKey(requestId: string): string {
  return `pixel_media_reviews_${requestId}`;
}

function getStorageCommentsKey(versionId: string): string {
  return `pixel_media_comments_${versionId}`;
}

function loadLocalList<T>(key: string, legacyKey?: string): T[] {
  try {
    const raw = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalList<T>(key: string, list: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// --- Collaboration Workspace Hook ---

export function useProjectCollaboration(requestId: string | undefined) {
  const { user } = useAuth();

  const [request, setRequest] = useState<ProjectRequest | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [reviewVersions, setReviewVersions] = useState<ReviewVersion[]>([]);
  const [commentsByVersion, setCommentsByVersion] = useState<Record<string, ReviewComment[]>>({});
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current authenticated user is a participant
  const isParticipant = useMemo(() => {
    if (!user || !request) return false;
    return user.id === request.clientId || user.id === request.editorId;
  }, [user, request]);

  const userRoleOnProject = useMemo<'client' | 'editor' | null>(() => {
    if (!user || !request) return null;
    if (user.id === request.clientId) return 'client';
    if (user.id === request.editorId) return 'editor';
    return null;
  }, [user, request]);

  // Fetch project request metadata
  const fetchRequest = useCallback(async () => {
    if (!requestId || !user) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: reqErr } = await supabase
          .from('project_requests')
          .select('*, client:profiles!project_requests_client_id_fkey(*), editor:profiles!project_requests_editor_id_fkey(*)')
          .eq('id', requestId)
          .maybeSingle();

        if (reqErr) throw reqErr;
        if (data) {
          setRequest({
            id: data.id,
            clientId: data.client_id,
            editorId: data.editor_id,
            title: data.title,
            description: data.description,
            categoryId: data.category_id,
            deliverables: data.deliverables,
            referenceLinks: data.reference_links || [],
            budgetMin: data.budget_min,
            budgetMax: data.budget_max,
            requestQuote: data.request_quote,
            deadline: data.deadline,
            additionalNotes: data.additional_notes,
            status: data.status,
            proposal: data.proposal,
            finalDeliverablesUrl: data.final_deliverables_url,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            client: data.client,
            editor: data.editor,
          });
          return;
        }
      } catch {
        // Fall back to local
      }
    }

    // Local Mode: Find from current user requests
    const userKey = `pixel_media_requests_${user.id}`;
    const legacyKey = `pixel_pedia_requests_${user.id}`;
    const raw = localStorage.getItem(userKey) || localStorage.getItem(legacyKey);
    const list: ProjectRequest[] = raw ? JSON.parse(raw) : [];
    const found = list.find((r) => r.id === requestId);
    if (found) {
      setRequest(found);
    } else {
      // Check if found in any stored request
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('pixel_media_requests_') || k.startsWith('pixel_pedia_requests_'))) {
          try {
            const arr: ProjectRequest[] = JSON.parse(localStorage.getItem(k) || '[]');
            const candidate = arr.find((r) => r.id === requestId);
            if (candidate) {
              setRequest(candidate);
              break;
            }
          } catch {
            // ignore
          }
        }
      }
    }
  }, [requestId, user]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!requestId) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: msgErr } = await supabase
          .from('project_messages')
          .select('*, sender:profiles!project_messages_sender_id_fkey(full_name, avatar_url)')
          .eq('request_id', requestId)
          .order('created_at', { ascending: true });

        if (msgErr) throw msgErr;
        if (data) {
          setMessages(
            data.map((m: Record<string, unknown>) => {
              const sender = m.sender as Record<string, unknown> | undefined;
              return {
                id: m.id as string,
                requestId: m.request_id as string,
                senderId: m.sender_id as string,
                senderRole: m.sender_role as 'client' | 'editor',
                content: m.content as string,
                readBy: (m.read_by as string[]) || [],
                senderName: (sender?.full_name as string) || undefined,
                senderAvatarUrl: (sender?.avatar_url as string) || undefined,
                createdAt: m.created_at as string,
              };
            })
          );
          return;
        }
      } catch {
        // Fall back to local
      }
    }

    // Local Mode
    const localMsgs = loadLocalList<ProjectMessage>(
      getStorageMessagesKey(requestId),
      `pixel_pedia_messages_${requestId}`
    );
    setMessages(localMsgs);
  }, [requestId]);

  // Fetch review versions and comments
  const fetchReviewVersions = useCallback(async () => {
    if (!requestId) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: vData, error: vErr } = await supabase
          .from('project_review_versions')
          .select('*, submitter:profiles!project_review_versions_submitted_by_fkey(full_name)')
          .eq('request_id', requestId)
          .order('version_number', { ascending: false });

        if (vErr) throw vErr;
        if (vData) {
          const versions: ReviewVersion[] = vData.map((v: Record<string, unknown>) => {
            const submitter = v.submitter as Record<string, unknown> | undefined;
            return {
              id: v.id as string,
              requestId: v.request_id as string,
              versionNumber: v.version_number as number,
              title: v.title as string,
              videoUrl: v.video_url as string,
              notes: v.notes as string | undefined,
              submittedBy: v.submitted_by as string,
              submittedByName: (submitter?.full_name as string) || undefined,
              status: v.status as ReviewVersionStatus,
              createdAt: v.created_at as string,
              updatedAt: v.updated_at as string,
            };
          });

          setReviewVersions(versions);
          if (versions.length > 0 && !activeVersionId) {
            setActiveVersionId(versions[0].id);
          }

          // Fetch all comments for these versions
          if (versions.length > 0) {
            const versionIds = versions.map((v) => v.id);
            const { data: cData } = await supabase
              .from('project_review_comments')
              .select('*, author:profiles!project_review_comments_author_id_fkey(full_name, avatar_url)')
              .in('version_id', versionIds)
              .order('timestamp_seconds', { ascending: true, nullsFirst: false });

            if (cData) {
              const grouped: Record<string, ReviewComment[]> = {};
              cData.forEach((c: Record<string, unknown>) => {
                const vId = c.version_id as string;
                if (!grouped[vId]) grouped[vId] = [];
                const author = c.author as Record<string, unknown> | undefined;
                grouped[vId].push({
                  id: c.id as string,
                  versionId: vId,
                  requestId: c.request_id as string,
                  authorId: c.author_id as string,
                  authorRole: c.author_role as 'client' | 'editor',
                  authorName: (author?.full_name as string) || undefined,
                  authorAvatarUrl: (author?.avatar_url as string) || undefined,
                  timestampSeconds: c.timestamp_seconds as number | undefined,
                  timestampDisplay: c.timestamp_display as string | undefined,
                  content: c.content as string,
                  resolved: c.resolved as boolean,
                  resolvedAt: c.resolved_at as string | undefined,
                  resolvedBy: c.resolved_by as string | undefined,
                  replyContent: c.reply_content as string | undefined,
                  repliedAt: c.replied_at as string | undefined,
                  repliedBy: c.replied_by as string | undefined,
                  createdAt: c.created_at as string,
                  updatedAt: c.updated_at as string,
                });
              });
              setCommentsByVersion(grouped);
            }
          }
          return;
        }
      } catch {
        // Fall back to local
      }
    }

    // Local Mode
    const localVersions = loadLocalList<ReviewVersion>(
      getStorageReviewsKey(requestId),
      `pixel_pedia_reviews_${requestId}`
    );
    // Sort versions descending
    localVersions.sort((a, b) => b.versionNumber - a.versionNumber);
    setReviewVersions(localVersions);
    if (localVersions.length > 0 && !activeVersionId) {
      setActiveVersionId(localVersions[0].id);
    }

    // Load comments for each version
    const localGrouped: Record<string, ReviewComment[]> = {};
    localVersions.forEach((v) => {
      const vComments = loadLocalList<ReviewComment>(getStorageCommentsKey(v.id));
      vComments.sort((a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0));
      localGrouped[v.id] = vComments;
    });
    setCommentsByVersion(localGrouped);
  }, [requestId, activeVersionId]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        await fetchRequest();
        await fetchMessages();
        await fetchReviewVersions();
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load project workspace');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchRequest, fetchMessages, fetchReviewVersions]);

  // --- Actions ---

  /**
   * Send a new message in this project's conversation.
   */
  const sendMessage = useCallback(
    async (content: string): Promise<ProjectMessage> => {
      if (!user) throw new Error('Not authenticated');
      if (!request) throw new Error('Project request not found');

      // Authorization Check
      if (user.id !== request.clientId && user.id !== request.editorId) {
        throw new Error('Unauthorized: You are not a participant in this project.');
      }

      const trimmed = content.trim();
      if (!trimmed) throw new Error('Message content cannot be empty.');
      if (trimmed.length > 3000) throw new Error('Message exceeds the maximum limit of 3,000 characters.');

      const senderRole: 'client' | 'editor' = user.id === request.clientId ? 'client' : 'editor';
      const now = new Date().toISOString();
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const newMsg: ProjectMessage = {
        id: messageId,
        requestId: request.id,
        senderId: user.id,
        senderRole,
        senderName: user.fullName || (senderRole === 'client' ? 'Client' : 'Lead Creator'),
        senderAvatarUrl: user.avatarUrl,
        content: trimmed,
        readBy: [user.id],
        createdAt: now,
      };

      // Optimistic update
      setMessages((prev) => [...prev, newMsg]);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: insData, error: insErr } = await supabase
            .from('project_messages')
            .insert({
              request_id: request.id,
              sender_id: user.id,
              sender_role: senderRole,
              content: trimmed,
              read_by: [user.id],
            })
            .select()
            .single();

          if (insErr) throw insErr;
          if (insData) {
            newMsg.id = insData.id;
          }
        } catch (err: unknown) {
          // Rollback on failure
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
          throw err;
        }
      }

      // Persist in local storage
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === messageId ? newMsg : m));
        saveLocalList(getStorageMessagesKey(request.id), updated);
        return updated;
      });

      return newMsg;
    },
    [user, request]
  );

  // Supabase Realtime subscription for incoming messages
  useEffect(() => {
    if (!requestId || !isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel(`project_messages_${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const m = payload.new as Record<string, unknown>;
          setMessages((prev) => {
            if (prev.some((existing) => existing.id === m.id)) return prev;
            const liveMsg: ProjectMessage = {
              id: m.id as string,
              requestId: m.request_id as string,
              senderId: m.sender_id as string,
              senderRole: m.sender_role as 'client' | 'editor',
              content: m.content as string,
              readBy: (m.read_by as string[]) || [],
              createdAt: m.created_at as string,
            };
            return [...prev, liveMsg];
          });
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [requestId]);

  /**
   * Mark all unread messages as read by current user.
   */
  const markMessagesAsRead = useCallback(async () => {
    if (!user || !request || messages.length === 0) return;

    const unread = messages.filter((m) => !(m.readBy || []).includes(user.id));
    if (unread.length === 0) return;

    const updated = messages.map((m) => {
      if (!(m.readBy || []).includes(user.id)) {
        return { ...m, readBy: [...(m.readBy || []), user.id] };
      }
      return m;
    });

    setMessages(updated);
    saveLocalList(getStorageMessagesKey(request.id), updated);

    if (isSupabaseConfigured && supabase) {
      // In Supabase, record read receipt
      try {
        await supabase
          .from('project_messages')
          .update({ read_by: [user.id] })
          .eq('request_id', request.id);
      } catch {
        // non-blocking
      }
    }
  }, [user, request, messages]);

  /**
   * Submit a new review version cut (Rough Cut, Fine Cut, Final Master).
   */
  const submitReviewVersion = useCallback(
    async (data: { title: string; videoUrl: string; notes?: string }): Promise<ReviewVersion> => {
      if (!user) throw new Error('Not authenticated');
      if (!request) throw new Error('Project request not found');

      // Authorization Check
      if (user.id !== request.clientId && user.id !== request.editorId) {
        throw new Error('Unauthorized: You are not a participant in this project.');
      }

      const trimmedTitle = data.title.trim();
      const trimmedUrl = data.videoUrl.trim();
      if (!trimmedTitle) throw new Error('Please enter a descriptive version title.');
      if (!trimmedUrl) throw new Error('Please enter a valid review video or cloud storage URL.');

      const now = new Date().toISOString();
      const versionNumber = reviewVersions.length + 1;
      const versionId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const newVersion: ReviewVersion = {
        id: versionId,
        requestId: request.id,
        versionNumber,
        title: trimmedTitle,
        videoUrl: trimmedUrl,
        notes: data.notes?.trim() || undefined,
        submittedBy: user.id,
        submittedByName: user.fullName || 'Lead Creator',
        status: 'pending_review',
        createdAt: now,
        updatedAt: now,
      };

      if (isSupabaseConfigured && supabase) {
        const { data: ins, error: insErr } = await supabase
          .from('project_review_versions')
          .insert({
            request_id: request.id,
            version_number: versionNumber,
            title: trimmedTitle,
            video_url: trimmedUrl,
            notes: data.notes?.trim() || null,
            submitted_by: user.id,
            status: 'pending_review',
          })
          .select()
          .single();
        if (insErr) throw new Error(insErr.message);
        if (ins) newVersion.id = ins.id;
      }

      setReviewVersions((prev) => {
        const updated = [newVersion, ...prev];
        saveLocalList(getStorageReviewsKey(request.id), updated);
        return updated;
      });

      setActiveVersionId(newVersion.id);
      return newVersion;
    },
    [user, request, reviewVersions.length]
  );

  /**
   * Update the review status of a version (Client approves or requests changes).
   */
  const updateReviewVersionStatus = useCallback(
    async (versionId: string, status: ReviewVersionStatus): Promise<void> => {
      if (!user || !request) throw new Error('Not authenticated or project missing');

      if (user.id !== request.clientId && user.id !== request.editorId) {
        throw new Error('Unauthorized: You are not a participant in this project.');
      }

      const now = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        const { error: updErr } = await supabase
          .from('project_review_versions')
          .update({ status, updated_at: now })
          .eq('id', versionId);
        if (updErr) throw new Error(updErr.message);
      }

      setReviewVersions((prev) => {
        const updated = prev.map((v) => (v.id === versionId ? { ...v, status, updatedAt: now } : v));
        saveLocalList(getStorageReviewsKey(request.id), updated);
        return updated;
      });
    },
    [user, request]
  );

  /**
   * Add a timestamped review comment to an active cut version.
   */
  const addReviewComment = useCallback(
    async (
      versionId: string,
      data: { content: string; timestampInput?: string }
    ): Promise<ReviewComment> => {
      if (!user) throw new Error('Not authenticated');
      if (!request) throw new Error('Project request not found');

      if (user.id !== request.clientId && user.id !== request.editorId) {
        throw new Error('Unauthorized: You are not a participant in this project.');
      }

      const trimmedContent = data.content.trim();
      if (!trimmedContent) throw new Error('Comment content cannot be empty.');
      if (trimmedContent.length > 2000) throw new Error('Comment exceeds 2,000 characters limit.');

      let timestampSeconds: number | undefined;
      let timestampDisplay: string | undefined;

      if (data.timestampInput && data.timestampInput.trim()) {
        const parsed = parseTimestamp(data.timestampInput);
        if (!parsed) {
          throw new Error('Invalid timecode. Please format as MM:SS (e.g. 00:14) or HH:MM:SS (e.g. 01:20:00).');
        }
        timestampSeconds = parsed.seconds;
        timestampDisplay = parsed.display;
      }

      const authorRole: 'client' | 'editor' = user.id === request.clientId ? 'client' : 'editor';
      const now = new Date().toISOString();
      const commentId = `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const newComment: ReviewComment = {
        id: commentId,
        versionId,
        requestId: request.id,
        authorId: user.id,
        authorRole,
        authorName: user.fullName || (authorRole === 'client' ? 'Client' : 'Lead Creator'),
        authorAvatarUrl: user.avatarUrl,
        timestampSeconds,
        timestampDisplay,
        content: trimmedContent,
        resolved: false,
        createdAt: now,
        updatedAt: now,
      };

      if (isSupabaseConfigured && supabase) {
        const { data: ins, error: insErr } = await supabase
          .from('project_review_comments')
          .insert({
            version_id: versionId,
            request_id: request.id,
            author_id: user.id,
            author_role: authorRole,
            timestamp_seconds: timestampSeconds || null,
            timestamp_display: timestampDisplay || null,
            content: trimmedContent,
            resolved: false,
          })
          .select()
          .single();
        if (insErr) throw new Error(insErr.message);
        if (ins) newComment.id = ins.id;
      }

      setCommentsByVersion((prev) => {
        const currentList = prev[versionId] || [];
        const updated = [...currentList, newComment];
        // Sort chronologically by timestamp
        updated.sort((a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0));
        saveLocalList(getStorageCommentsKey(versionId), updated);
        return { ...prev, [versionId]: updated };
      });

      return newComment;
    },
    [user, request]
  );

  /**
   * Mark a review comment as resolved.
   */
  const resolveReviewComment = useCallback(
    async (commentId: string, versionId: string): Promise<void> => {
      if (!user || !request) throw new Error('Not authenticated');

      if (user.id !== request.clientId && user.id !== request.editorId) {
        throw new Error('Unauthorized');
      }

      const now = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        const { error: updErr } = await supabase
          .from('project_review_comments')
          .update({
            resolved: true,
            resolved_at: now,
            resolved_by: user.id,
            updated_at: now,
          })
          .eq('id', commentId);
        if (updErr) throw new Error(updErr.message);
      }

      setCommentsByVersion((prev) => {
        const currentList = prev[versionId] || [];
        const updated = currentList.map((c) =>
          c.id === commentId ? { ...c, resolved: true, resolvedAt: now, resolvedBy: user.id } : c
        );
        saveLocalList(getStorageCommentsKey(versionId), updated);
        return { ...prev, [versionId]: updated };
      });
    },
    [user, request]
  );

  /**
   * Post a reply to an existing review comment.
   */
  const replyToReviewComment = useCallback(
    async (commentId: string, versionId: string, replyContent: string): Promise<void> => {
      if (!user || !request) throw new Error('Not authenticated');

      if (user.id !== request.clientId && user.id !== request.editorId) {
        throw new Error('Unauthorized');
      }

      const trimmed = replyContent.trim();
      if (!trimmed) throw new Error('Reply cannot be empty.');

      const now = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        const { error: updErr } = await supabase
          .from('project_review_comments')
          .update({
            reply_content: trimmed,
            replied_at: now,
            replied_by: user.id,
            updated_at: now,
          })
          .eq('id', commentId);
        if (updErr) throw new Error(updErr.message);
      }

      setCommentsByVersion((prev) => {
        const currentList = prev[versionId] || [];
        const updated = currentList.map((c) =>
          c.id === commentId
            ? { ...c, replyContent: trimmed, repliedAt: now, repliedBy: user.id, updatedAt: now }
            : c
        );
        saveLocalList(getStorageCommentsKey(versionId), updated);
        return { ...prev, [versionId]: updated };
      });
    },
    [user, request]
  );

  // Computed unread messages count for current user
  const unreadMessagesCount = useMemo(() => {
    if (!user) return 0;
    return messages.filter((m) => !(m.readBy || []).includes(user.id)).length;
  }, [messages, user]);

  // Active version object and its comments
  const activeVersion = useMemo(() => {
    if (!activeVersionId) return reviewVersions[0] || null;
    return reviewVersions.find((v) => v.id === activeVersionId) || reviewVersions[0] || null;
  }, [reviewVersions, activeVersionId]);

  const activeVersionComments = useMemo(() => {
    if (!activeVersion) return [];
    return commentsByVersion[activeVersion.id] || [];
  }, [commentsByVersion, activeVersion]);

  const unresolvedCommentsCount = useMemo(() => {
    return activeVersionComments.filter((c) => !c.resolved).length;
  }, [activeVersionComments]);

  return {
    request,
    isParticipant,
    userRoleOnProject,
    loading,
    error,
    messages,
    unreadMessagesCount,
    sendMessage,
    markMessagesAsRead,
    reviewVersions,
    activeVersion,
    activeVersionId,
    setActiveVersionId,
    submitReviewVersion,
    updateReviewVersionStatus,
    activeVersionComments,
    unresolvedCommentsCount,
    addReviewComment,
    resolveReviewComment,
    replyToReviewComment,
    refresh: useCallback(async () => {
      await fetchRequest();
      await fetchMessages();
      await fetchReviewVersions();
    }, [fetchRequest, fetchMessages, fetchReviewVersions]),
  };
}
