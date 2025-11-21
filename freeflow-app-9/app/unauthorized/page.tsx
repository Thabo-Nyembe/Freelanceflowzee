'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Home, ArrowLeft, FileText } from 'lucide-react'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function UnauthorizedPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD UNAUTHORIZED PAGE DATA
  useEffect(() => {
    const loadUnauthorizedPageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load unauthorized page'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Unauthorized page loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load unauthorized page')
        setIsLoading(false)
        announce('Error loading unauthorized page', 'assertive')
      }
    }

    loadUnauthorizedPageData()
  }, [announce])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/kazi-brand/logo.svg" 
            alt="KAZI" 
            className="h-8 w-auto"
          />
          <span className="text-2xl font-bold text-purple-600">KAZI</span>
        </div>

        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
            <CardDescription className="text-red-600">
              You don&apos;t have permission to access this resource. This could be because:
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>You&apos;re not logged in</li>
                <li>Your session has expired</li>
                <li>You don&apos;t have the required permissions</li>
                <li>The content is private</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              If you believe this is an error, please{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                contact support
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 