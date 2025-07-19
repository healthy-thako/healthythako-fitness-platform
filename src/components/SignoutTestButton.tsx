import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const SignoutTestButton: React.FC = () => {
  const { signOut } = useAuth();

  // Only render in development with debug logs enabled
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS !== 'true') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button 
        onClick={signOut}
        variant="destructive"
        size="sm"
      >
        🚪 Debug Sign Out
      </Button>
    </div>
  );
};

export default SignoutTestButton;
