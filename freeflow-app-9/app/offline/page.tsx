'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { WifiOff, RefreshCw, Database, Clock, Cloud, CheckCircle, ArrowLeft } from 'lucide-react'

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
  const [pendingChanges, setPendingChanges] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { announce } = useAnnouncer()

  // A+++ LOAD OFFLINE PAGE DATA
  useEffect(() => {
    const loadOfflinePageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load offline status from IndexedDB
        try {
          const { getSyncQueueManager, getOfflineDB } = await import('@/lib/offline/sync-store')
          const manager = getSyncQueueManager()
          const status = await manager.getQueueStatus()
          setPendingChanges(status.pending + status.failed)

          // Get last sync time from metadata
          const db = getOfflineDB()
          const metadata = await db.syncMetadata.toArray()
          if (metadata.length > 0) {
            const lastSync = Math.max(...metadata.map(m => m.lastSyncedAt))
            setLastSyncTime(new Date(lastSync).toLocaleString())
          }
        } catch {
          // IndexedDB not available, continue without it
        }

        setIsLoading(false)
        announce('Offline page loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offline page')
        setIsLoading(false)
        announce('Error loading offline page', 'assertive')
      }
    }

    loadOfflinePageData()

    // Check if we're back online
    const checkOnline = () => {
      if (navigator.onLine) {
        window.location.href = '/'
      }
    }

    window.addEventListener('online', checkOnline)
    return () => window.removeEventListener('online', checkOnline)
  }, [announce])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    if (navigator.onLine) {
      window.location.href = '/'
    } else {
      window.location.reload()
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Card */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
              <WifiOff className="w-10 h-10 text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-white">You&apos;re Offline</CardTitle>
            <CardDescription className="text-gray-400">
              Don&apos;t worry, your work is safe. FreeFlow works offline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <Database className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Cached Data</p>
                <p className="text-sm font-medium text-white">Available</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Pending Sync</p>
                <p className="text-sm font-medium text-white">{pendingChanges} items</p>
              </div>
            </div>

            {/* Last Sync Info */}
            {lastSyncTime && (
              <div className="bg-gray-700/30 rounded-lg p-3 flex items-center gap-3">
                <Cloud className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Last synced</p>
                  <p className="text-sm text-white">{lastSyncTime}</p>
                </div>
              </div>
            )}

            {/* Sync Progress (if there are pending changes) */}
            {pendingChanges > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Changes queued for sync</span>
                  <span>{pendingChanges} pending</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-gray-500">
                  Changes will sync automatically when you&apos;re back online
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={handleGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleRetry}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${retryCount > 0 ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">View Projects</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Edit Tasks</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Create Invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <div className="text-center text-xs text-gray-500">
          <p>Most features work offline. Your changes sync automatically.</p>
        </div>
      </div>
    </div>
  )
} 