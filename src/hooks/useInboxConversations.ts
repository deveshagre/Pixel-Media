import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjectRequests } from './useMarketplace';
import { ConversationPreview, ProjectMessage } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function loadLocalMessages(requestId: string): ProjectMessage[] {
  try {
    const raw = localStorage.getItem(`pixel_media_messages_${requestId}`) ||
                localStorage.getItem(`pixel_pedia_messages_${requestId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useInboxConversations() {
  const { user } = useAuth();
  const { requests, loading: requestsLoading, refresh: refreshRequests } = useProjectRequests();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const buildConversations = useCallback(async () => {
    if (!user || requests.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const previews: ConversationPreview[] = await Promise.all(
        requests.map(async (req) => {
          const isCurrentUserClient = req.clientId === user.id;
          const participantId = isCurrentUserClient ? req.editorId : req.clientId;
          const participantName = isCurrentUserClient 
            ? (req.editor?.fullName || 'Lead Creator') 
            : (req.client?.fullName || 'Client');
          const participantRole: 'client' | 'editor' = isCurrentUserClient ? 'editor' : 'client';
          const participantAvatarUrl = isCurrentUserClient ? req.editor?.avatarUrl : req.client?.avatarUrl;

          let messages: ProjectMessage[] = [];

          if (isSupabaseConfigured && supabase) {
            try {
              const { data, error } = await supabase
                .from('project_messages')
                .select('*')
                .eq('request_id', req.id)
                .order('created_at', { ascending: true });

              if (!error && data) {
                messages = data.map((m: any) => ({
                  id: m.id,
                  requestId: m.request_id,
                  senderId: m.sender_id,
                  senderRole: m.sender_role,
                  content: m.content,
                  readBy: m.read_by || [],
                  createdAt: m.created_at,
                }));
              } else {
                messages = loadLocalMessages(req.id);
              }
            } catch {
              messages = loadLocalMessages(req.id);
            }
          } else {
            messages = loadLocalMessages(req.id);
          }

          const lastMsg = messages.length > 0 ? messages[messages.length - 1] : undefined;
          const unreadCount = messages.filter(
            (m) => m.senderId !== user.id && !(m.readBy || []).includes(user.id)
          ).length;

          return {
            requestId: req.id,
            projectId: req.id,
            projectTitle: req.title,
            projectStatus: req.status,
            counterpartyId: participantId,
            counterpartyName: participantName,
            counterpartyRole: participantRole,
            counterpartyAvatarUrl: participantAvatarUrl,
            participantId,
            participantName,
            participantRole,
            participantAvatarUrl,
            lastMessage: lastMsg ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              senderId: lastMsg.senderId,
              senderName: lastMsg.senderName,
            } : undefined,
            unreadCount,
            updatedAt: lastMsg ? lastMsg.createdAt : req.updatedAt || req.createdAt,
          };
        })
      );

      // Sort with latest activity on top
      previews.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConversations(previews);
    } catch (err) {
      console.error('Failed to build conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, requests]);

  useEffect(() => {
    buildConversations();
  }, [buildConversations]);

  // Listen to incoming messages across all project requests
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || requests.length === 0) return;

    const channel = supabase
      .channel('inbox_global_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
        },
        () => {
          buildConversations();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [requests, buildConversations]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        c.projectTitle.toLowerCase().includes(q) ||
        c.participantName.toLowerCase().includes(q) ||
        (typeof c.lastMessage?.content === 'string' && c.lastMessage.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  }, [conversations]);

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    totalUnreadCount,
    loading: loading || requestsLoading,
    searchQuery,
    setSearchQuery,
    refresh: async () => {
      await refreshRequests();
      await buildConversations();
    },
  };
}
