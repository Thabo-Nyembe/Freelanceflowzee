/**
 * Analytics utilities for tracking API usage, metrics, and costs
 */

interface ApiUsageLog {
  endpoint: string
  method: string
  userId?: string
  timestamp: Date
  ip?: string
  statusCode?: number
  latencyMs?: number
}

interface MetricData {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: Date
}

interface CostData {
  service: string
  amount: number
  currency?: string
  userId?: string
  metadata?: Record<string, unknown>
}

// In-memory storage for development (replace with real analytics in production)
const usageLogs: ApiUsageLog[] = []
const metrics: MetricData[] = []
const costs: CostData[] = []

/**
 * Logs API usage for analytics
 */
export async function logApiUsage(log: ApiUsageLog): Promise<void> {
  // In production, send to analytics service
  usageLogs.push({
    ...log,
    timestamp: log.timestamp || new Date()
  })

  // Keep only last 10000 logs in memory
  if (usageLogs.length > 10000) {
    usageLogs.splice(0, usageLogs.length - 10000)
  }
}

/**
 * Tracks a metric
 */
export async function trackMetric(data: MetricData): Promise<void> {
  metrics.push({
    ...data,
    timestamp: data.timestamp || new Date()
  })

  // Keep only last 10000 metrics in memory
  if (metrics.length > 10000) {
    metrics.splice(0, metrics.length - 10000)
  }
}

/**
 * Tracks cost/spend
 */
export async function trackCost(data: CostData): Promise<void> {
  costs.push({
    ...data,
    currency: data.currency || 'USD'
  })

  // Keep only last 10000 cost entries in memory
  if (costs.length > 10000) {
    costs.splice(0, costs.length - 10000)
  }
}

/**
 * Gets API usage stats
 */
export function getApiUsageStats(userId?: string): {
  totalRequests: number
  avgLatency: number
  errorRate: number
} {
  const filtered = userId
    ? usageLogs.filter(log => log.userId === userId)
    : usageLogs

  const totalRequests = filtered.length
  const avgLatency = filtered.reduce((sum, log) => sum + (log.latencyMs || 0), 0) / totalRequests || 0
  const errors = filtered.filter(log => log.statusCode && log.statusCode >= 400).length
  const errorRate = (errors / totalRequests) * 100 || 0

  return { totalRequests, avgLatency, errorRate }
}

/**
 * Gets metric summary
 */
export function getMetricSummary(name: string): {
  count: number
  sum: number
  avg: number
  min: number
  max: number
} {
  const filtered = metrics.filter(m => m.name === name)

  if (filtered.length === 0) {
    return { count: 0, sum: 0, avg: 0, min: 0, max: 0 }
  }

  const values = filtered.map(m => m.value)

  return {
    count: filtered.length,
    sum: values.reduce((a, b) => a + b, 0),
    avg: values.reduce((a, b) => a + b, 0) / filtered.length,
    min: Math.min(...values),
    max: Math.max(...values)
  }
}

/**
 * Gets total costs
 */
export function getTotalCosts(userId?: string, service?: string): number {
  let filtered = costs

  if (userId) {
    filtered = filtered.filter(c => c.userId === userId)
  }

  if (service) {
    filtered = filtered.filter(c => c.service === service)
  }

  return filtered.reduce((sum, c) => sum + c.amount, 0)
}

/**
 * Clears all analytics data (for testing)
 */
export function clearAnalytics(): void {
  usageLogs.length = 0
  metrics.length = 0
  costs.length = 0
}
