/**
 * Production-Grade Logging Utility
 *
 * Provides structured JSON logging with:
 * - Request ID tracking for correlation
 * - User ID tracking for audit trails
 * - Performance timing
 * - Error stack traces
 * - Environment-aware configuration
 *
 * Usage:
 * import { logger, createRequestLogger } from '@/lib/logger'
 *
 * // Basic usage
 * logger.info('User logged in', { userId: '123' })
 * logger.error('API failed', { error, endpoint: '/api/users' })
 *
 * // Request-scoped logging
 * const reqLogger = createRequestLogger(requestId, userId)
 * reqLogger.info('Processing request', { action: 'create' })
 */

import { randomUUID } from 'crypto'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
  requestId?: string
  userId?: string
  duration?: number
  error?: Error | unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  service: string
  environment: string
  requestId?: string
  userId?: string
  duration?: number
  context?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  service: string
  environment: string
  pretty: boolean
  includeStack: boolean
}

// Environment-based configuration
const getDefaultConfig = (): LoggerConfig => {
  const env = process.env.NODE_ENV || 'development'
  const isProduction = env === 'production'

  return {
    // Disable logging in development by default to prevent console spam
    // Set LOG_ENABLED=true to enable logging
    enabled: process.env.LOG_ENABLED === 'true',
    level: (process.env.LOG_LEVEL as LogLevel) || (isProduction ? 'info' : 'warn'),
    service: process.env.SERVICE_NAME || 'freeflow-kazi',
    environment: env,
    pretty: !isProduction,
    includeStack: !isProduction
  }
}

export class Logger {
  private config: LoggerConfig
  private defaultContext: Record<string, unknown> = {}

  private static readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...getDefaultConfig(), ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return Logger.levelPriority[level] >= Logger.levelPriority[this.config.level]
  }

  private formatError(err: unknown): LogEntry['error'] | undefined {
    if (!err) return undefined

    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: this.config.includeStack ? err.stack : undefined
      }
    }

    return {
      name: 'UnknownError',
      message: String(err)
    }
  }

  private buildLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    const { error, requestId, userId, duration, ...restContext } = context || {}

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.config.service,
      environment: this.config.environment
    }

    // Add optional fields only if present
    if (requestId || this.defaultContext.requestId) {
      entry.requestId = (requestId || this.defaultContext.requestId) as string
    }

    if (userId || this.defaultContext.userId) {
      entry.userId = (userId || this.defaultContext.userId) as string
    }

    if (duration !== undefined) {
      entry.duration = duration
    }

    // Merge contexts
    const mergedContext = { ...this.defaultContext, ...restContext }
    if (Object.keys(mergedContext).length > 0) {
      // Remove requestId and userId from context since they're top-level
      const { requestId: _, userId: __, ...cleanContext } = mergedContext
      if (Object.keys(cleanContext).length > 0) {
        entry.context = cleanContext
      }
    }

    if (error) {
      entry.error = this.formatError(error)
    }

    return entry
  }

  private output(level: LogLevel, entry: LogEntry): void {
    const outputFn = level === 'error' ? console.error
      : level === 'warn' ? console.warn
      : console.log

    if (this.config.pretty) {
      const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level]
      const color = { debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' }[level]
      const reset = '\x1b[0m'

      let output = `${emoji} ${color}[${entry.timestamp}] [${level.toUpperCase()}]${reset} ${entry.message}`

      if (entry.requestId) output += ` ${'\x1b[90m'}rid=${entry.requestId}${reset}`
      if (entry.userId) output += ` ${'\x1b[90m'}uid=${entry.userId}${reset}`
      if (entry.duration !== undefined) output += ` ${'\x1b[90m'}${entry.duration}ms${reset}`

      outputFn(output)

      if (entry.context && Object.keys(entry.context).length > 0) {
        outputFn('  Context:', entry.context)
      }

      if (entry.error) {
        outputFn('  Error:', entry.error.message)
        if (entry.error.stack) {
          outputFn('  Stack:', entry.error.stack)
        }
      }
    } else {
      // JSON output for production log aggregation
      outputFn(JSON.stringify(entry))
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return
    const entry = this.buildLogEntry(level, message, context)
    this.output(level, entry)
  }

  /**
   * Debug level - detailed information for debugging
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Warning level - potential issues that aren't errors
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Error level - error conditions
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config)
    childLogger.defaultContext = { ...this.defaultContext, ...defaultContext }
    return childLogger
  }

  /**
   * Measure execution time of an async function
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      this.info(`${label} completed`, { ...context, duration: Date.now() - start })
      return result
    } catch (error) {
      this.error(`${label} failed`, { ...context, duration: Date.now() - start, error })
      throw error
    }
  }

  /**
   * Measure execution time of a sync function
   */
  timeSync<T>(label: string, fn: () => T, context?: LogContext): T {
    const start = Date.now()
    try {
      const result = fn()
      this.info(`${label} completed`, { ...context, duration: Date.now() - start })
      return result
    } catch (error) {
      this.error(`${label} failed`, { ...context, duration: Date.now() - start, error })
      throw error
    }
  }

  /**
   * Update configuration at runtime
   */
  configure(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.config.enabled = true
  }

  /**
   * Disable logging
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config }
  }
}

// Singleton instance
export const logger = new Logger()

// Factory for custom loggers
export const createLogger = (config?: Partial<LoggerConfig>): Logger =>
  new Logger(config)

// Create feature-specific logger
export const createFeatureLogger = (feature: string): Logger =>
  logger.child({ feature })

// Create request-scoped logger with correlation ID
export const createRequestLogger = (
  requestId?: string,
  userId?: string
): Logger => {
  return logger.child({
    requestId: requestId || randomUUID(),
    userId
  })
}

// Generate a new request ID
export const generateRequestId = (): string => randomUUID()

// Export default for convenience
export default logger

// ============================================
// API REQUEST LOGGING MIDDLEWARE HELPERS
// ============================================

export interface RequestLogData {
  method: string
  url: string
  userAgent?: string
  ip?: string
  userId?: string
  duration?: number
  status?: number
}

/**
 * Log API request start
 */
export function logRequestStart(
  reqLogger: Logger,
  data: Pick<RequestLogData, 'method' | 'url' | 'userAgent' | 'ip'>
): void {
  reqLogger.info('Request started', {
    method: data.method,
    url: data.url,
    userAgent: data.userAgent,
    ip: data.ip
  })
}

/**
 * Log API request completion
 */
export function logRequestEnd(
  reqLogger: Logger,
  data: Pick<RequestLogData, 'method' | 'url' | 'status' | 'duration'>
): void {
  const level = data.status && data.status >= 400 ? 'warn' : 'info'
  reqLogger[level]('Request completed', {
    method: data.method,
    url: data.url,
    status: data.status,
    duration: data.duration
  })
}

/**
 * Log API request error
 */
export function logRequestError(
  reqLogger: Logger,
  data: Pick<RequestLogData, 'method' | 'url' | 'duration'>,
  error: unknown
): void {
  reqLogger.error('Request failed', {
    method: data.method,
    url: data.url,
    duration: data.duration,
    error
  })
}
