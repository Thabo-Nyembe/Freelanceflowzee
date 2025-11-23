'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertTriangle, RefreshCw, Home, MessageCircle,
  Bug, Settings, Zap, Shield, ArrowLeft
} from 'lucide-react'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ErrorPage')

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const ERROR_TYPES = {
  '404': {
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist',
    icon: AlertTriangle,
    color: 'from-orange-500 to-red-500'
  },
  '500': {
    title: 'Internal Server Error',
    description: 'Something went wrong on our end',
    icon: Bug,
    color: 'from-red-500 to-pink-500'
  },
  '503': {
    title: 'Service Unavailable',
    description: 'We\'re temporarily down for maintenance',
    icon: Settings,
    color: 'from-yellow-500 to-orange-500'
  },
  'default': {
    title: 'Oops! Something Went Wrong',
    description: 'An unexpected error occurred',
    icon: AlertTriangle,
    color: 'from-purple-500 to-pink-500'
  }
}

const TROUBLESHOOTING_STEPS = [
  'Refresh the page',
  'Clear your browser cache',
  'Check your internet connection',
  'Try again in a few minutes',
  'Contact support if the problem persists'
]

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to analytics/monitoring service
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })

    // Send error report to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Replace with your error tracking service
      // Example: Sentry, Bugsnag, etc.
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          digest: error.digest,
          stack: error.stack,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silently fail if error reporting fails
      })
    }
  }, [error])

  const getErrorType = () => {
    if (error.message.includes('404')) return ERROR_TYPES['404']
    if (error.message.includes('500')) return ERROR_TYPES['500']
    if (error.message.includes('503')) return ERROR_TYPES['503']
    return ERROR_TYPES['default']
  }

  const errorType = getErrorType()
  const Icon = errorType.icon

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))

    // Open email with error details
    const subject = encodeURIComponent('KAZI Error Report')
    const body = encodeURIComponent(`Error Details:\n\n${JSON.stringify(errorReport, null, 2)}`)
    window.open(`mailto:support@kazi.com?subject=${subject}&body=${body}`, '_blank')
  }

  const handleRetry = () => {
    reset()
  }

  const handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-surface to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-red-500/10 via-transparent to-orange-500/10 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 180, 0],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-pink-500/10 via-transparent to-red-500/10 rounded-full"
        />
      </div>

      <div className="relative max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Error Icon Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
            className="relative"
          >
            <Card className="inline-block p-8">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`p-6 rounded-2xl bg-gradient-to-r ${errorType.color} text-white inline-block`}
              >
                <Icon className="w-16 h-16" />
              </motion.div>
            </Card>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              {errorType.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {errorType.description}
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded-full inline-block">
                Error ID: {error.digest}
              </p>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              variant="default"
              size="lg"
              className="gap-2"
              onClick={handleRetry}
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handleGoHome}
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="gap-2"
              onClick={handleReportError}
            >
              <MessageCircle className="w-5 h-5" />
              Report Error
            </Button>
          </motion.div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-6 text-left">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Development Error Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Error Message:</h4>
                    <p className="text-sm font-mono bg-muted p-2 rounded text-red-600">
                      {error.message}
                    </p>
                  </div>
                  {error.stack && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Stack Trace:</h4>
                      <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Troubleshooting Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Troubleshooting Steps
              </h3>
              <div className="space-y-2 text-left">
                {TROUBLESHOOTING_STEPS.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>
              If the problem persists, please{' '}
              <button
                onClick={handleReportError}
                className="text-primary hover:underline"
              >
                report this error
              </button>{' '}
              and include the error ID above.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}