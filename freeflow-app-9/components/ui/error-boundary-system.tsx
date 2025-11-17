'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'
import { Card } from './card'
import {
  AlertTriangle, RefreshCw, Bug, Copy, ExternalLink,
  Shield, Zap, MessageCircle, Home, ArrowLeft
} from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isCollapsed: boolean
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'feature'
  name?: string
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isCollapsed: true,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log error for monitoring
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
      name: this.props.name || 'Unknown',
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    })

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          level: this.props.level,
          name: this.props.name,
          errorId: this.state.errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isCollapsed: true,
      errorId: ''
    })
  }

  handleCopyError = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
    console.log('Error details copied to clipboard')
  }

  handleReportError = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      level: this.props.level,
      name: this.props.name,
      url: window.location.href
    }

    const subject = encodeURIComponent(`Error Report - ${this.props.name || 'Component'} (${this.state.errorId})`)
    const body = encodeURIComponent(`Error Details:\n\n${JSON.stringify(errorDetails, null, 2)}`)
    window.open(`mailto:support@kazi.com?subject=${subject}&body=${body}`, '_blank')
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback prop
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Different layouts based on error level
      const level = this.props.level || 'component'

      if (level === 'page') {
        return <PageLevelError {...this.state} {...this.getHandlers()} />
      }

      if (level === 'feature') {
        return <FeatureLevelError {...this.state} {...this.getHandlers()} name={this.props.name} />
      }

      return <ComponentLevelError {...this.state} {...this.getHandlers()} name={this.props.name} />
    }

    return this.props.children
  }

  private getHandlers() {
    return {
      onRetry: this.handleRetry,
      onCopy: this.handleCopyError,
      onReport: this.handleReportError,
      onToggleCollapse: () => this.setState(prev => ({ isCollapsed: !prev.isCollapsed }))
    }
  }
}

// Page Level Error Component
function PageLevelError(props: ErrorBoundaryState & ReturnType<ErrorBoundaryClass['getHandlers']>) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-surface to-background">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <Card className="p-8">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block p-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white mb-6"
            >
              <AlertTriangle className="w-12 h-12" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gradient mb-4">
              Oops! Something Went Wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={props.onRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              <Button variant="ghost" onClick={props.onReport} className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Report
              </Button>
            </div>

            <ErrorDetails {...props} />
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Feature Level Error Component
function FeatureLevelError(props: ErrorBoundaryState & ReturnType<ErrorBoundaryClass['getHandlers']> & { name?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6"
    >
      <GlassCard className="p-6 border-destructive/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Zap className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-destructive mb-2">
              {props.name || 'Feature'} Error
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This feature encountered an error and couldn't load properly.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={props.onRetry} className="gap-2">
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
              <Button size="sm" variant="ghost" onClick={props.onReport} className="gap-2">
                <Bug className="w-3 h-3" />
                Report
              </Button>
            </div>
          </div>
        </div>
        <ErrorDetails {...props} />
      </GlassCard>
    </motion.div>
  )
}

// Component Level Error Component
function ComponentLevelError(props: ErrorBoundaryState & ReturnType<ErrorBoundaryClass['getHandlers']> & { name?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 border border-destructive/20 rounded-lg bg-destructive/5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {props.name || 'Component'} Error
          </span>
        </div>
        <div className="flex gap-1">
          <Context7Button size="sm" variant="ghost" onClick={props.onRetry} className="h-6 px-2">
            <RefreshCw className="w-3 h-3" />
          </Context7Button>
          <Context7Button size="sm" variant="ghost" onClick={props.onReport} className="h-6 px-2">
            <Bug className="w-3 h-3" />
          </Context7Button>
        </div>
      </div>
      <ErrorDetails {...props} />
    </motion.div>
  )
}

// Error Details Component
function ErrorDetails(props: ErrorBoundaryState & ReturnType<ErrorBoundaryClass['getHandlers']>) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <Context7Button
        size="sm"
        variant="ghost"
        onClick={props.onToggleCollapse}
        className="mb-3 gap-2"
      >
        <Bug className="w-3 h-3" />
        {props.isCollapsed ? 'Show' : 'Hide'} Error Details
      </Context7Button>

      {!props.isCollapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={props.onCopy} className="gap-2">
              <Copy className="w-3 h-3" />
              Copy Details
            </Button>
            <Button size="sm" variant="outline" onClick={props.onReport} className="gap-2">
              <ExternalLink className="w-3 h-3" />
              Report Bug
            </Button>
          </div>

          <div className="text-xs space-y-2">
            <div>
              <span className="font-medium text-destructive">Error ID:</span>
              <span className="ml-2 font-mono">{props.errorId}</span>
            </div>
            <div>
              <span className="font-medium text-destructive">Message:</span>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                {props.error?.message}
              </pre>
            </div>
            {props.error?.stack && (
              <div>
                <span className="font-medium text-destructive">Stack Trace:</span>
                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-h-32">
                  {props.error.stack}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Wrapper component for easier usage
export function ErrorBoundary({ children, ...props }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass {...props}>
      {children}
    </ErrorBoundaryClass>
  )
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for programmatic error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Programmatic error:', error, errorInfo)

    // Report to error tracking service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          type: 'programmatic',
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silently fail if error reporting fails
      })
    }
  }
}

export default ErrorBoundary