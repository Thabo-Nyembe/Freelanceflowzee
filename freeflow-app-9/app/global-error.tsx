'use client'

import { useEffect } from 'react'
import { captureError } from '@/lib/error-monitoring'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    captureError(error, {
      component: 'GlobalError',
      action: 'app-crash',
      metadata: {
        digest: error.digest
      }
    })
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#0a0a0a',
          color: '#ededed',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#ef4444'
            }}>
              Something went wrong
            </h1>
            <p style={{
              color: '#a3a3a3',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            {error.digest && (
              <p style={{
                fontSize: '12px',
                color: '#737373',
                marginBottom: '24px',
                fontFamily: 'monospace'
              }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
