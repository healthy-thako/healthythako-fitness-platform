import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ children }) => {
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Listen for auth errors
    const handleAuthError = (error: any) => {
      if (error?.message?.includes('refresh') || 
          error?.message?.includes('token') || 
          error?.message?.includes('Invalid Refresh Token')) {
        // Auth error detected
        setHasAuthError(true);
      }
    };

    // Listen for unhandled promise rejections that might be auth-related
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('refresh') || 
          event.reason?.message?.includes('token') ||
          event.reason?.message?.includes('Invalid Refresh Token')) {
        // Unhandled auth error
        setHasAuthError(true);
        event.preventDefault(); // Prevent the error from being logged to console
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setHasAuthError(false); // Clear error state when signed out
      }
    });

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const clearSession = async () => {
    setIsClearing(true);
    try {
      // Clear all auth-related data
      await supabase.auth.signOut();
      
      // Clear localStorage
      const keysToRemove = [
        'supabase.auth.token',
        'admin_session_token',
        'sb-lhncpcsniuxnrmabbkmr-auth-token'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // Could not remove localStorage key
        }
      });

      // Clear sessionStorage
      try {
        sessionStorage.clear();
      } catch (error) {
        // Could not clear sessionStorage
      }

      setHasAuthError(false);
      toast.success('Session cleared successfully. Please sign in again.');
      
      // Reload the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error clearing session:', error);
      toast.error('Failed to clear session. Please try refreshing the page.');
    } finally {
      setIsClearing(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  if (hasAuthError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Authentication Error</CardTitle>
            <CardDescription>
              Your session has expired or become invalid. Please clear your session and sign in again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={clearSession} 
              disabled={isClearing}
              className="w-full"
              variant="default"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Clearing Session...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Clear Session & Sign In
                </>
              )}
            </Button>
            
            <Button 
              onClick={refreshPage} 
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            
            <div className="text-xs text-gray-500 text-center">
              This error usually occurs when your login session expires. 
              Clearing your session will sign you out and allow you to sign in again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthErrorHandler;
