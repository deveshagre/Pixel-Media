// ============================================================
// Pixel Pedia — Marketplace Data Hooks
// Provides data access for categories, editors, portfolios, requests
// Works with both Supabase and local demo mode
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Category,
  EditorCard,
  UserProfile,
  PortfolioItem,
  ProjectRequest,
  RequestStatus,
  EditorSearchParams,
  Report,
} from '../types';
import { DEFAULT_CATEGORIES, flattenCategories } from '../data/categories';
import {
  DEMO_EDITORS,
  DEMO_PORTFOLIO_ITEMS,
  DEMO_EDITOR_SERVICES,
  DEMO_EDITOR_SOFTWARE,
} from '../data/demoEditors';

// ---- Categories ----
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

          if (data && data.length > 0) {
            const parents = data
              .filter((c: Record<string, unknown>) => !c.parent_id)
              .map((c: Record<string, unknown>) => ({
                id: c.id as string,
                name: c.name as string,
                slug: c.slug as string,
                description: c.description as string,
                iconName: c.icon_name as string,
                sortOrder: c.sort_order as number,
                isActive: true,
                children: data
                  .filter((ch: Record<string, unknown>) => ch.parent_id === c.id)
                  .map((ch: Record<string, unknown>) => ({
                    id: ch.id as string,
                    name: ch.name as string,
                    slug: ch.slug as string,
                    description: ch.description as string,
                    parentId: ch.parent_id as string,
                    sortOrder: ch.sort_order as number,
                    isActive: true,
                  })),
              }));
            setCategories(parents);
          }
        } catch {
          // fall back to defaults
        }
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { categories, flatCategories: flattenCategories(categories), loading };
}

// ---- Editor Discovery ----
export function useEditorDiscovery(params: EditorSearchParams) {
  const [editors, setEditors] = useState<EditorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetch() {
      setLoading(true);

      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase
            .from('profiles')
            .select('*, editor_services(category_id, categories(*)), editor_software(name)', { count: 'exact' })
            .eq('role', 'editor')
            .eq('is_published', true);

          if (params.experienceLevel) {
            query = query.eq('experience_level', params.experienceLevel);
          }
          if (params.availability) {
            query = query.eq('availability', params.availability);
          }
          if (params.minPrice !== undefined) {
            query = query.gte('starting_price', params.minPrice);
          }
          if (params.maxPrice !== undefined) {
            query = query.lte('starting_price', params.maxPrice);
          }
          if (params.query) {
            query = query.or(`full_name.ilike.%${params.query}%,headline.ilike.%${params.query}%,bio.ilike.%${params.query}%`);
          }

          // Sorting
          if (params.sortBy === 'price_low') {
            query = query.order('starting_price', { ascending: true, nullsFirst: false });
          } else if (params.sortBy === 'price_high') {
            query = query.order('starting_price', { ascending: false, nullsFirst: false });
          } else if (params.sortBy === 'newest') {
            query = query.order('created_at', { ascending: false });
          } else {
            query = query.order('created_at', { ascending: false });
          }

          const page = params.page || 1;
          const limit = params.limit || 12;
          const from = (page - 1) * limit;
          query = query.range(from, from + limit - 1);

          const { data, count } = await query;

          if (data) {
            const cards: EditorCard[] = await Promise.all(
              data.map(async (editor: Record<string, unknown>) => {
                // Get portfolio preview
                const { data: portfolio } = await supabase!
                  .from('portfolio_items')
                  .select('*')
                  .eq('editor_id', editor.id)
                  .eq('status', 'published')
                  .order('sort_order')
                  .limit(3);

                const editorServices = (editor.editor_services as Array<Record<string, unknown>>) || [];
                const editorSoftware = (editor.editor_software as Array<Record<string, unknown>>) || [];

                return {
                  id: editor.id as string,
                  fullName: editor.full_name as string,
                  headline: editor.headline as string,
                  avatarUrl: editor.avatar_url as string,
                  experienceLevel: editor.experience_level as EditorCard['experienceLevel'],
                  availability: editor.availability as EditorCard['availability'],
                  startingPrice: editor.starting_price as number,
                  contactForQuote: editor.contact_for_quote as boolean,
                  location: editor.location as string,
                  services: editorServices.map((s) => s.categories as Category).filter(Boolean),
                  software: editorSoftware.map((s) => s.name as string),
                  portfolioPreview: (portfolio || []).map(mapPortfolioRow),
                  portfolioCount: portfolio?.length || 0,
                };
              })
            );
            setEditors(cards);
            setTotal(count || 0);
          }
        } catch {
          // fallback
          setEditors(getLocalEditorCards(params));
          setTotal(DEMO_EDITORS.length);
        }
      } else {
        // Local mode
        setEditors(getLocalEditorCards(params));
        setTotal(DEMO_EDITORS.length);
      }

      setLoading(false);
    }
    fetch();
  }, [params.query, params.categorySlug, params.experienceLevel, params.availability, params.minPrice, params.maxPrice, params.sortBy, params.page, params.software]);

  return { editors, loading, total };
}

