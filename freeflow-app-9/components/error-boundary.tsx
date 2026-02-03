'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  fallbackUrl?: string
  fallbackLabel?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error safely
    try {
      console.error('Error caught by boundary:', error, errorInfo)
      this.setState({ errorInfo })
      // Report to monitoring service
      if (typeof window !== 'undefined') {
        fetch('/api/error-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}) // Silently fail
      }
    } catch {
      // Ignore logging errors
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallbackUrl = '/dashboard', fallbackLabel = 'Back to Dashboard' } = this.props

      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-left">
                <p className="text-sm font-mono text-red-700 dark:text-red-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <Link
                href={fallbackUrl}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {fallbackLabel}
              </Link>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 mt-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}