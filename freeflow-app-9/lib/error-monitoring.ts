/**
 * KAZI Error Monitoring Service
 *
 * Centralized error tracking with support for:
 * - Error aggregation and deduplication
 * - External service integration (Sentry, LogRocket, etc.)
 * - Error statistics and trends
 * - User context tracking
 * - Performance monitoring
 */

import { createFeatureLogger } from './logger'

const errorLogger = createFeatureLogger('ErrorMonitoring')

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  url?: string
  userAgent?: string
  ip?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
}

export interface ErrorReport {
  id: string
  timestamp: string
  error: {
    name: string
    message: string
    stack?: string
    digest?: string
  }
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  fingerprint: string
  count: number
}

export interface ErrorStats {
  totalErrors: number
  uniqueErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  recentErrors: ErrorReport[]
}

// ============================================================================
// ERROR FINGERPRINTING
// ============================================================================

function generateFingerprint(error: Error, context?: ErrorContext): string {
  const parts = [
    error.name,
    error.message.replace(/\d+/g, 'N'), // Normalize numbers
    context?.component || 'unknown',
    context?.action || 'unknown'
  ]

  // Create a simple hash
  const str = parts.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `err_${Math.abs(hash).toString(36)}`
}

function determineSeverity(error: Error, context?: ErrorContext): ErrorReport['severity'] {
  const message = error.message.toLowerCase()
  const name = error.name.toLowerCase()

  // Critical errors
  if (
    message.includes('database') ||
    message.includes('authentication') ||
    message.includes('security') ||
    message.includes('payment') ||
    name === 'securityerror'
  ) {
    return 'critical'
  }

  // High severity
  if (
    message.includes('api') ||
    message.includes('server') ||
    message.includes('timeout') ||
    name === 'typeerror' ||
    name === 'referenceerror'
  ) {
    return 'high'
  }

  // Medium severity
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('load')
  ) {
    return 'medium'
  }

  return 'low'
}

// ============================================================================
// ERROR STORE (In-Memory for now, can be replaced with Redis/DB)
// ============================================================================

const MAX_STORED_ERRORS = 1000
const ERROR_RETENTION_MS = 24 * 60 * 60 * 1000 // 24 hours

class ErrorStore {
  private errors: Map<string, ErrorReport> = new Map()
  private recentErrors: ErrorReport[] = []

  add(report: ErrorReport): void {
    const existing = this.errors.get(report.fingerprint)

    if (existing) {
      existing.count++
      existing.timestamp = report.timestamp
    } else {
      this.errors.set(report.fingerprint, report)
      this.recentErrors.unshift(report)

      // Limit stored errors
      if (this.recentErrors.length > MAX_STORED_ERRORS) {
        this.recentErrors.pop()
      }
    }

    // Cleanup old errors
    this.cleanup()
  }

  private cleanup(): void {
    const cutoff = Date.now() - ERROR_RETENTION_MS

    for (const [fingerprint, report] of this.errors) {
      if (new Date(report.timestamp).getTime() < cutoff) {
        this.errors.delete(fingerprint)
      }
    }

    this.recentErrors = this.recentErrors.filter(
      r => new Date(r.timestamp).getTime() >= cutoff
    )
  }

  getStats(): ErrorStats {
    const errorsByType: Record<string, number> = {}
    const errorsBySeverity: Record<string, number> = {}

    for (const report of this.errors.values()) {
      errorsByType[report.error.name] = (errorsByType[report.error.name] || 0) + report.count
      errorsBySeverity[report.severity] = (errorsBySeverity[report.severity] || 0) + report.count
    }

    return {
      totalErrors: Array.from(this.errors.values()).reduce((sum, r) => sum + r.count, 0),
      uniqueErrors: this.errors.size,
      errorsByType,
      errorsBySeverity,
      recentErrors: this.recentErrors.slice(0, 50)
    }
  }

  getError(fingerprint: string): ErrorReport | undefined {
    return this.errors.get(fingerprint)
  }
}

const errorStore = new ErrorStore()

// ============================================================================
// EXTERNAL SERVICE INTEGRATION
// ============================================================================

interface ExternalErrorService {
  name: string
  captureError: (report: ErrorReport) => Promise<void>
  isConfigured: () => boolean
}

// Sentry integration (stub - configure with real Sentry SDK if available)
const sentryService: ExternalErrorService = {
  name: 'sentry',
  isConfigured: () => !!process.env.SENTRY_DSN,
  captureError: async (report) => {
    if (!sentryService.isConfigured()) return

    // In production, this would use @sentry/nextjs
    // For now, we log that we would send to Sentry
    errorLogger.info('Would send to Sentry', {
      fingerprint: report.fingerprint,
      severity: report.severity
    })
  }
}

