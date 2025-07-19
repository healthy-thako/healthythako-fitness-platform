import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthDebugger: React.FC = () => {
  const { user, profile, session, loading } = useAuth();

  // Only render in development with debug logs enabled
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS !== 'true') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 bg-green-900 bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔐 Auth Debug</div>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Role: {profile?.primary_role || 'None'}</div>
        <div>Session: {session ? 'Valid' : 'Invalid'}</div>
      </div>
    </div>
  );
};

export default AuthDebugger;
