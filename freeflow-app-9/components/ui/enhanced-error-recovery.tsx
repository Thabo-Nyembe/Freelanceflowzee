'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Bug,
  Wifi,
  WifiOff,
  Server,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  X,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ErrorInfo {
  code?: string
  message: string
  stack?: string
  timestamp?: string
  userAgent?: string
  url?: string
  userId?: string
}

interface RecoveryAction {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  variant?: 'default' | 'outline' | 'destructive'
  action: () => void | Promise<void>
  shortcut?: string
}

interface EnhancedErrorProps {
  error: ErrorInfo
  errorBoundary?: boolean
  showDetails?: boolean
  showRecovery?: boolean
  customActions?: RecoveryAction[]
  onRetry?: () => void
  onReport?: (error: ErrorInfo) => void
  onDismiss?: () => void
  className?: string
}

// Error type classification
const getErrorType = (error: ErrorInfo): 'network' | 'auth' | 'server' | 'client' | 'unknown' => {
  const message = error.message.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network'
  }
  if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('auth')) {
    return 'auth'
  }
  if (message.includes('500') || message.includes('server') || message.includes('internal')) {
    return 'server'
  }
  if (error.code?.startsWith('4') || message.includes('not found') || message.includes('bad request')) {
    return 'client'
  }
  return 'unknown'
}

// Get error-specific suggestions
const getErrorSuggestions = (errorType: string): string[] => {
  switch (errorType) {
    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN or proxy if using one',
        'Clear browser cache and cookies'
      ]
    case 'auth':
      return [
        'Try logging out and back in',
        'Check if your session has expired',
        'Clear browser cookies',
        'Contact support if issue persists'
      ]
    case 'server':
      return [
        'The server is temporarily unavailable',
        'Try again in a few minutes',
        'Check our status page for updates',
        'Contact support if error continues'
      ]
    case 'client':
      return [
        'Check the URL for typos',
        'Try navigating back and forward',
        'Clear browser cache',
        'Try a different browser'
      ]
    default:
      return [
        'Try refreshing the page',
        'Check your internet connection',
        'Clear browser cache',
        'Contact support if issue persists'
      ]
  }
}

