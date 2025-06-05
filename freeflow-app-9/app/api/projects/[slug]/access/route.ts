import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 5 * 60 * 1000   // 5 minutes lockout
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { attempts: number; firstAttempt: number; lockedUntil?: number }>()

// Validation schemas using Zod
const accessRequestSchema = z.object({
  password: z.string().optional(),
  accessCode: z.string().optional(),
}).refine(data => data.password || data.accessCode, {
  message: "Either password or access code is required"
})

// Test project configuration
const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  slug: 'premium-brand-identity-package',
  validCredentials: {
    password: 'secure-unlock-2024',
    accessCode: 'BRAND2024'
  }
}

// Rate limiting middleware
function checkRateLimit(clientId: string): { allowed: boolean; error?: string; remainingTime?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(clientId)

  // Check if client is locked out
  if (record?.lockedUntil && now < record.lockedUntil) {
    const remainingTime = Math.ceil((record.lockedUntil - now) / 1000)
    return { 
      allowed: false, 
      error: 'Too many failed attempts. Please try again later.', 
      remainingTime 
    }
  }

  // Reset if window has expired
  if (!record || (now - record.firstAttempt) > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.set(clientId, { attempts: 1, firstAttempt: now })
    return { allowed: true }
  }

  // Check if max attempts exceeded
  if (record.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    rateLimitStore.set(clientId, { 
      ...record, 
      lockedUntil: now + RATE_LIMIT_CONFIG.lockoutMs 
    })
    const remainingTime = Math.ceil(RATE_LIMIT_CONFIG.lockoutMs / 1000)
    return { 
      allowed: false, 
      error: 'Too many failed attempts. Account temporarily locked.', 
      remainingTime 
    }
  }

  return { allowed: true }
}

// Record failed attempt
function recordFailedAttempt(clientId: string) {
  const now = Date.now()
  const record = rateLimitStore.get(clientId)
  
  if (record) {
    rateLimitStore.set(clientId, { 
      ...record, 
      attempts: record.attempts + 1 
    })
  } else {
    rateLimitStore.set(clientId, { attempts: 1, firstAttempt: now })
  }
}

// Clear rate limit on successful access
function clearRateLimit(clientId: string) {
  rateLimitStore.delete(clientId)
}

// Reset all rate limiting (for testing)
function resetRateLimiting() {
  rateLimitStore.clear()
}

// Generate access token
function generateAccessToken(): string {
  return `access_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { slug } = await params
    
    // Get client identifier for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const clientId = `${clientIp}_${userAgent.substring(0, 50)}`

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(clientId)
    if (!rateLimitCheck.allowed) {
      console.log(`🚫 Rate limit exceeded for client: ${clientId}`)
      return NextResponse.json(
        { 
          error: rateLimitCheck.error,
          code: 'rate_limited',
          retryAfter: rateLimitCheck.remainingTime
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = accessRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Please enter either a password or access code',
          code: 'validation_error',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { password, accessCode } = validationResult.data

    // Validate project slug
    if (slug !== TEST_PROJECT.slug) {
      return NextResponse.json(
        { error: 'Project not found', code: 'not_found' },
        { status: 404 }
      )
    }

    // Validate credentials
    const isValidPassword = password && password === TEST_PROJECT.validCredentials.password
    const isValidAccessCode = accessCode && accessCode === TEST_PROJECT.validCredentials.accessCode

    if (!isValidPassword && !isValidAccessCode) {
      // Record failed attempt
      recordFailedAttempt(clientId)
      
      console.log(`🚫 Invalid access attempt for project ${slug} from client: ${clientId}`)
      return NextResponse.json(
        { 
          error: 'Invalid credentials', 
          code: 'unauthorized' 
        },
        { status: 401 }
      )
    }

    // Success - clear rate limiting and generate access token
    clearRateLimit(clientId)
    
    const accessToken = generateAccessToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const unlockUrl = `/projects/${slug}/unlocked`

    console.log(`✅ Access granted for project ${slug} to client: ${clientId}`)

    return NextResponse.json({
      success: true,
      accessToken,
      projectSlug: slug,
      expiresAt,
      unlockUrl,
      message: 'Access granted successfully'
    })

  } catch (error) {
    console.error('Access validation error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        code: 'server_error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for checking access status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { slug } = await params
    
    // Get access token from query params or headers
    const url = new URL(request.url)
    const token = url.searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Special endpoint for testing - reset rate limiting
    if (url.searchParams.get('action') === 'reset-rate-limiting') {
      resetRateLimiting()
      return NextResponse.json({ success: true, message: 'Rate limiting reset' })
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required', code: 'missing_token' },
        { status: 401 }
      )
    }

    // In a real app, you would validate the token against a database
    // For testing, we'll accept any token that looks valid
    if (token.startsWith('access_token_')) {
      return NextResponse.json({
        valid: true,
        projectSlug: slug,
        accessLevel: 'premium'
      })
    }

    return NextResponse.json(
      { error: 'Invalid access token', code: 'invalid_token' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Access check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'server_error' },
      { status: 500 }
    )
  }
} 