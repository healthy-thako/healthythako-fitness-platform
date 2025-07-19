import React from 'react';
import { useLocation } from 'react-router-dom';

const RoutingDebugger: React.FC = () => {
  const location = useLocation();

  // Only render in development with debug logs enabled
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS !== 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900 bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🛣️ Route Debug</div>
      <div className="space-y-1">
        <div>Path: {location.pathname}</div>
        <div>Search: {location.search}</div>
        <div>Hash: {location.hash}</div>
      </div>
    </div>
  );
};

export default RoutingDebugger;
