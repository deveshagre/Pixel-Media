import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, SupportedLanguage, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole,
    company?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'pixel_pedia_auth_user';

function mapProfileRow(row: Record<string, unknown>, fallback?: Partial<UserProfile>): UserProfile {
  return {
    id: (row.id as string) || fallback?.id || '',
    email: (row.email as string) || fallback?.email || '',
    fullName: (row.full_name as string) || fallback?.fullName || '',
    company: (row.company as string) || fallback?.company || '',
    avatarUrl: (row.avatar_url as string) || fallback?.avatarUrl,
    preferredLanguage: ((row.preferred_language as SupportedLanguage) || fallback?.preferredLanguage || 'en'),
    createdAt: (row.created_at as string) || fallback?.createdAt || new Date().toISOString(),
    role: ((row.role as UserRole) || fallback?.role || 'client'),
    bio: (row.bio as string) || fallback?.bio,
    headline: (row.headline as string) || fallback?.headline,
    experienceLevel: (row.experience_level as UserProfile['experienceLevel']) || fallback?.experienceLevel,
    availability: (row.availability as UserProfile['availability']) || fallback?.availability || 'available',
    startingPrice: (row.starting_price as number) || fallback?.startingPrice,
    contactForQuote: (row.contact_for_quote as boolean) ?? fallback?.contactForQuote ?? false,
    location: (row.location as string) || fallback?.location,
    websiteUrl: (row.website_url as string) || fallback?.websiteUrl,
    isPublished: (row.is_published as boolean) ?? fallback?.isPublished ?? false,
    onboardingCompleted: (row.onboarding_completed as boolean) ?? fallback?.onboardingCompleted ?? false,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (session?.user && mounted) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              setUser(mapProfileRow(profile, {
                id: session.user.id,
                email: session.user.email || '',
                fullName: session.user.user_metadata?.full_name,
              }));
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: (session.user.user_metadata?.role as UserRole) || 'client',
                preferredLanguage: 'en',
                createdAt: session.user.created_at,
              });
            }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Auth error';
          console.warn('Supabase auth session error:', message);
        }
      } else {
        // Local mode session restore
        try {
          const cached = localStorage.getItem(LOCAL_USER_KEY);
          if (cached && mounted) {
            setUser(JSON.parse(cached));
          } else if (mounted) {
            const demoUser: UserProfile = {
              id: 'demo-client-01',
              email: 'producer@pixelmedia.studio',
              fullName: 'Alex Vance',
              company: 'Apex Horizon Studios',
              role: 'client',
              preferredLanguage: 'en',
              createdAt: new Date().toISOString(),
            };
            setUser(demoUser);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
          }
        } catch {
          // ignore
        }
      }

      if (mounted) setLoading(false);
    };

    initAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data } = client.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (_event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUser(mapProfileRow(profile, {
              id: session.user.id,
              email: session.user.email || '',
            }));
          }
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return { success: false, error: error.message };

          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profile) {
              setUser(mapProfileRow(profile, { id: data.user.id, email }));
            }
            return { success: true };
          }
          return { success: false, error: 'Authentication failed.' };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Auth error';
          return { success: false, error: message };
        }
      }

      // Local persistent auth
      const normalizedEmail = email.trim().toLowerCase();
      const clientHash = btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      const localUser: UserProfile = {
        id: `user-${clientHash || Date.now()}`,
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0].replace('.', ' ').replace(/^./, (s) => s.toUpperCase()),
        role: 'client',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      // Check if there's an existing user with this email
      const existingKey = `pixel_pedia_user_${normalizedEmail}`;
      const existing = localStorage.getItem(existingKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        setUser(parsed);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
      } else {
        setUser(localUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
        localStorage.setItem(existingKey, JSON.stringify(localUser));
      }
      return { success: true };
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: UserRole = 'client',
      company?: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email.' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      if (!fullName || fullName.trim().length < 2) {
        return { success: false, error: 'Please provide your full name.' };
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                role,
                company: company?.trim() || '',
              },
            },
          });
          if (error) return { success: false, error: error.message };

          if (data.user) {
            const newUser: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: fullName.trim(),
              company: company?.trim() || '',
              role,
              preferredLanguage: 'en',
              createdAt: new Date().toISOString(),
            };
            setUser(newUser);
            return { success: true };
          }
          return { success: false, error: 'Sign up failed.' };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Sign up error';
          return { success: false, error: message };
        }
      }

      // Local signup
      const normalizedEmail = email.trim().toLowerCase();
      const clientHash = btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      const newUser: UserProfile = {
        id: `user-${clientHash || Date.now()}`,
        email: normalizedEmail,
        fullName: fullName.trim(),
        company: company?.trim() || '',
        role,
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(`pixel_pedia_user_${normalizedEmail}`, JSON.stringify(newUser));
      return { success: true };
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'OAuth error';
        return { success: false, error: message };
      }
    }

    const googleUser: UserProfile = {
      id: 'google-user-demo',
      email: 'demo@gmail.com',
      fullName: 'Demo Google User',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };
    setUser(googleUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(googleUser));
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign out error';
        console.warn('Sign out error:', message);
      }
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('profiles')
            .update({
              full_name: updatedUser.fullName,
              company: updatedUser.company,
              preferred_language: updatedUser.preferredLanguage,
              avatar_url: updatedUser.avatarUrl,
              role: updatedUser.role,
              bio: updatedUser.bio,
              headline: updatedUser.headline,
              experience_level: updatedUser.experienceLevel,
              availability: updatedUser.availability,
              starting_price: updatedUser.startingPrice,
              contact_for_quote: updatedUser.contactForQuote,
              location: updatedUser.location,
              website_url: updatedUser.websiteUrl,
              is_published: updatedUser.isPublished,
              onboarding_completed: updatedUser.onboardingCompleted,
            })
            .eq('id', user.id);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Update error';
          console.warn('Could not update profile:', message);
        }
      }

      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
        if (updatedUser.email) {
          localStorage.setItem(`pixel_pedia_user_${updatedUser.email}`, JSON.stringify(updatedUser));
        }
      } catch {
        // ignore
      }
    },
    [user]
  );

  const switchRole = useCallback(
    async (role: UserRole) => {
      await updateProfile({ role });
    },
    [updateProfile]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
