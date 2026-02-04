import { NextRequest, NextResponse } from 'next/server'

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

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      suggestions: [
        { id: '1', type: 'design', content: 'Consider using a warmer color palette', confidence: 0.85 },
        { id: '2', type: 'copy', content: 'The headline could be more action-oriented', confidence: 0.78 },
      ],
      insights: {
        projectHealth: 85,
        estimatedCompletion: '2024-02-01',
        riskFactors: []
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      generated: true,
      result: 'AI-generated content based on your request',
      ...body
    }
  })
}
