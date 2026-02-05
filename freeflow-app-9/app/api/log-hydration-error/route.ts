import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

/**
 * Hydration Error Logging API
 *
 * Captures and logs React hydration errors for debugging:
 * - Client/server mismatch detection
 * - Error aggregation and deduplication
 * - Stack trace capture
 * - User context collection
 * - Severity classification
 */

const logger = createSimpleLogger('HydrationErrorLog')

interface HydrationError {
  message: string
  stack?: string
  componentStack?: string
  url: string
  userAgent: string
  timestamp: string
  // Client/server diff info
  expectedHtml?: string
  actualHtml?: string
  // Component info
  componentName?: string
  props?: Record<string, unknown>
  // Session info
  sessionId?: string
  userId?: string
  // Additional context
  buildId?: string
  pathname?: string
  query?: Record<string, string>
}

interface AggregatedError {
  hash: string
  message: string
  count: number
  firstSeen: string
  lastSeen: string
  componentName?: string
  urls: string[]
  userAgents: string[]
}

// In-memory error aggregation (in production, use Redis or database)
const errorAggregation = new Map<string, AggregatedError>()
const ERROR_RETENTION_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<HydrationError>
    const {
      message,
      stack,
      componentStack,
      url,
      userAgent,
      expectedHtml,
      actualHtml,
      componentName,
      props,
      sessionId,
      userId,
      buildId,
      pathname,
      query,
    } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()

    // Create error hash for deduplication
    const errorHash = createErrorHash(message, componentName, pathname)

    // Aggregate error
    const existing = errorAggregation.get(errorHash)
    if (existing) {
      existing.count++
      existing.lastSeen = timestamp
      if (url && !existing.urls.includes(url)) {
        existing.urls.push(url)
      }
      if (userAgent && !existing.userAgents.includes(userAgent)) {
        existing.userAgents.push(userAgent)
      }
    } else {
      errorAggregation.set(errorHash, {
        hash: errorHash,
        message,
        count: 1,
        firstSeen: timestamp,
        lastSeen: timestamp,
        componentName,
        urls: url ? [url] : [],
        userAgents: userAgent ? [userAgent] : [],
      })
    }

    // Classify severity
    const severity = classifySeverity(message, componentName)

    // Log the error
    logger.error('Hydration error captured', {
      hash: errorHash,
      message,
      severity,
      componentName,
      pathname,
      url,
      userAgent: userAgent?.substring(0, 100),
      hasStack: !!stack,
      hasComponentStack: !!componentStack,
      hasDiff: !!(expectedHtml && actualHtml),
      buildId,
      sessionId,
      userId,
      timestamp,
    })

    // If high severity, log additional details
    if (severity === 'critical' || severity === 'high') {
      logger.error('High severity hydration error details', {
        hash: errorHash,
        stack: stack?.substring(0, 1000),
        componentStack: componentStack?.substring(0, 500),
        props: props ? JSON.stringify(props).substring(0, 500) : undefined,
        expectedHtml: expectedHtml?.substring(0, 200),
        actualHtml: actualHtml?.substring(0, 200),
      })
    }

    // Clean up old errors periodically
    cleanupOldErrors()

    return NextResponse.json({
      success: true,
      message: 'Hydration error logged',
      data: {
        hash: errorHash,
        severity,
        aggregatedCount: errorAggregation.get(errorHash)?.count || 1,
      },
    })
  } catch (error) {
    logger.error('Failed to log hydration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'summary'
    const severity = searchParams.get('severity')
    const component = searchParams.get('component')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (view === 'summary') {
      // Return summary statistics
      let errors = Array.from(errorAggregation.values())

      if (severity) {
        errors = errors.filter(e => classifySeverity(e.message, e.componentName) === severity)
      }
      if (component) {
        errors = errors.filter(e => e.componentName?.toLowerCase().includes(component.toLowerCase()))
      }

      const totalErrors = errors.reduce((sum, e) => sum + e.count, 0)
      const uniqueErrors = errors.length
      const topErrors = errors
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(e => ({
          hash: e.hash,
          message: e.message.substring(0, 100),
          count: e.count,
          severity: classifySeverity(e.message, e.componentName),
          componentName: e.componentName,
          firstSeen: e.firstSeen,
          lastSeen: e.lastSeen,
          affectedUrls: e.urls.length,
        }))

      const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      }

      errors.forEach(e => {
        const s = classifySeverity(e.message, e.componentName)
        severityCounts[s as keyof typeof severityCounts] += e.count
      })

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalErrors,
            uniqueErrors,
            severityCounts,
            retentionPeriod: '24 hours',
          },
          topErrors,
          lastUpdated: new Date().toISOString(),
        },
      })
    }

    if (view === 'details') {
      const hash = searchParams.get('hash')
      if (!hash) {
        return NextResponse.json(
          { success: false, error: 'Error hash required for details view' },
          { status: 400 }
        )
      }

      const error = errorAggregation.get(hash)
      if (!error) {
        return NextResponse.json(
          { success: false, error: 'Error not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...error,
          severity: classifySeverity(error.message, error.componentName),
        },
      })
    }

    if (view === 'components') {
      // Group errors by component
      const componentErrors: Record<string, { count: number; errors: string[] }> = {}

      errorAggregation.forEach(error => {
        const comp = error.componentName || 'Unknown'
        if (!componentErrors[comp]) {
          componentErrors[comp] = { count: 0, errors: [] }
        }
        componentErrors[comp].count += error.count
        componentErrors[comp].errors.push(error.message.substring(0, 50))
      })

      return NextResponse.json({
        success: true,
        data: {
          components: Object.entries(componentErrors)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([name, data]) => ({
              name,
              errorCount: data.count,
              uniqueErrors: data.errors.length,
            })),
        },
      })
    }

    if (view === 'timeline') {
      // Get errors by time
      const timeline: Record<string, number> = {}

      errorAggregation.forEach(error => {
        const hour = error.lastSeen.substring(0, 13) + ':00:00Z'
        timeline[hour] = (timeline[hour] || 0) + error.count
      })

      return NextResponse.json({
        success: true,
        data: {
          timeline: Object.entries(timeline)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([time, count]) => ({ time, count })),
        },
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid view parameter',
    }, { status: 400 })
  } catch (error) {
    logger.error('Hydration error GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hydration errors' },
      { status: 500 }
    )
  }
}