function getLocalEditorCards(params: EditorSearchParams): EditorCard[] {
  const allCats = flattenCategories(DEFAULT_CATEGORIES);
  let filtered = DEMO_EDITORS.filter((e) => e.isPublished);

  if (params.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.headline?.toLowerCase().includes(q) ||
        e.bio?.toLowerCase().includes(q) ||
        (DEMO_EDITOR_SOFTWARE[e.id] || []).some((s) => s.toLowerCase().includes(q))
    );
  }

  if (params.experienceLevel) {
    filtered = filtered.filter((e) => e.experienceLevel === params.experienceLevel);
  }
  if (params.availability) {
    filtered = filtered.filter((e) => e.availability === params.availability);
  }
  if (params.minPrice !== undefined) {
    filtered = filtered.filter((e) => (e.startingPrice || 0) >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((e) => (e.startingPrice || 0) <= params.maxPrice!);
  }
  if (params.categorySlug) {
    const cat = allCats.find((c) => c.slug === params.categorySlug);
    if (cat) {
      filtered = filtered.filter((e) => {
        const serviceIds = DEMO_EDITOR_SERVICES[e.id] || [];
        return serviceIds.includes(cat.id);
      });
    }
  }
  if (params.software) {
    const sw = params.software.toLowerCase();
    filtered = filtered.filter((e) =>
      (DEMO_EDITOR_SOFTWARE[e.id] || []).some((s) => s.toLowerCase().includes(sw))
    );
  }

  // Sort
  if (params.sortBy === 'price_low') {
    filtered.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
  } else if (params.sortBy === 'price_high') {
    filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
  }

  return filtered.map((editor) => {
    const serviceIds = DEMO_EDITOR_SERVICES[editor.id] || [];
    const services = serviceIds
      .map((sid) => allCats.find((c) => c.id === sid))
      .filter((c): c is Category => c != null);
    const portfolio = DEMO_PORTFOLIO_ITEMS.filter(
      (p) => p.editorId === editor.id && p.status === 'published'
    );

    return {
      id: editor.id,
      fullName: editor.fullName,
      headline: editor.headline,
      avatarUrl: editor.avatarUrl,
      experienceLevel: editor.experienceLevel,
      availability: editor.availability,
      startingPrice: editor.startingPrice,
      contactForQuote: editor.contactForQuote,
      location: editor.location,
      services,
      software: DEMO_EDITOR_SOFTWARE[editor.id] || [],
      portfolioPreview: portfolio.slice(0, 3),
      portfolioCount: portfolio.length,
    };
  });
}

