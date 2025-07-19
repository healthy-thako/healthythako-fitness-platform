import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FallbackDebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  trainersData?: {
    data: any[];
    isLoading: boolean;
    error: any;
    isUsingFallback?: boolean;
  };
}

const FallbackDebugPanel: React.FC<FallbackDebugPanelProps> = ({
  isVisible,
  onToggle,
  trainersData
}) => {
  // Only render in development with debug logs enabled
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS !== 'true') {
    return null;
  }

  return (
    <>
      <Button
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
        size="sm"
      >
        🔧 Debug
      </Button>
      
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-96 overflow-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Debug Panel
                <Button onClick={onToggle} variant="ghost" size="sm">✕</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainersData && (
                <div className="space-y-2 text-sm">
                  <div>Data Count: {trainersData.data?.length || 0}</div>
                  <div>Loading: {trainersData.isLoading ? 'Yes' : 'No'}</div>
                  <div>Error: {trainersData.error ? 'Yes' : 'No'}</div>
                  <div>Using Fallback: {trainersData.isUsingFallback ? 'Yes' : 'No'}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FallbackDebugPanel;
