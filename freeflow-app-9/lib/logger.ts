/**
 * Centralized Logging Utility
 *
 * Provides environment-aware logging with structured output
 * and configurable log levels for production readiness.
 *
 * Usage:
 * import { logger } from '@/lib/logger'
 *
 * logger.info('User logged in', { userId: '123' })
 * logger.error('API failed', { error, endpoint: '/api/users' })
 * logger.debug('Processing data', { count: items.length })
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogContext = Record<string, any>

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  includeTimestamp: boolean
  includeContext: boolean
  pretty: boolean
}

// Default configuration based on environment
const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  includeTimestamp: true,
  includeContext: true,
  pretty: process.env.NODE_ENV !== 'production'
}

export class Logger {
  private config: LoggerConfig
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return this.levelPriority[level] >= this.levelPriority[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const parts: string[] = []

    if (this.config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    parts.push(`[${level.toUpperCase()}]`)
    parts.push(message)

    return parts.join(' ')
  }

  private getLogEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }
    return emojis[level]
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)
    const emoji = this.getLogEmoji(level)

    // Select appropriate console method
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         console.log

    if (this.config.pretty) {
      consoleMethod(`${emoji} ${formattedMessage}`, context || '')
    } else {
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(this.config.includeContext && context ? { context } : {})
      }
      consoleMethod(JSON.stringify(logData))
    }
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  /**
   * Info level logging - general informational messages
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * Warning level logging - warning messages
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  /**
   * Error level logging - error messages
   */
  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  /**
   * Create a child logger with a specific context
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger(this.config)

    // Override log methods to include default context
    const originalLog = childLogger.log.bind(childLogger)
    childLogger.log = (level: LogLevel, message: string, context?: LogContext) => {
      originalLog(level, message, { ...defaultContext, ...context })
    }

    return childLogger
  }

  /**
   * Update logger configuration at runtime
   */
  configure(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Enable logging
   */
  enable() {
    this.config.enabled = true
  }

  /**
   * Disable logging
   */
  disable() {
    this.config.enabled = false
  }
}

// Export singleton instance
export const logger = new Logger()

// Export factory for creating custom loggers
export const createLogger = (config?: Partial<LoggerConfig>) => new Logger(config)

// Export convenience function for creating feature-specific loggers
export const createFeatureLogger = (feature: string) => {
  return logger.child({ feature })
}
