'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  backUrl?: string
  backLabel?: string
}

/**
 * Reusable Route Error Component
 * Use this in error.tsx files throughout the app
 */
export function RouteError({
  error,
  reset,
  title = 'Something went wrong',
  backUrl = '/dashboard',
  backLabel = 'Back to Dashboard'
}: RouteErrorProps) {
  useEffect(() => {
    console.error('Route error:', error)

    // Report to monitoring
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {})
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-destructive/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </motion.div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>
              {error.message || 'An unexpected error occurred. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.digest && (
              <p className="text-xs text-muted-foreground text-center font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={reset} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={backUrl}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backLabel}
                </Link>
              </Button>
            </div>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Pre-configured error components for different sections
export function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Dashboard Error" backUrl="/dashboard" backLabel="Back to Dashboard" />
}

export function V1DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Dashboard Error" backUrl="/v1/dashboard" backLabel="Back to V1 Dashboard" />
}

export function V2DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Dashboard Error" backUrl="/v2/dashboard" backLabel="Back to V2 Dashboard" />
}

export function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Authentication Error" backUrl="/login" backLabel="Back to Login" />
}

export function VideoStudioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Video Studio Error" backUrl="/dashboard" backLabel="Back to Dashboard" />
}

export function CheckoutError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Checkout Error" backUrl="/pricing" backLabel="Back to Pricing" />
}
