/**
 * Metrics collection and reporting utilities
 */

interface Metric {
  name: string
  value: number
  labels?: Record<string, string>
  timestamp: number
}

interface MetricsConfig {
  enabled: boolean
  prefix: string
  flushInterval: number
}

// In-memory storage for development
const metricsBuffer: Metric[] = []
const counters = new Map<string, number>()
const gauges = new Map<string, number>()
const histograms = new Map<string, number[]>()

const config: MetricsConfig = {
  enabled: true,
  prefix: 'kazi_',
  flushInterval: 60000
}

/**
 * Metrics singleton for tracking application metrics
 */
export const metrics = {
  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1, labels?: Record<string, string>): void {
    if (!config.enabled) return

    const key = buildKey(name, labels)
    const current = counters.get(key) || 0
    counters.set(key, current + value)

    metricsBuffer.push({
      name: `${config.prefix}${name}`,
      value: current + value,
      labels,
      timestamp: Date.now()
    })
  },

  /**
   * Set a gauge value
   */
  gauge(name: string, value: number, labels?: Record<string, string>): void {
    if (!config.enabled) return

    const key = buildKey(name, labels)
    gauges.set(key, value)

    metricsBuffer.push({
      name: `${config.prefix}${name}`,
      value,
      labels,
      timestamp: Date.now()
    })
  },

  /**
   * Record a histogram value
   */
  histogram(name: string, value: number, labels?: Record<string, string>): void {
    if (!config.enabled) return

    const key = buildKey(name, labels)
    const values = histograms.get(key) || []
    values.push(value)
    histograms.set(key, values)

    metricsBuffer.push({
      name: `${config.prefix}${name}`,
      value,
      labels,
      timestamp: Date.now()
    })
  },

  /**
   * Record request duration
   */
  timing(name: string, durationMs: number, labels?: Record<string, string>): void {
    this.histogram(`${name}_duration_ms`, durationMs, labels)
  },

  /**
   * Start a timer and return a function to stop it
   */
  startTimer(name: string, labels?: Record<string, string>): () => number {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      this.timing(name, duration, labels)
      return duration
    }
  },

  /**
   * Get current counter value
   */
  getCounter(name: string, labels?: Record<string, string>): number {
    const key = buildKey(name, labels)
    return counters.get(key) || 0
  },

  /**
   * Get current gauge value
   */
  getGauge(name: string, labels?: Record<string, string>): number | undefined {
    const key = buildKey(name, labels)
    return gauges.get(key)
  },

  /**
   * Get histogram statistics
   */
  getHistogramStats(name: string, labels?: Record<string, string>): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const key = buildKey(name, labels)
    const values = histograms.get(key)

    if (!values || values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      count: sorted.length,
      sum,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99)
    }
  },

  /**
   * Get all metrics
   */
  getAll(): {
    counters: Record<string, number>
    gauges: Record<string, number>
    histograms: Record<string, number[]>
  } {
    return {
      counters: Object.fromEntries(counters),
      gauges: Object.fromEntries(gauges),
      histograms: Object.fromEntries(histograms)
    }
  },

  /**
   * Clear all metrics
   */
  clear(): void {
    counters.clear()
    gauges.clear()
    histograms.clear()
    metricsBuffer.length = 0
  },

  /**
   * Flush metrics buffer
   */
  flush(): Metric[] {
    const flushed = [...metricsBuffer]
    metricsBuffer.length = 0
    return flushed
  }
}

// Helper functions
function buildKey(name: string, labels?: Record<string, string>): string {
  if (!labels) return name

  const labelStr = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(',')

  return `${name}{${labelStr}}`
}

function percentile(sorted: number[], p: number): number {
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

// Export individual metric functions for convenience
export const increment = metrics.increment.bind(metrics)
export const gauge = metrics.gauge.bind(metrics)
export const histogram = metrics.histogram.bind(metrics)
export const timing = metrics.timing.bind(metrics)
export const startTimer = metrics.startTimer.bind(metrics)

/**
 * Logger singleton for consistent logging
 */
export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }))
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }))
    }
  },

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString() }))
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({ level: 'debug', message, ...meta, timestamp: new Date().toISOString() }))
    }
  }
}
