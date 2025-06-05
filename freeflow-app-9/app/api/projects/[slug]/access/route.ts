import { NextRequest, NextResponse } from 'next/server'

// Mock access credentials for testing
const VALID_CREDENTIALS = {
  passwords: ['secure-unlock-2024', 'demo-password-123'],
  accessCodes: ['BRAND2024', 'DEMO2024', 'ACCESS123']
}

// Rate limiting storage (in production, use Redis or database)
const rateLimit = new Map<string, { attempts: number; lastAttempt: number }>()

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 5 * 60 * 1000   // 5 minutes lockout
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { password, accessCode } = await request.json()
    const projectSlug = params.slug
    console.log('🧪 Access API called with slug:', projectSlug, 'credentials:', { password, accessCode })

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const rateLimitKey = `${clientIP}-${projectSlug}`

    if (!password && !accessCode) {
      return NextResponse.json(
        { error: 'Either password or access code is required' },
        { status: 400 }
      )
    }

    // Check rate limiting
    const now = Date.now()
    const userAttempts = rateLimit.get(rateLimitKey)
    
    if (userAttempts) {
      // Reset attempts if window expired
      if (now - userAttempts.lastAttempt > RATE_LIMIT_CONFIG.windowMs) {
        rateLimit.delete(rateLimitKey)
      }
      // Check if user is locked out
      else if (userAttempts.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
        if (now - userAttempts.lastAttempt < RATE_LIMIT_CONFIG.lockoutMs) {
          return NextResponse.json(
            { error: 'Too many failed attempts. Temporarily disabled. Please try again later.' },
            { status: 429 }
          )
        } else {
          // Lockout expired, reset
          rateLimit.delete(rateLimitKey)
        }
      }
    }

    // Validate credentials
    const validPassword = password && VALID_CREDENTIALS.passwords.includes(password)
    const validAccessCode = accessCode && VALID_CREDENTIALS.accessCodes.includes(accessCode)

    if (!validPassword && !validAccessCode) {
      // Track failed attempt
      const currentAttempts = rateLimit.get(rateLimitKey)?.attempts || 0
      const newAttempts = currentAttempts + 1
      
      rateLimit.set(rateLimitKey, {
        attempts: newAttempts,
        lastAttempt: now
      })

      // Show rate limit message after 5 attempts
      if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please try again later.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid credentials', code: 'unauthorized' },
        { status: 401 }
      )
    }

    // Success - clear rate limiting
    rateLimit.delete(rateLimitKey)

    // Generate access token
    const accessToken = `access_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const response = {
      success: true,
      accessToken,
      projectSlug,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      unlockUrl: `/projects/${projectSlug}/unlocked`
    }
    console.log('🧪 Access API returning:', response)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Project access validation failed:', error)
    return NextResponse.json(
      { error: 'Access validation failed' },
      { status: 500 }
    )
  }
} 