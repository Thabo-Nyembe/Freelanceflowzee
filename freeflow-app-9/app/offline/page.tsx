'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw } from 'lucide-react'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// Force static generation for this page
export const dynamic = 'force-static'

export default function OfflinePage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD OFFLINE PAGE DATA
  useEffect(() => {
    const loadOfflinePageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load offline page'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Offline page loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offline page')
        setIsLoading(false)
        announce('Error loading offline page', 'assertive')
      }
    }

    loadOfflinePageData()
  }, [announce])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
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

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle>You&apos;re Offline</CardTitle>
            <CardDescription>
              It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>What you can still do:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>View cached content</li>
                <li>Access recently visited pages</li>
                <li>Use offline features</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <p className="text-xs text-gray-500">
              Your work will sync automatically when you&apos;re back online.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 