// Auto-retry hook
function useAutoRetry(onRetry: () => void, maxAttempts = 3, delay = 2000) {
  const [attempts, setAttempts] = React.useState(0)
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [nextRetryIn, setNextRetryIn] = React.useState(0)
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const countdownRef = React.useRef<NodeJS.Timeout>()

  const startRetry = React.useCallback(() => {
    if (attempts >= maxAttempts) return

    setIsRetrying(true)
    setNextRetryIn(delay / 1000)

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setNextRetryIn(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Actual retry
    timeoutRef.current = setTimeout(() => {
      setAttempts(prev => prev + 1)
      setIsRetrying(false)
      setNextRetryIn(0)
      onRetry()
    }, delay)
  }, [attempts, maxAttempts, delay, onRetry])

  const resetRetry = React.useCallback(() => {
    setAttempts(0)
    setIsRetrying(false)
    setNextRetryIn(0)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  return {
    attempts,
    maxAttempts,
    isRetrying,
    nextRetryIn,
    canRetry: attempts < maxAttempts,
    startRetry,
    resetRetry
  }
}

// Network status hook
function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [connectionSpeed, setConnectionSpeed] = React.useState<'slow' | 'fast' | 'unknown'>('unknown')

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection speed
    const connection = (navigator as Record<string, unknown>).connection || (navigator as Record<string, unknown>).mozConnection || (navigator as Record<string, unknown>).webkitConnection
    if (connection) {
      const updateSpeed = () => {
        if (connection.effectiveType === '4g') {
          setConnectionSpeed('fast')
        } else if (connection.effectiveType === '3g' || connection.effectiveType === '2g') {
          setConnectionSpeed('slow')
        } else {
          setConnectionSpeed('unknown')
        }
      }
      
      updateSpeed()
      connection.addEventListener('change', updateSpeed)
      
      return () => {
        connection.removeEventListener('change', updateSpeed)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, connectionSpeed }
}

export function EnhancedError({
  error,
  errorBoundary = false,
  showDetails = false,
  showRecovery = true,
  customActions,
  onRetry,
  onReport,
  onDismiss,
  className
}: EnhancedErrorProps) {
  const [showFullDetails, setShowFullDetails] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const errorType = getErrorType(error)
  const suggestions = getErrorSuggestions(errorType)
  const { isOnline, connectionSpeed } = useNetworkStatus()
  
  const retrySystem = useAutoRetry(() => {
    onRetry?.()
  }, 3, 5000)

  // Default recovery actions
  const defaultActions: RecoveryAction[] = [
    {
      id: 'retry',
      label: 'Try Again',
      description: 'Attempt to reload the failed operation',
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => {
        retrySystem.resetRetry()
        onRetry?.()
      },
      shortcut: 'R'
    },
    {
      id: 'home',
      label: 'Go Home',
      description: 'Return to the dashboard',
      icon: <Home className="h-4 w-4" />,
      variant: 'outline' as const,
      action: () => window.location.href = '/dashboard',
      shortcut: 'H'
    },
    {
      id: 'back',
      label: 'Go Back',
      description: 'Return to the previous page',
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      action: () => window.history.back(),
      shortcut: 'B'
    },
    {
      id: 'report',
      label: 'Report Issue',
      description: 'Send error report to support team',
      icon: <Bug className="h-4 w-4" />,
      variant: 'outline' as const,
      action: () => onReport?.(error),
      shortcut: 'Shift+R'
    }
  ]

  const actions = customActions || defaultActions

  // Copy error details
  const copyErrorDetails = React.useCallback(async () => {
    const details = `
Error: ${error.message}
Code: ${error.code || 'N/A'}
Time: ${error.timestamp || new Date().toISOString()}
URL: ${error.url || window.location.href}
User Agent: ${navigator.userAgent}
${error.stack ? `\nStack:\n${error.stack}` : ''}
    `.trim()

    try {
      await navigator.clipboard.writeText(details)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [error])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const action = actions.find(a => a.shortcut?.toLowerCase() === e.key.toLowerCase())
        if (action) {
          e.preventDefault()
          action.action()
        }
      }
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        onReport?.(error)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actions, error, onReport])

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network': return <WifiOff className="h-8 w-8 text-orange-500" />
      case 'auth': return <Shield className="h-8 w-8 text-red-500" />
      case 'server': return <Server className="h-8 w-8 text-red-500" />
      case 'client': return <AlertCircle className="h-8 w-8 text-yellow-500" />
      default: return <AlertTriangle className="h-8 w-8 text-red-500" />
    }
  }

  const getErrorTitle = () => {
    switch (errorType) {
      case 'network': return 'Connection Problem'
      case 'auth': return 'Authentication Required'
      case 'server': return 'Server Error'
      case 'client': return 'Page Not Found'
      default: return 'Something Went Wrong'
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("max-w-2xl mx-auto p-6", className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Error Display */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {getErrorIcon()}
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {getErrorTitle()}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {error.message}
              </p>
              
              {/* Error metadata */}
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
                {error.code && (
                  <Badge variant="outline">
                    Code: {error.code}
                  </Badge>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                {!isOnline && (
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline</span>
                  </Badge>
                )}
                {connectionSpeed === 'slow' && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Wifi className="h-3 w-3" />
                    <span>Slow Connection</span>
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Auto-retry status */}
              {onRetry && retrySystem.isRetrying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Auto-retry in progress
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      Attempt {retrySystem.attempts + 1} of {retrySystem.maxAttempts}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={((5 - retrySystem.nextRetryIn) / 5) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Next retry in {retrySystem.nextRetryIn} seconds
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Recovery Actions */}
              {showRecovery && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    What would you like to do?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {actions.map((action) => (
                      <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={action.variant || 'default'}
                            onClick={action.action}
                            disabled={retrySystem.isRetrying && action.id === 'retry'}
                            className="flex items-center space-x-2 h-auto p-3 justify-start"
                            data-testid={`error-action-${action.id}`}
                          >
                            {action.icon}
                            <div className="text-left">
                              <p className="font-medium">{action.label}</p>
                              {action.description && (
                                <p className="text-xs opacity-75">{action.description}</p>
                              )}
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {action.shortcut && (
                            <p>Press Alt+{action.shortcut}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Troubleshooting Tips</span>
                  </h4>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Details (Collapsible) */}
          {(showDetails || errorBoundary) && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                >
                  <span className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Technical Details</span>
                  </span>
                  <motion.div
                    animate={{ rotate: showFullDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-3 bg-gray-50 dark:bg-gray-900">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          Error Information
                        </h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyErrorDetails}
                          className="flex items-center space-x-1"
                        >
                          {copied ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Message:</span>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{error.message}</p>
                        </div>
                        
                        {error.code && (
                          <div>
                            <span className="font-medium">Error Code:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{error.code}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium">Timestamp:</span>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {error.timestamp || new Date().toISOString()}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium">URL:</span>
                          <p className="text-gray-600 dark:text-gray-400 mt-1 break-all">
                            {error.url || window.location.href}
                          </p>
                        </div>
                        
                        {error.stack && (
                          <div>
                            <span className="font-medium">Stack Trace:</span>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-32">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Quick Help Links */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <ExternalLink className="h-3 w-3" />
              <span>Help Center</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>Contact Support</span>
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class EnhancedErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} />
      }

      return (
        <EnhancedError
          error={{
            message: this.state.error?.message || 'An unexpected error occurred',
            stack: this.state.error?.stack,
            timestamp: new Date().toISOString()
          }}
          errorBoundary={true}
          onRetry={() => {
            this.setState({ hasError: false, error: undefined, errorInfo: undefined })
          }}
          onReport={(error) => {
            // Send error to monitoring service
            fetch('/api/errors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: error.message, timestamp: new Date().toISOString() })
            }).catch(() => { /* Silent fail for error reporting */ })
          }}
        />
      )
    }

    return this.props.children
  }
}

export default EnhancedError
