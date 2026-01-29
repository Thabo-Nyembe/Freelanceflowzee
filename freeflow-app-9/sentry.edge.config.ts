/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for Edge runtime functions.
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' && !!SENTRY_DSN,

  // Sample rate for performance monitoring
  tracesSampleRate: 0.1,

  // Environment
  environment: process.env.NODE_ENV,

  // Release
  release: process.env.SENTRY_RELEASE || 'kazi@1.0.0',

  // Initial scope
  initialScope: {
    tags: {
      app: 'kazi',
      platform: 'edge',
    },
  },
})
