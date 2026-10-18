import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, SupportedLanguage } from '../types';
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
    company?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'pixel_client_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (session?.user && mounted) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client',
              company: profile?.company || session.user.user_metadata?.company || '',
              avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
              preferredLanguage: (profile?.preferred_language as SupportedLanguage) || 'en',
              createdAt: profile?.created_at || session.user.created_at,
            });
          }
        } catch (err: any) {
          console.warn('Supabase auth session error:', err.message);
        }
      } else {
        // Local mode session restore
        try {
          const cached = localStorage.getItem(LOCAL_USER_KEY);
          if (cached && mounted) {
            setUser(JSON.parse(cached));
          } else if (mounted) {
            // Default pre-authenticated demo user for immediate review out-of-the-box
            const demoUser: UserProfile = {
              id: 'demo-client-01',
              email: 'producer@pixelmedia.studio',
              fullName: 'Alex Vance',
              company: 'Apex Horizon Studios',
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

    // Set up Supabase listener if configured
    let subscription: { unsubscribe: () => void } | null = null;
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client',
            company: profile?.company || session.user.user_metadata?.company || '',
            avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
            preferredLanguage: (profile?.preferred_language as SupportedLanguage) || 'en',
            createdAt: profile?.created_at || session.user.created_at,
          });
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
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) return { success: false, error: error.message };

          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            const loggedInUser: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
              company: profile?.company || data.user.user_metadata?.company || '',
              avatarUrl: profile?.avatar_url,
              preferredLanguage: (profile?.preferred_language as SupportedLanguage) || 'en',
              createdAt: profile?.created_at || new Date().toISOString(),
            };
            setUser(loggedInUser);
            return { success: true };
          }
          return { success: false, error: 'Authentication failed. Please verify credentials.' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Authentication error.' };
        }
      }

      // Local persistent authentication mode
      const normalizedEmail = email.trim().toLowerCase();
      const clientHash = btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      const localUser: UserProfile = {
        id: `client-${clientHash || Date.now()}`,
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0].replace('.', ' ').replace(/^./, (s) => s.toUpperCase()),
        company: 'Client Studio Partner',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      return { success: true };
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      company?: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid work email.' };
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
              preferredLanguage: 'en',
              createdAt: new Date().toISOString(),
            };
            setUser(newUser);
            return { success: true };
          }
          return { success: false, error: 'Sign up request failed. Please try again.' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Sign up error.' };
        }
      }

      // Local signup mode
      const normalizedEmail = email.trim().toLowerCase();
      const clientHash = btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      const newUser: UserProfile = {
        id: `client-${clientHash || Date.now()}`,
        email: normalizedEmail,
        fullName: fullName.trim(),
        company: company?.trim() || '',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      return { success: true };
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // In local demo mode, simulate Google OAuth login with high-fidelity profile
    const googleUser: UserProfile = {
      id: 'google-client-alex',
      email: 'alex.producer@gmail.com',
      fullName: 'Alex Vance (Google)',
      company: 'Apex Horizon Studios',
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
      } catch (err: any) {
        console.warn('Supabase sign out error:', err.message);
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
            })
            .eq('id', user.id);
        } catch (err: any) {
          console.warn('Could not update profile in Supabase:', err.message);
        }
      }

      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
    },
    [user]
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
