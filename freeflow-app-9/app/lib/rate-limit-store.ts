// In-memory store for rate limiting
export const rateLimitStore: Record<string, { count: number; expiry: number }> = {}

// Constants
export const MAX_ATTEMPTS = 5
export const LOCKOUT_PERIOD = 5 * 60 * 1000 // 5 minutes

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(ip => {
    if (rateLimitStore[ip].expiry < now) {
      delete rateLimitStore[ip]
    }
  })
}, 60000)

// Helper functions
export function clearAllRateLimits() {
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key]
  })
}

export function isRateLimited(ip: string): boolean {
  return rateLimitStore[ip]?.count > MAX_ATTEMPTS && rateLimitStore[ip].expiry > Date.now()
}

export function getRemainingTime(ip: string): number {
  if (!rateLimitStore[ip] || rateLimitStore[ip].expiry <= Date.now()) {
    return 0
  }
  return Math.ceil((rateLimitStore[ip].expiry - Date.now()) / 1000)
}

export function incrementFailedAttempts(ip: string) {
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, expiry: 0 }
  } else {
    rateLimitStore[ip].count++
  }

  if (rateLimitStore[ip].count > MAX_ATTEMPTS) {
    rateLimitStore[ip].expiry = Date.now() + LOCKOUT_PERIOD
  }
}

export function clearRateLimit(ip: string) {
  delete rateLimitStore[ip]
}

export function getAttemptsRemaining(ip: string): number {
  return MAX_ATTEMPTS - (rateLimitStore[ip]?.count || 0)
} 