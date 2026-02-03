'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallbackUrl?: string
  fallbackLabel?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    // Log error to error reporting service - use try-catch to prevent cascading errors
    try {
      console.error('Error caught by boundary: ', error, errorInfo)
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
        }).catch(() => {}) // Silently fail if error reporting fails
      }
    } catch {
      // Ignore any errors during error logging
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const { fallbackUrl = '/dashboard', fallbackLabel = 'Back to Dashboard' } = this.props

      return (
        <div className="min-h-screen flex items-center justify-center p-4" data-testid="error-boundary">
          <div className="max-w-md w-full space-y-4">
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-red-800 dark:text-red-300">Something went wrong</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-red-700 dark:text-red-400">
                  {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                </CardDescription>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                data-testid="retry-button"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href={fallbackUrl}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {fallbackLabel}
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 