// ---- Single Editor Profile ----
export function useEditorProfile(editorId: string | undefined) {
  const [editor, setEditor] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Category[]>([]);
  const [software, setSoftware] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editorId) return;

    async function fetch() {
      setLoading(true);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', editorId)
            .maybeSingle();

          if (profile) {
            setEditor({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              bio: profile.bio,
              headline: profile.headline,
              avatarUrl: profile.avatar_url,
              experienceLevel: profile.experience_level,
              availability: profile.availability,
              startingPrice: profile.starting_price,
              contactForQuote: profile.contact_for_quote,
              location: profile.location,
              websiteUrl: profile.website_url,
              isPublished: profile.is_published,
              onboardingCompleted: profile.onboarding_completed,
              preferredLanguage: profile.preferred_language || 'en',
              createdAt: profile.created_at,
            });

            const { data: svcData } = await supabase
              .from('editor_services')
              .select('categories(*)')
              .eq('editor_id', editorId);
            if (svcData) {
              setServices(
                svcData.map((s: Record<string, unknown>) => s.categories as Category).filter(Boolean)
              );
            }

            const { data: swData } = await supabase
              .from('editor_software')
              .select('name')
              .eq('editor_id', editorId);
            if (swData) {
              setSoftware(swData.map((s: { name: string }) => s.name));
            }

            const { data: portfolioData } = await supabase
              .from('portfolio_items')
              .select('*')
              .eq('editor_id', editorId)
              .eq('status', 'published')
              .order('sort_order');
            if (portfolioData) {
              setPortfolio(portfolioData.map(mapPortfolioRow));
            }
          }
        } catch {
          loadLocalEditor();
        }
      } else {
        loadLocalEditor();
      }

      function loadLocalEditor() {
        const ed = DEMO_EDITORS.find((e) => e.id === editorId);
        if (ed) {
          setEditor(ed);
          const allCats = flattenCategories(DEFAULT_CATEGORIES);
          const svcIds = DEMO_EDITOR_SERVICES[ed.id] || [];
          setServices(svcIds.map((sid) => allCats.find((c) => c.id === sid)).filter((c): c is Category => c != null));
          setSoftware(DEMO_EDITOR_SOFTWARE[ed.id] || []);
          setPortfolio(DEMO_PORTFOLIO_ITEMS.filter((p) => p.editorId === ed.id && p.status === 'published'));
        }
      }

      setLoading(false);
    }
    fetch();
  }, [editorId]);

  return { editor, services, software, portfolio, loading };
}

// ---- Portfolio Management (for logged-in editor) ----
export function usePortfolioManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('editor_id', user.id)
          .order('sort_order');
        if (data) setItems(data.map(mapPortfolioRow));
      } catch {
        loadLocal();
      }
    } else {
      loadLocal();
    }

    function loadLocal() {
      const key = `pixel_pedia_portfolio_${user!.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const saveItem = useCallback(
    async (item: Partial<PortfolioItem> & { id?: string }): Promise<PortfolioItem> => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const isNew = !item.id;
      const id = item.id || `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const record: PortfolioItem = {
        id,
        editorId: user.id,
        title: item.title || 'Untitled',
        description: item.description,
        categoryId: item.categoryId,
        thumbnailUrl: item.thumbnailUrl,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        externalLink: item.externalLink,
        softwareUsed: item.softwareUsed || [],
        editorRole: item.editorRole,
        projectDuration: item.projectDuration,
        status: item.status || 'draft',
        sortOrder: item.sortOrder || 0,
        createdAt: isNew ? now : (item.createdAt || now),
        updatedAt: now,
      };

      if (isSupabaseConfigured && supabase) {
        const dbRow = {
          id: record.id,
          editor_id: record.editorId,
          title: record.title,
          description: record.description,
          category_id: record.categoryId,
          thumbnail_url: record.thumbnailUrl,
          media_url: record.mediaUrl,
          media_type: record.mediaType,
          external_link: record.externalLink,
          software_used: record.softwareUsed,
          editor_role: record.editorRole,
          project_duration: record.projectDuration,
          status: record.status,
          sort_order: record.sortOrder,
        };

        if (isNew) {
          const { error } = await supabase.from('portfolio_items').insert(dbRow);
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase.from('portfolio_items').update(dbRow).eq('id', id);
          if (error) throw new Error(error.message);
        }
      }

      // Update local state
      setItems((prev) => {
        const updated = isNew ? [...prev, record] : prev.map((i) => (i.id === id ? record : i));
        if (!isSupabaseConfigured) {
          localStorage.setItem(`pixel_pedia_portfolio_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });

      return record;
    },
    [user]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
        if (error) throw new Error(error.message);
      }

      setItems((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        if (!isSupabaseConfigured) {
          localStorage.setItem(`pixel_pedia_portfolio_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });
    },
    [user]
  );

  return { items, loading, saveItem, deleteItem, refresh: fetchItems };
}

