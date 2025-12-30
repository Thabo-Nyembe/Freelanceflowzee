'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export function NetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState<any>(true)
  const [retryCount, setRetryCount] = useState<any>(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm" data-testid="network-error">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-4">
            <WifiOff className="h-4 w-4 mr-2 text-red-600" />
          <div className="flex-1">
              <CardTitle className="text-sm text-red-800">Network Error</CardTitle>
              <CardDescription className="text-xs text-red-700">
              You are currently offline. Please check your internet connection.
              </CardDescription>
          </div>
          <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleRetry}
              data-testid="network-retry-button"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
} 