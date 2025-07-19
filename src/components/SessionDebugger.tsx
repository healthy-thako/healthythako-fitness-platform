import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SessionDebugger: React.FC = () => {
  const { user, profile, session, loading } = useAuth();

  // Only render in development with debug logs enabled
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS !== 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Session Debug</div>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user?.email || 'None'}</div>
        <div>Profile: {profile?.primary_role || 'None'}</div>
        <div>Session: {session ? 'Active' : 'None'}</div>
        <div>Environment: {import.meta.env.VITE_APP_ENVIRONMENT}</div>
      </div>
    </div>
  );
};

export default SessionDebugger;
