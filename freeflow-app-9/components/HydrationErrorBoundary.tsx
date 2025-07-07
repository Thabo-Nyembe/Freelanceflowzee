'use client'

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class HydrationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to your error reporting service
    console.error('Hydration error: ', {
      error,
      componentStack: errorInfo.componentStack,
    });

    // You can also send this to your analytics service
    if (typeof window !== 'undefined') {
      // Send to your analytics service
      const analyticsData = {
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };
      
      // Log to server
      fetch('/api/log-hydration-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      }).catch(console.error);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                We encountered an issue with this component. The page will automatically refresh to fix it.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;