import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('auth-signup')

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['user', 'freelancer', 'client']).optional().default('user')
})

/**
 * User Registration API Route
 *
 * POST /api/auth/signup
 *
 * Creates a new user account using Supabase Auth
 *
 * @body email - User email address
 * @body password - User password (min 8 characters)
 * @body name - User full name
 * @body role - User role (optional, defaults to 'user')
 *
 * @returns User object
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    // Parse request body
    const body = await request.json()

    // Validate input
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { email, password, name, role } = validationResult.data

    // Create user with Supabase Auth (regular signUp flow)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          name,
          full_name: name,
          role
        }
      }
    })

    if (authError) {
      logger.error('Supabase Auth error', { error: authError })

      // Handle specific errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: authError.message || 'Failed to create user account' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          role: role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Signup error', { error })
    return NextResponse.json(
      { error: 'An unexpected error occurred during signup' },
      { status: 500 }
    )
  }
}

/**
 * Get signup configuration
 *
 * GET /api/auth/signup
 *
 * Returns available signup options and configuration
 */
export async function GET() {
  return NextResponse.json({
    availableRoles: ['user', 'freelancer', 'client'],
    passwordRequirements: {
      minLength: 8,
      requiresUppercase: false,
      requiresLowercase: false,
      requiresNumber: false,
      requiresSpecial: false
    },
    emailVerificationRequired: true,
    oauthProviders: [
      ...(process.env.GOOGLE_CLIENT_ID ? ['google'] : []),
      ...(process.env.GITHUB_CLIENT_ID ? ['github'] : [])
    ]
  })
}
