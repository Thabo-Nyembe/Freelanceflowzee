'use client'

/**
 * Error Boundary Component
 * Catches React component errors and provides fallback UI
 */

import React, { Component, ReactNode } from 'react'
import { LiquidGlassCard } from './liquid-glass-card'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ErrorBoundary')

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <LiquidGlassCard>
            <div className="p-8 max-w-md text-center space-y-6">
              <div className="text-6xl">⚠️</div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-4">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-red-500 mb-2">
                      Error Details (Dev Only)
                    </summary>
                    <pre className="text-xs bg-red-50 dark:bg-red-950/20 p-4 rounded-lg overflow-auto max-h-40">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for easier use
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
