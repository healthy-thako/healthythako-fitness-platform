import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, handleAuthError } from '@/integrations/supabase/client';

// Enhanced user profile interface that consolidates all roles
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  primary_role: 'client' | 'trainer' | 'gym_owner' | 'admin';
  roles: ('client' | 'trainer' | 'gym_owner' | 'admin')[];
  permissions: string[];
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Role-specific data
  trainer_data?: {
    bio?: string;
    specializations?: string[];
    rate_per_hour?: number;
    certifications?: string[];
  };
  gym_owner_data?: {
    business_name?: string;
    business_license?: string;
  };
  admin_data?: {
    username?: string;
    role: 'admin' | 'super_admin';
  };
  // User profiles data
  profile_data?: any;
  user_profiles?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;

  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: 'client' | 'trainer', name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forceSignOut: () => void;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;

  // Admin authentication (unified)
  adminSignIn: (username: string, password: string) => Promise<{ error: any }>;

  // Role management
  requestRoleChange: (newRole: 'client' | 'trainer' | 'gym_owner', additionalData?: any) => Promise<{ error: any }>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  switchPrimaryRole: (role: 'client' | 'trainer' | 'gym_owner') => Promise<{ error: any }>;

  // Session management
  refreshSession: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  isSessionValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Ultra-simplified profile fetching for debugging
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('=== FETCHING PROFILE FOR USER:', userId, '===');

      // Create a minimal profile from auth user data
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) {
        console.error('No auth user found');
        return null;
      }

      console.log('✅ Creating minimal profile from auth data');

      // Create minimal profile without database queries for now
      const userProfile: UserProfile = {
        id: userId,
        user_id: userId,
        email: authUser.user.email || '',
        name: authUser.user.user_metadata?.name || authUser.user.user_metadata?.full_name || 'User',
        primary_role: (authUser.user.user_metadata?.role as any) || 'client',
        roles: [(authUser.user.user_metadata?.role as any) || 'client'],
        permissions: [],
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_data: { profile_completed: false }
      };

      console.log('✅ MINIMAL PROFILE CREATED:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Update last login timestamp - UPDATED for new schema
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Log authentication events for audit trail
  const logAuthEvent = async (event: string, details?: any) => {
    try {
      // Note: user_activity_logs table doesn't exist in types, so commenting out for now
      // This can be added back when the table is properly defined in the database
      console.log('Auth event:', event, details);
    } catch (error) {
      console.error('Error logging auth event:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log('Auth state change - user signed in:', session.user.id);

            // For new users, ensure they exist in the database first
            if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
              console.log('Handling signup/signin event, ensuring user exists...');

              try {
                const userEmail = session.user.email || '';
                const userName = session.user.user_metadata?.name ||
                                session.user.user_metadata?.full_name ||
                                userEmail.split('@')[0] || 'User';
                const userType = session.user.user_metadata?.role || 'client';

                await supabase.rpc('ensure_user_exists', {
                  p_user_id: session.user.id,
                  p_user_email: userEmail,
                  p_user_name: userName,
                  p_user_type: userType
                });

                console.log('User ensured in database during auth state change');
              } catch (ensureError) {
                console.warn('Error ensuring user exists during auth state change:', ensureError);
              }
            }

            // Fetch profile using the actual database structure
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setProfile(userProfile);
              console.log('Profile set from auth state change:', userProfile.primary_role);
            } else {
              console.warn('Failed to fetch user profile during auth state change');
              // If profile fetch fails, try again after a short delay
              setTimeout(async () => {
                console.log('Retrying profile fetch...');
                const retryProfile = await fetchUserProfile(session.user.id);
                if (retryProfile) {
                  setProfile(retryProfile);
                  console.log('Profile set on retry:', retryProfile.primary_role);
                }
              }, 2000);
            }

            // Update last login
            try {
              await updateLastLogin(session.user.id);
            } catch (loginError) {
              console.warn('Error updating last login:', loginError);
            }

            // Log authentication event
            try {
              await logAuthEvent('signin', { method: 'email' });
            } catch (logError) {
              console.warn('Error logging auth event:', logError);
            }
          } else {
            console.log('Auth state change - user signed out');
            setProfile(null);
          }

          // Handle password recovery
          if (event === 'PASSWORD_RECOVERY') {
            console.log('Password recovery event detected');
          }

          // Handle token refresh errors
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }

        } catch (error) {
          console.error('Error in auth state change:', error);
          // If there's an error, ensure we clear the state
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          // Use the utility function to handle auth errors
          const handled = await handleAuthError(error);
          if (handled) {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
          return;
        }

        console.log('Initial session:', session?.user?.id);

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Use the utility function to handle auth errors
        const handled = await handleAuthError(error);
        if (handled || error) {
          // Clear invalid session data
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data.user?.id);

      // Ensure user profile is created/updated
      if (data.user) {
        try {
          const userProfile = await fetchUserProfile(data.user.id);
          if (userProfile) {
            setProfile(userProfile);
            console.log('User profile set after sign in:', userProfile.primary_role);
          }
        } catch (profileError) {
          console.warn('Error fetching profile after sign in:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: 'client' | 'trainer', name: string) => {
    try {
      setLoading(true);
      console.log('Starting signup process for:', email, 'with role:', role);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
            // Add more metadata to help with user creation
            full_name: name,
            display_name: name,
            signup_timestamp: new Date().toISOString(),
          },
          // Set email confirmation to true to prevent immediate sign-in
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful:', data.user?.id);

      // If user is created and confirmed (no email confirmation required)
      if (data.user && data.session) {
        console.log('User signed up and confirmed, setting up profile...');

        // Wait a bit for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Ensure user exists in our database
        try {
          await supabase.rpc('ensure_user_exists', {
            p_user_id: data.user.id,
            p_user_email: email,
            p_user_name: name,
            p_user_type: role
          });

          console.log('User ensured in database');
        } catch (ensureError) {
          console.warn('Error ensuring user exists:', ensureError);
        }

        // Fetch and set the user profile
        try {
          const userProfile = await fetchUserProfile(data.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setUser(data.user);
            setSession(data.session);
            console.log('User profile set after signup:', userProfile.primary_role);
          } else {
            console.warn('Failed to fetch user profile after signup');
          }
        } catch (profileError) {
          console.warn('Error fetching profile after signup:', profileError);
        }
      } else {
        console.log('Email confirmation required for user:', data.user?.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      // Provide more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during signup';
      return { error: new Error(`Signup failed: ${errorMessage}`) };
    } finally {
      setLoading(false);
    }
  };

  const adminSignIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // For admin login, we'll use the admin edge function
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/admin-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        return { error: result.error || 'Admin login failed' };
      }

      // If admin login is successful, we might need to create a special session
      console.log('Admin login successful');
      return { error: null };
    } catch (error) {
      console.error('Admin sign in exception:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const forceSignOut = () => {
    console.log('AuthContext: Force signout - clearing state and redirecting...');
    setUser(null);
    setProfile(null);
    setSession(null);

    // Clear any stored tokens
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();

    // Simple, reliable redirect
    console.log('AuthContext: Force signout - redirecting to homepage...');
    window.location.href = '/';
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting signout process...');

      // Log the signout event (but don't let it block the process)
      try {
        await logAuthEvent('signout');
      } catch (logError) {
        console.warn('Failed to log signout event:', logError);
      }

      console.log('AuthContext: Calling Supabase signOut...');

      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Signout timeout')), 5000)
      );

      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        if (error) {
          console.error('Supabase signOut error:', error);
          throw error;
        }
        console.log('AuthContext: Supabase signOut successful, clearing state...');
      } catch (timeoutError) {
        console.warn('AuthContext: Supabase signOut timed out or failed:', timeoutError);
        console.log('AuthContext: Proceeding with local state cleanup...');
        // Continue with local cleanup even if Supabase call fails
      }

      // Clear all auth state
      setUser(null);
      setProfile(null);
      setSession(null);

      console.log('AuthContext: State cleared, redirecting to homepage...');

      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      // Use window.location for reliable navigation after signout
      console.log('AuthContext: Redirecting to homepage...');
      window.location.href = '/';

    } catch (error) {
      console.error('AuthContext: Sign out error:', error);

      // Even if there's an error, clear local state and redirect
      console.log('AuthContext: Error occurred, forcing state clear and redirect...');
      setUser(null);
      setProfile(null);
      setSession(null);

      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      // Force redirect even on error
      console.log('AuthContext: Error fallback - redirecting to homepage...');
      window.location.href = '/';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  };

  const requestRoleChange = async (newRole: 'client' | 'trainer' | 'gym_owner', additionalData?: any) => {
    try {
      if (!user) throw new Error('No authenticated user');

      // Update the role in the users table
      const { error } = await supabase
        .from('users')
        .update({ user_type: newRole })
        .eq('id', user.id);

      if (error) throw error;

      // Create role-specific profile if needed
      if (newRole === 'trainer') {
        await supabase
          .from('trainers')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trainer',
            contact_email: user.email,
            ...additionalData
          })
          .select()
          .single();
      } else if (newRole === 'gym_owner') {
        await supabase
          .from('gym_owners')
        .insert({
          user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Gym Owner',
            ...additionalData
          })
          .select()
          .single();
      }

      // Refresh profile
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);

      return { error: null };
    } catch (error) {
      console.error('Role change error:', error);
      return { error };
    }
  };

  const hasRole = (role: string): boolean => {
    return profile?.roles?.includes(role as any) || profile?.primary_role === role;
  };

  const hasPermission = (permission: string): boolean => {
    return profile?.permissions?.includes(permission) || false;
  };

  const switchPrimaryRole = async (role: 'client' | 'trainer' | 'gym_owner') => {
    try {
      if (!user || !profile?.roles?.includes(role)) {
        throw new Error('User does not have access to this role');
      }

      // Update primary role in database
      const { error } = await supabase
        .from('users')
        .update({ user_type: role })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile
      setProfile(prev => prev ? { ...prev, primary_role: role } : null);

      return { error: null };
    } catch (error) {
      console.error('Switch role error:', error);
      return { error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        const userProfile = await fetchUserProfile(data.session.user.id);
          setProfile(userProfile);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  };

  // Force refresh user profile (useful after role mapping fixes)
  const refreshUserProfile = async () => {
    try {
      if (user) {
        console.log('Force refreshing user profile...');
        const userProfile = await fetchUserProfile(user.id);
        setProfile(userProfile);
        console.log('User profile refreshed:', userProfile);
      }
    } catch (error) {
      console.error('Refresh user profile error:', error);
    }
  };

  const isSessionValid = (): boolean => {
    if (!session || !session.expires_at) return false;
    return Date.now() < session.expires_at * 1000;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    adminSignIn,
    signOut,
    forceSignOut,
    resetPassword,
    updatePassword,
    requestRoleChange,
    hasRole,
    hasPermission,
    switchPrimaryRole,
    refreshSession,
    refreshUserProfile,
    isSessionValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
