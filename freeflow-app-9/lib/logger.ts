/**
 * @file Logger - Comprehensive logging utility for KAZI platform
 * @version 1.0.0
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured logging with JSON format in production
 * - Pretty console output in development
 * - File logging with rotation
 * - Context/metadata support
 * - Performance metrics
 * - Redaction of sensitive information
 */

import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { inspect } from 'util';
import chalk from 'chalk';

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  trace: 'gray',
};

// Add colors to Winston
winston.addColors(colors);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define which keys should be redacted in logs
const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'authorization', 'credential'];

/**
 * Redacts sensitive information from logs
 * @param info - Log information object
 * @returns Redacted log information
 */
const redactSensitiveInfo = (info: any): any => {
  if (typeof info !== 'object' || info === null) return info;
  
  const redacted = { ...info };
  
  Object.keys(redacted).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Check if this key should be redacted
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      // Recursively redact nested objects
      redacted[key] = redactSensitiveInfo(redacted[key]);
    }
  });
  
  return redacted;
};

/**
 * Custom format for development environment
 */
const developmentFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // Format the metadata
  let metadataStr = '';
  if (Object.keys(metadata).length > 0) {
    metadataStr = inspect(metadata, { colors: true, depth: 5 });
  }
  
  // Colorize based on log level
  const colorizer = winston.format.colorize();
  const levelOutput = colorizer.colorize(level, `[${level.toUpperCase()}]`);
  
  // Format timestamp
  const timeOutput = chalk.gray(`[${timestamp}]`);
  
  return `${timeOutput} ${levelOutput} ${message}${metadataStr ? `\n${metadataStr}` : ''}`;
});

/**
 * Create console transport with appropriate format
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : developmentFormat
  ),
});

/**
 * Create file transport for all logs
 */
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'kazi-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
});

/**
 * Create file transport for error logs
 */
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'kazi-error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
});

/**
 * Determine log level based on environment
 */
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL;
  
  if (logLevel && levels.hasOwnProperty(logLevel.toLowerCase())) {
    return logLevel.toLowerCase();
  }
  
  return env === 'production' ? 'info' : 'debug';
};

/**
 * Create Winston logger instance
 */
const winstonLogger = winston.createLogger({
  level: getLogLevel(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format(redactSensitiveInfo)(),
    winston.format.json()
  ),
  defaultMeta: { service: 'kazi-platform' },
  transports: [
    consoleTransport,
    fileTransport,
    errorFileTransport,
  ],
  exitOnError: false,
});

/**
 * Performance tracking
 */
interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
}

const performanceMetrics: Record<string, PerformanceMetrics> = {};

/**
 * Logger class with static methods for logging
 */
export class Logger {
  /**
   * Log a debug message
   */
  static debug(message: string, ...meta: any[]): void {
    winstonLogger.debug(message, ...meta);
  }
  
  /**
   * Log an info message
   */
  static info(message: string, ...meta: any[]): void {
    winstonLogger.info(message, ...meta);
  }
  
  /**
   * Log a warning message
   */
  static warn(message: string, ...meta: any[]): void {
    winstonLogger.warn(message, ...meta);
  }
  
  /**
   * Log an error message
   */
  static error(message: string, ...meta: any[]): void {
    winstonLogger.error(message, ...meta);
  }
  
  /**
   * Log an HTTP request
   */
  static http(message: string, ...meta: any[]): void {
    winstonLogger.http(message, ...meta);
  }
  
  /**
   * Log a trace message (most verbose)
   */
  static trace(message: string, ...meta: any[]): void {
    winstonLogger.log('trace', message, ...meta);
  }
  
  /**
   * Start tracking performance for an operation
   */
  static startPerformanceTracking(operationId: string): void {
    performanceMetrics[operationId] = {
      startTime: performance.now(),
    };
  }
  
  /**
   * End performance tracking and log the result
   */
  static endPerformanceTracking(operationId: string, logLevel: 'debug' | 'info' = 'debug'): number {
    const metrics = performanceMetrics[operationId];
    if (!metrics) {
      Logger.warn(`No performance tracking started for operation: ${operationId}`);
      return 0;
    }
    
    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    // Log the performance metric
    if (logLevel === 'info') {
      Logger.info(`Performance: ${operationId} completed in ${metrics.duration.toFixed(2)}ms`, {
        performance: {
          operationId,
          durationMs: metrics.duration,
        },
      });
    } else {
      Logger.debug(`Performance: ${operationId} completed in ${metrics.duration.toFixed(2)}ms`, {
        performance: {
          operationId,
          durationMs: metrics.duration,
        },
      });
    }
    
    // Clean up
    delete performanceMetrics[operationId];
    
    return metrics.duration;
  }
  
  /**
   * Create a child logger with additional context
   */
  static child(context: Record<string, any>): Record<string, any> {
    return winstonLogger.child(context);
  }
  
  /**
   * Change the log level dynamically
   */
  static setLogLevel(level: string): void {
    if (levels.hasOwnProperty(level.toLowerCase())) {
      winstonLogger.level = level.toLowerCase();
      Logger.info(`Log level changed to ${level}`);
    } else {
      Logger.warn(`Invalid log level: ${level}`);
    }
  }
  
  /**
   * Get the current log level
   */
  static getLogLevel(): string {
    return winstonLogger.level;
  }
  
  /**
   * Get logger instance (for advanced usage)
   */
  static getInstance(): typeof winstonLogger {
    return winstonLogger;
  }
}

// Export default for convenience
export default Logger;
