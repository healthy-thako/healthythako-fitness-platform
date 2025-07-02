import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch user profile with all role data - UPDATED for new database schema
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);

      // First get the basic profile from users table (new schema)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }

      console.log('User data:', userData);

      // Get role-specific data based on the user's type
      let trainerData = null;
      let gymOwnerData = null;
      let adminData = null;

      // Fetch trainer data if user is a trainer
      if (userData.user_type === 'trainer') {
        const { data: trainer } = await supabase
          .from('trainers')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (trainer) {
          trainerData = {
            bio: trainer.bio,
            specializations: trainer.specialties, // Note: field name changed
            rate_per_hour: trainer.pricing ? (trainer.pricing as any)?.hourly_rate : null,
            certifications: trainer.certifications
          };
        }
      }

      // Fetch gym owner data if user is a gym owner
      if (userData.user_type === 'gym_owner') {
        const { data: gymOwner } = await supabase
          .from('gym_owner_profiles')
          .select('*')
          .eq('id', userId) // Note: different relationship in new schema
          .single();

        if (gymOwner) {
          gymOwnerData = {
            business_name: gymOwner.business_name,
            business_license: gymOwner.business_registration_number
          };
        }
      }

      // Admin data handling (if needed)
      if (userData.user_type === 'admin') {
        // For now, just set basic admin data
        adminData = {
          username: userData.email, // Use email as username for now
          role: 'admin'
        };
      }

      // Map database user_type to frontend role (user -> client)
      const mapUserTypeToRole = (userType: string): 'client' | 'trainer' | 'gym_owner' | 'admin' => {
        switch (userType) {
          case 'user':
            return 'client';
          case 'trainer':
            return 'trainer';
          case 'gym_owner':
            return 'gym_owner';
          case 'admin':
            return 'admin';
          default:
            return 'client'; // Default fallback
        }
      };

      const mappedRole = mapUserTypeToRole(userData.user_type || 'user');

      // Create the UserProfile object with actual data from new schema
      const userProfile: UserProfile = {
        id: userData.id,
        user_id: userData.id,
        email: userData.email,
        name: userData.full_name || '', // Note: field name changed to full_name
        phone: userData.phone_number, // Note: field name changed to phone_number
        primary_role: mappedRole,
        roles: [mappedRole], // For now, users have single roles
        permissions: [], // Can be expanded later
        is_active: !userData.anonymized, // Use anonymized field to determine if active
        is_verified: true, // Default to true for now
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString(),
        trainer_data: trainerData,
        gym_owner_data: gymOwnerData,
        admin_data: adminData
      };

      console.log('Final user profile:', userProfile);
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile using the actual database structure
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
          
          // Update last login
          await updateLastLogin(session.user.id);
          
          // Log authentication event
          await logAuthEvent('signin', { method: 'email' });
        } else {
          setProfile(null);
        }
        
        setLoading(false);

        // Handle password recovery
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event detected');
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session?.user?.id);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      }
      setLoading(false);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data.user?.id);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
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

  const signOut = async () => {
    try {
      await logAuthEvent('signout');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
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

      // Update the role in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      // Create role-specific profile if needed
      if (newRole === 'trainer') {
        await supabase
          .from('trainer_profiles')
          .insert({ user_id: user.id, ...additionalData })
          .select()
          .single();
      } else if (newRole === 'gym_owner') {
        await supabase
          .from('gym_owners')
        .insert({
          user_id: user.id,
            email: user.email,
            name: profile?.name,
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
        .from('profiles')
        .update({ role: role })
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