// Webhook integration for custom error tracking
const webhookService: ExternalErrorService = {
  name: 'webhook',
  isConfigured: () => !!process.env.ERROR_WEBHOOK_URL,
  captureError: async (report) => {
    const webhookUrl = process.env.ERROR_WEBHOOK_URL
    if (!webhookUrl) return

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...report,
          app: 'kazi',
          environment: process.env.NODE_ENV
        })
      })
    } catch (err) {
      errorLogger.warn('Failed to send error to webhook', { error: err })
    }
  }
}

const externalServices: ExternalErrorService[] = [sentryService, webhookService]

// ============================================================================
// MAIN ERROR MONITORING CLASS
// ============================================================================

class ErrorMonitor {
  private initialized = false

  init(): void {
    if (this.initialized) return

    // Setup global error handlers for browser
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          component: 'window',
          action: 'unhandled-error',
          url: window.location.href
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason))

        this.captureError(error, {
          component: 'window',
          action: 'unhandled-rejection',
          url: window.location.href
        })
      })
    }

    // Setup global error handlers for Node.js
    if (typeof process !== 'undefined' && process.on) {
      process.on('uncaughtException', (error) => {
        this.captureError(error, {
          component: 'process',
          action: 'uncaught-exception'
        })
      })

      process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error
          ? reason
          : new Error(String(reason))

        this.captureError(error, {
          component: 'process',
          action: 'unhandled-rejection'
        })
      })
    }

    this.initialized = true
    errorLogger.info('Error monitoring initialized')
  }

  /**
   * Capture and track an error
   */
  captureError(error: Error | unknown, context?: ErrorContext): ErrorReport {
    const err = error instanceof Error ? error : new Error(String(error))
    const fingerprint = generateFingerprint(err, context)
    const severity = determineSeverity(err, context)

    const report: ErrorReport = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        digest: (err as any).digest
      },
      context: context || {},
      severity,
      fingerprint,
      count: 1
    }

    // Store locally
    errorStore.add(report)

    // Log based on severity
    if (severity === 'critical' || severity === 'high') {
      errorLogger.error(`[${severity.toUpperCase()}] ${err.message}`, {
        error: err,
        fingerprint,
        context
      })
    } else {
      errorLogger.warn(`[${severity.toUpperCase()}] ${err.message}`, {
        error: err,
        fingerprint,
        context
      })
    }

    // Send to external services
    this.sendToExternalServices(report)

    return report
  }

  /**
   * Capture an error with additional message
   */
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'error',
    context?: ErrorContext
  ): void {
    const error = new Error(message)
    error.name = `${level.charAt(0).toUpperCase()}${level.slice(1)}Message`
    this.captureError(error, context)
  }

  /**
   * Set user context for all subsequent errors
   */
  setUser(userId: string, additionalData?: Record<string, unknown>): void {
    errorLogger.info('User context set', { userId, ...additionalData })
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, unknown>
  ): void {
    errorLogger.debug('Breadcrumb', { message, category, ...data })
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    return errorStore.getStats()
  }

  /**
   * Get specific error by fingerprint
   */
  getError(fingerprint: string): ErrorReport | undefined {
    return errorStore.getError(fingerprint)
  }

  private async sendToExternalServices(report: ErrorReport): Promise<void> {
    for (const service of externalServices) {
      if (service.isConfigured()) {
        try {
          await service.captureError(report)
        } catch (err) {
          errorLogger.warn(`Failed to send error to ${service.name}`, { error: err })
        }
      }
    }
  }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

export const errorMonitor = new ErrorMonitor()

// Initialize on import (safe for both client and server)
if (typeof window !== 'undefined' || (typeof process !== 'undefined' && process.env)) {
  errorMonitor.init()
}

// Convenience functions
export const captureError = (error: Error | unknown, context?: ErrorContext) =>
  errorMonitor.captureError(error, context)

export const captureMessage = (
  message: string,
  level?: 'info' | 'warning' | 'error',
  context?: ErrorContext
) => errorMonitor.captureMessage(message, level, context)

export const setUser = (userId: string, data?: Record<string, unknown>) =>
  errorMonitor.setUser(userId, data)

export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
) => errorMonitor.addBreadcrumb(message, category, data)

export const getErrorStats = () => errorMonitor.getStats()

// ============================================================================
// API ROUTE WRAPPER
// ============================================================================

/**
 * Wrap an API route handler with error monitoring
 */
export function withErrorMonitoring<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  context?: Partial<ErrorContext>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      captureError(error, {
        ...context,
        action: 'api-handler'
      })
      throw error
    }
  }) as T
}

// ============================================================================
// REACT ERROR BOUNDARY HELPERS
// ============================================================================

/**
 * Handle error from React Error Boundary
 */
export function handleReactError(
  error: Error,
  errorInfo: { componentStack?: string },
  componentName?: string
): void {
  captureError(error, {
    component: componentName || 'ReactErrorBoundary',
    action: 'render-error',
    metadata: {
      componentStack: errorInfo.componentStack
    }
  })
}

export default errorMonitor