// ---- Project Requests ----
export function useProjectRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('project_requests')
          .select('*, client:profiles!project_requests_client_id_fkey(*), editor:profiles!project_requests_editor_id_fkey(*)')
          .or(`client_id.eq.${user.id},editor_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        if (data) {
          setRequests(data.map(mapRequestRow));
        }
      } catch {
        loadLocal();
      }
    } else {
      loadLocal();
    }

    function loadLocal() {
      const key = `pixel_pedia_requests_${user!.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setRequests(JSON.parse(saved));
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const submitRequest = useCallback(
    async (data: Omit<ProjectRequest, 'id' | 'clientId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ProjectRequest> => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const record: ProjectRequest = {
        id,
        clientId: user.id,
        editorId: data.editorId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        deliverables: data.deliverables,
        referenceLinks: data.referenceLinks || [],
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        requestQuote: data.requestQuote,
        deadline: data.deadline,
        additionalNotes: data.additionalNotes,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      if (isSupabaseConfigured && supabase) {
        const { data: inserted, error } = await supabase
          .from('project_requests')
          .insert({
            client_id: record.clientId,
            editor_id: record.editorId,
            title: record.title,
            description: record.description,
            category_id: record.categoryId,
            deliverables: record.deliverables,
            reference_links: record.referenceLinks,
            budget_min: record.budgetMin,
            budget_max: record.budgetMax,
            request_quote: record.requestQuote,
            deadline: record.deadline,
            additional_notes: record.additionalNotes,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        if (inserted) record.id = inserted.id;
      }

      setRequests((prev) => {
        const updated = [record, ...prev];
        if (!isSupabaseConfigured) {
          localStorage.setItem(`pixel_pedia_requests_${user.id}`, JSON.stringify(updated));
          // Also store for the editor
          const editorKey = `pixel_pedia_requests_${record.editorId}`;
          const editorRequests = JSON.parse(localStorage.getItem(editorKey) || '[]');
          editorRequests.unshift(record);
          localStorage.setItem(editorKey, JSON.stringify(editorRequests));
        }
        return updated;
      });

      return record;
    },
    [user]
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: RequestStatus) => {
      if (!user) throw new Error('Not authenticated');

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('project_requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', requestId);
        if (error) throw new Error(error.message);
      }

      setRequests((prev) => {
        const updated = prev.map((r) =>
          r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
        );
        if (!isSupabaseConfigured) {
          localStorage.setItem(`pixel_pedia_requests_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });
    },
    [user]
  );

  return { requests, loading, submitRequest, updateRequestStatus, refresh: fetchRequests };
}

// ---- Reports ----
export function useReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (data) {
          setReports(
            data.map((r: Record<string, unknown>) => ({
              id: r.id as string,
              reporterId: r.reporter_id as string,
              targetType: r.target_type as Report['targetType'],
              targetId: r.target_id as string,
              reason: r.reason as string,
              details: r.details as string,
              status: r.status as Report['status'],
              adminNotes: r.admin_notes as string,
              createdAt: r.created_at as string,
              resolvedAt: r.resolved_at as string,
            }))
          );
        }
      } catch {
        loadLocal();
      }
    } else {
      loadLocal();
    }

    function loadLocal() {
      const key = 'pixel_pedia_reports';
      const saved = localStorage.getItem(key);
      if (saved) {
        setReports(JSON.parse(saved));
      } else {
        // Sample default report for admin demo
        const demoReports: Report[] = [
          {
            id: 'rep-1',
            reporterId: 'client-1',
            targetType: 'portfolio_item',
            targetId: 'port-1',
            reason: 'Copyright infringement or stolen portfolio work',
            details: 'Commercial clip appears identical to an official 2024 Nike spot.',
            status: 'pending',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
        ];
        setReports(demoReports);
        localStorage.setItem(key, JSON.stringify(demoReports));
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const submitReport = useCallback(
    async (data: Omit<Report, 'id' | 'reporterId' | 'status' | 'createdAt'>): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      const newRecord: Report = {
        id: `report-${Date.now()}`,
        reporterId: user.id,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        details: data.details,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('reports').insert({
          reporter_id: user.id,
          target_type: data.targetType,
          target_id: data.targetId,
          reason: data.reason,
          details: data.details,
        });
        if (error) throw new Error(error.message);
      }

      setReports((prev) => {
        const updated = [newRecord, ...prev];
        localStorage.setItem('pixel_pedia_reports', JSON.stringify(updated));
        return updated;
      });
    },
    [user]
  );

  const updateReportStatus = useCallback(
    async (id: string, status: Report['status'], adminNotes?: string) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('reports')
          .update({ status, admin_notes: adminNotes, resolved_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw new Error(error.message);
      }

      setReports((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, status, adminNotes, resolvedAt: new Date().toISOString() } : r));
        localStorage.setItem('pixel_pedia_reports', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  return { reports, loading, submitReport, updateReportStatus, refresh: fetchReports };
}

// ---- Helpers ----
function mapPortfolioRow(row: Record<string, unknown>): PortfolioItem {
  return {
    id: row.id as string,
    editorId: (row.editor_id || row.editorId) as string,
    title: row.title as string,
    description: row.description as string,
    categoryId: (row.category_id || row.categoryId) as string,
    thumbnailUrl: (row.thumbnail_url || row.thumbnailUrl) as string,
    mediaUrl: (row.media_url || row.mediaUrl) as string,
    mediaType: (row.media_type || row.mediaType) as PortfolioItem['mediaType'],
    externalLink: (row.external_link || row.externalLink) as string,
    softwareUsed: (row.software_used || row.softwareUsed || []) as string[],
    editorRole: (row.editor_role || row.editorRole) as string,
    projectDuration: (row.project_duration || row.projectDuration) as string,
    status: row.status as PortfolioItem['status'],
    sortOrder: (row.sort_order || row.sortOrder || 0) as number,
    createdAt: (row.created_at || row.createdAt) as string,
    updatedAt: (row.updated_at || row.updatedAt) as string,
  };
}

function mapRequestRow(row: Record<string, unknown>): ProjectRequest {
  return {
    id: row.id as string,
    clientId: (row.client_id || row.clientId) as string,
    editorId: (row.editor_id || row.editorId) as string,
    title: row.title as string,
    description: row.description as string,
    categoryId: (row.category_id || row.categoryId) as string,
    deliverables: row.deliverables as string,
    referenceLinks: (row.reference_links || row.referenceLinks || []) as string[],
    budgetMin: (row.budget_min || row.budgetMin) as number,
    budgetMax: (row.budget_max || row.budgetMax) as number,
    requestQuote: (row.request_quote ?? row.requestQuote ?? false) as boolean,
    deadline: row.deadline as string,
    additionalNotes: (row.additional_notes || row.additionalNotes) as string,
    status: row.status as RequestStatus,
    createdAt: (row.created_at || row.createdAt) as string,
    updatedAt: (row.updated_at || row.updatedAt) as string,
    client: row.client as UserProfile,
    editor: row.editor as UserProfile,
  };
}
