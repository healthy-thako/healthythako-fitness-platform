import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BrandLoadingSpinner from '@/components/BrandLoadingSpinner';

interface UnifiedProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('client' | 'trainer' | 'gym_owner' | 'admin')[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showErrorToast?: boolean;
}

const UnifiedProtectedRoute: React.FC<UnifiedProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles = [],
  requiredPermissions = [],
  fallbackPath,
  showErrorToast = true
}) => {
  const { user, profile, loading, isSessionValid } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BrandLoadingSpinner size="lg" showText={true} />
      </div>
    );
  }

  // Check session validity
  if (user && !isSessionValid()) {
    toast.error('Your session has expired. Please sign in again.');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Handle routes that don't require authentication (like auth pages)
  if (!requireAuth) {
    // If user is already authenticated, redirect to appropriate dashboard
    if (user && profile) {
      const dashboardPath = getDashboardPath(profile.primary_role);
      return <Navigate to={dashboardPath} replace />;
    }
    // User is not authenticated, allow access to public/auth pages
    return <>{children}</>;
  }

  // Authentication is required beyond this point
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user profile exists
  if (!profile) {
    if (showErrorToast) {
      toast.error('User profile not found. Please contact support.');
    }
    return <Navigate to="/auth" replace />;
  }

  // Check if user account is active
  if (!profile.is_active) {
    if (showErrorToast) {
      toast.error('Your account has been deactivated. Please contact support.');
    }
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => 
      profile.roles?.includes(role) || profile.primary_role === role
    );

    if (!hasRequiredRole) {
      if (showErrorToast) {
        const roleList = allowedRoles.join(', ');
        toast.error(`Access denied. This area is for ${roleList} only.`);
      }
      
      // Redirect to appropriate dashboard or fallback path
      const redirectPath = fallbackPath || getDashboardPath(profile.primary_role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      profile.permissions?.includes(permission)
    );

    if (!hasRequiredPermissions) {
      if (showErrorToast) {
        toast.error('Access denied. You do not have the required permissions.');
      }
      
      // Redirect to appropriate dashboard or fallback path
      const redirectPath = fallbackPath || getDashboardPath(profile.primary_role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Check if certain roles require verification
  if (needsVerification(profile) && !profile.is_verified) {
    if (showErrorToast) {
      toast.warning('Your account is pending verification. Some features may be limited.');
    }
    
    // You can still allow access but with limited functionality
    // Or redirect to a verification pending page
    // For now, we'll allow access but the toast warns them
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

// Helper function to determine dashboard path based on role
function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'trainer':
      return '/trainer-dashboard';
    case 'gym_owner':
      return '/gym-dashboard';
    case 'client':
    default:
      return '/client-dashboard';
  }
}

// Helper function to check if role needs verification
function needsVerification(profile: any): boolean {
  const verificationRequiredRoles = ['trainer', 'gym_owner', 'admin'];
  return verificationRequiredRoles.includes(profile.primary_role) ||
         profile.roles?.some((role: string) => verificationRequiredRoles.includes(role));
}

// Higher-order component for specific role protection
export const withRoleProtection = (
  allowedRoles: ('client' | 'trainer' | 'gym_owner' | 'admin')[],
  fallbackPath?: string
) => {
  return (Component: React.ComponentType) => {
    return (props: any) => (
      <UnifiedProtectedRoute 
        allowedRoles={allowedRoles} 
        fallbackPath={fallbackPath}
      >
        <Component {...props} />
      </UnifiedProtectedRoute>
    );
  };
};

// Higher-order component for permission-based protection
export const withPermissionProtection = (
  requiredPermissions: string[],
  fallbackPath?: string
) => {
  return (Component: React.ComponentType) => {
    return (props: any) => (
      <UnifiedProtectedRoute 
        requiredPermissions={requiredPermissions} 
        fallbackPath={fallbackPath}
      >
        <Component {...props} />
      </UnifiedProtectedRoute>
    );
  };
};

// Convenience components for common use cases
export const ClientProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedProtectedRoute allowedRoles={['client']}>
    {children}
  </UnifiedProtectedRoute>
);

export const TrainerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedProtectedRoute allowedRoles={['trainer']}>
    {children}
  </UnifiedProtectedRoute>
);

export const GymOwnerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedProtectedRoute allowedRoles={['gym_owner']}>
    {children}
  </UnifiedProtectedRoute>
);

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedProtectedRoute allowedRoles={['admin']}>
    {children}
  </UnifiedProtectedRoute>
);

// Multi-role protection (for users with multiple roles)
export const MultiRoleProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles: ('client' | 'trainer' | 'gym_owner' | 'admin')[];
}> = ({ children, allowedRoles }) => (
  <UnifiedProtectedRoute allowedRoles={allowedRoles}>
    {children}
  </UnifiedProtectedRoute>
);

export default UnifiedProtectedRoute; 