/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry error tracking for the browser.
 * Sentry needs to be initialized here for client-side error tracking.
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' && !!SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1, // 10% of transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 0.1,

  // Enable replay for session recording
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Capture console errors
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter errors
  beforeSend(event) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out specific errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null
    }

    return event
  },

  // Environment tag
  environment: process.env.NODE_ENV,

  // Release version (set during build)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'kazi@1.0.0',

  // Ignore specific URLs
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Safari extensions
    /^safari-extension:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
  ],

  // Additional tags
  initialScope: {
    tags: {
      app: 'kazi',
      platform: 'web',
    },
  },
})
