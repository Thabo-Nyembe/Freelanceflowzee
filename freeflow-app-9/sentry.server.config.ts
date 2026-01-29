/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry error tracking for the server.
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' && !!SENTRY_DSN,

  // Adjust sample rate for production
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable profiling
  profilesSampleRate: 0.1,

  // Environment
  environment: process.env.NODE_ENV,

  // Release
  release: process.env.SENTRY_RELEASE || 'kazi@1.0.0',

  // Attach request data to events
  sendDefaultPii: false, // Set to true if you want to capture PII

  // Filter errors
  beforeSend(event) {
    // Filter specific errors
    if (event.exception?.values?.[0]?.type === 'NotFoundError') {
      return null
    }
    return event
  },

  // Add extra tags
  initialScope: {
    tags: {
      app: 'kazi',
      platform: 'server',
    },
  },
})