function createErrorHash(message: string, componentName?: string, pathname?: string): string {
  const str = `${message}|${componentName || ''}|${pathname || ''}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function classifySeverity(message: string, componentName?: string): 'critical' | 'high' | 'medium' | 'low' {
  const msg = message.toLowerCase()

  // Critical: Core functionality issues
  if (
    msg.includes('text content does not match') ||
    msg.includes('hydration failed') ||
    msg.includes('entire document')
  ) {
    // If in critical components
    const criticalComponents = ['layout', 'nav', 'header', 'auth', 'checkout', 'payment']
    if (componentName && criticalComponents.some(c => componentName.toLowerCase().includes(c))) {
      return 'critical'
    }
    return 'high'
  }

  // High: Significant mismatches
  if (
    msg.includes('expected server html') ||
    msg.includes('did not match') ||
    msg.includes('props') ||
    msg.includes('attribute')
  ) {
    return 'high'
  }

  // Medium: Minor mismatches
  if (
    msg.includes('style') ||
    msg.includes('class') ||
    msg.includes('date') ||
    msg.includes('time')
  ) {
    return 'medium'
  }

  // Low: Informational
  return 'low'
}

function cleanupOldErrors(): void {
  const now = Date.now()
  const cutoff = now - ERROR_RETENTION_MS

  errorAggregation.forEach((error, hash) => {
    const lastSeen = new Date(error.lastSeen).getTime()
    if (lastSeen < cutoff) {
      errorAggregation.delete(hash)
    }
  })
}
