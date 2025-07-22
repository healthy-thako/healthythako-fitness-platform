import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error caught by boundary - silently handled
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  // Check if error is related to WebGL/renderer issues
  private isWebGLError = (error?: Error): boolean => {
    if (!error) return false;
    const message = error.message.toLowerCase();
    return message.includes('renderer') || 
           message.includes('webgl') || 
           message.includes('gl context') ||
           message.includes('cannot set properties of null');
  };

  // Detect if user is on mobile
  private isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isWebGLIssue = this.isWebGLError(this.state.error);
      const isMobileDevice = this.isMobile();

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                {isWebGLIssue && isMobileDevice ? (
                  <Smartphone className="h-6 w-6 text-red-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {isWebGLIssue && isMobileDevice 
                  ? "We detected a graphics compatibility issue with your device. The page is falling back to a simplified view."
                  : "We encountered an unexpected error. Please try refreshing the page."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {this.state.error.message}
                </div>
              )}
              
              {isWebGLIssue && isMobileDevice && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <Monitor className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Browser Compatibility Note:</p>
                      <p>Some mobile browsers have limited graphics support. Try using Chrome or Firefox for the best experience.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
