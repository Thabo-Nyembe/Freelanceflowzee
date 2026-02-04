/**
 * Simple lightweight logger for API routes
 * Optimized for fast compilation
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export const createSimpleLogger = (prefix: string) => {
  const log = (level: LogLevel, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      const logData = data ? ` ${JSON.stringify(data)}` : ''
      console.log(`[${timestamp}] [${level}] ${prefix}: ${message}${logData}`)
    }
  }

  return {
    info: (message: string, data?: any) => log('info', message, data),
    warn: (message: string, data?: any) => log('warn', message, data),
    error: (message: string, data?: any) => log('error', message, data),
    debug: (message: string, data?: any) => log('debug', message, data),
  }
}
