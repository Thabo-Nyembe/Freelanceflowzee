'use client'

import { useCallback } from 'react'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  level?: LogLevel
  context?: Record<string, any>
}

/**
 * Logger hook for feature logging and debugging
 */
export function useLogger(namespace: string = 'app') {
  const log = useCallback((message: string, options: LogOptions = {}) => {
    const { level = 'info', context } = options
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${namespace}] [${level.toUpperCase()}]`

    const logFn = level === 'error' ? console.error
      : level === 'warn' ? console.warn
      : level === 'debug' ? console.debug
      : console.log

    if (context) {
      logFn(`${prefix} ${message}`, context)
    } else {
      logFn(`${prefix} ${message}`)
    }
  }, [namespace])

  const debug = useCallback((message: string, context?: Record<string, any>) => {
    log(message, { level: 'debug', context })
  }, [log])

  const info = useCallback((message: string, context?: Record<string, any>) => {
    log(message, { level: 'info', context })
  }, [log])

  const warn = useCallback((message: string, context?: Record<string, any>) => {
    log(message, { level: 'warn', context })
  }, [log])

  const error = useCallback((message: string, context?: Record<string, any>) => {
    log(message, { level: 'error', context })
  }, [log])

  return { log, debug, info, warn, error }
}
