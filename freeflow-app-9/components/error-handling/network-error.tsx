'use client

import { useEffect, useState } from 'react
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function NetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

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
        <Alert variant="destructive" className="flex items-center">
          <WifiOff className="h-4 w-4 mr-2" />
          <div className="flex-1">
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription>
              You are currently offline. Please check your internet connection.
            </AlertDescription>
          </div>
          <Button
            variant="outline
            size="icon
            className="ml-2
            onClick={handleRetry}"
            data-testid="network-retry-button
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Alert>
      </div>
    )
  }

  return null
} 