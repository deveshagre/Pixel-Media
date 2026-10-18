import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Project, ServiceRequest, SupportTicket, ServiceCategory, TicketCategory, TicketPriority } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getInitialProjectsForUser, getInitialRequestsForUser, getInitialTicketsForUser } from '../data/initialData';

interface ClientDataContextType {
  projects: Project[];
  serviceRequests: ServiceRequest[];
  supportTickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createServiceRequest: (data: {
    serviceCategory: ServiceCategory;
    projectTitle: string;
    description: string;
    urgency: 'standard' | 'express' | 'rush';
    budgetRange?: string;
    assetsUrl?: string;
    targetFormat?: string;
  }) => Promise<ServiceRequest>;
  createSupportTicket: (data: {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
  }) => Promise<SupportTicket>;
  stats: {
    active: number;
    inReview: number;
    completed: number;
    openTickets: number;
  };
}

const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

export const ClientDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getStorageKey = useCallback(
    (key: string) => (user ? `pixel_${user.id}_${key}` : `pixel_guest_${key}`),
    [user]
  );

  const loadLocalData = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const savedProjects = localStorage.getItem(getStorageKey('projects'));
      const savedRequests = localStorage.getItem(getStorageKey('requests'));
      const savedTickets = localStorage.getItem(getStorageKey('tickets'));

      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        // Pre-seed demo data for new client
        const initial = getInitialProjectsForUser(user.id);
        setProjects(initial);
        localStorage.setItem(getStorageKey('projects'), JSON.stringify(initial));
      }

      if (savedRequests) {
        setServiceRequests(JSON.parse(savedRequests));
      } else {
        const initialReqs = getInitialRequestsForUser(user.id);
        setServiceRequests(initialReqs);
        localStorage.setItem(getStorageKey('requests'), JSON.stringify(initialReqs));
      }

      if (savedTickets) {
        setSupportTickets(JSON.parse(savedTickets));
      } else {
        const initialTix = getInitialTicketsForUser(user.id);
        setSupportTickets(initialTix);
        localStorage.setItem(getStorageKey('tickets'), JSON.stringify(initialTix));
      }
    } catch (e) {
      console.error('Error loading client data from local storage', e);
    } finally {
      setLoading(false);
    }
  }, [user, getStorageKey]);

  const loadData = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setServiceRequests([]);
      setSupportTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const [projRes, reqRes, ticketRes] = await Promise.all([
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        ]);

        if (projRes.error) throw projRes.error;
        if (reqRes.error) throw reqRes.error;
        if (ticketRes.error) throw ticketRes.error;

        // Map Supabase snake_case to camelCase
        const mappedProjects: Project[] = (projRes.data || []).map((p: any) => ({
          id: p.id,
          clientId: p.client_id,
          title: p.title,
          category: p.category,
          status: p.status,
          progress: p.progress || 0,
          deadline: p.deadline,
          description: p.description,
          deliverablesUrl: p.deliverables_url,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));

        const mappedRequests: ServiceRequest[] = (reqRes.data || []).map((r: any) => ({
          id: r.id,
          clientId: r.client_id,
          serviceCategory: r.service_category,
          projectTitle: r.project_title,
          description: r.description,
          urgency: r.urgency,
          budgetRange: r.budget_range,
          assetsUrl: r.assets_url,
          targetFormat: r.target_format,
          status: r.status,
          createdAt: r.created_at,
        }));

        const mappedTickets: SupportTicket[] = (ticketRes.data || []).map((t: any) => ({
          id: t.id,
          clientId: t.client_id,
          subject: t.subject,
          category: t.category,
          priority: t.priority,
          message: t.message,
          status: t.status,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));

        setProjects(mappedProjects);
        setServiceRequests(mappedRequests);
        setSupportTickets(mappedTickets);
      } catch (err: any) {
        console.warn('Supabase fetch failed, falling back to client storage:', err.message);
        loadLocalData();
      } finally {
        setLoading(false);
      }
    } else {
      loadLocalData();
    }
  }, [user, loadLocalData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createServiceRequest = async (data: {
    serviceCategory: ServiceCategory;
    projectTitle: string;
    description: string;
    urgency: 'standard' | 'express' | 'rush';
    budgetRange?: string;
    assetsUrl?: string;
    targetFormat?: string;
  }): Promise<ServiceRequest> => {
    if (!user) throw new Error('Client must be authenticated');

    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      clientId: user.id,
      serviceCategory: data.serviceCategory,
      projectTitle: data.projectTitle,
      description: data.description,
      urgency: data.urgency,
      budgetRange: data.budgetRange,
      assetsUrl: data.assetsUrl,
      targetFormat: data.targetFormat,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error: sbError } = await supabase
          .from('service_requests')
          .insert({
            client_id: user.id,
            service_category: data.serviceCategory,
            project_title: data.projectTitle,
            description: data.description,
            urgency: data.urgency,
            budget_range: data.budgetRange,
            assets_url: data.assetsUrl,
            target_format: data.targetFormat,
            status: 'pending',
          })
          .select()
          .single();

        if (sbError) throw sbError;
        if (inserted) {
          newRequest.id = inserted.id;
        }
      } catch (err: any) {
        console.warn('Could not save to Supabase, persisting locally:', err.message);
      }
    }

    // Also create a linked project pipeline card so the client immediately sees it on their dashboard
    const linkedProject: Project = {
      id: `proj-${Date.now()}`,
      clientId: user.id,
      title: data.projectTitle,
      category: data.serviceCategory,
      status: 'requested',
      progress: 5,
      deadline:
        data.urgency === 'rush'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : data.urgency === 'express'
            ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: data.description,
      deliverablesUrl: data.assetsUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setServiceRequests((prev) => {
      const updated = [newRequest, ...prev];
      try {
        localStorage.setItem(getStorageKey('requests'), JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setProjects((prev) => {
      const updated = [linkedProject, ...prev];
      try {
        localStorage.setItem(getStorageKey('projects'), JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return newRequest;
  };

  const createSupportTicket = async (data: {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
  }): Promise<SupportTicket> => {
    if (!user) throw new Error('Client must be authenticated');

    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      clientId: user.id,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      message: data.message,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error: sbError } = await supabase
          .from('support_tickets')
          .insert({
            client_id: user.id,
            subject: data.subject,
            category: data.category,
            priority: data.priority,
            message: data.message,
            status: 'open',
          })
          .select()
          .single();

        if (sbError) throw sbError;
        if (inserted) {
          newTicket.id = inserted.id;
        }
      } catch (err: any) {
        console.warn('Could not save ticket to Supabase, saving locally:', err.message);
      }
    }

    setSupportTickets((prev) => {
      const updated = [newTicket, ...prev];
      try {
        localStorage.setItem(getStorageKey('tickets'), JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return newTicket;
  };

  const stats = {
    active: projects.filter((p) => p.status === 'in_progress').length,
    inReview: projects.filter((p) => p.status === 'in_review').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    openTickets: supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
  };

  return (
    <ClientDataContext.Provider
      value={{
        projects,
        serviceRequests,
        supportTickets,
        loading,
        error,
        refreshData: loadData,
        createServiceRequest,
        createSupportTicket,
        stats,
      }}
    >
      {children}
    </ClientDataContext.Provider>
  );
};

export const useClientData = (): ClientDataContextType => {
  const context = useContext(ClientDataContext);
  if (!context) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  return context;
};
