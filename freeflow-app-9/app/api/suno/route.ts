import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('suno')

const SUNO_API_URL = 'https://apibox.erweima.ai/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Suno API key not configured' }, { status: 500 })
    }

    let endpoint = '/generate'
    let requestBody: any = {}

    switch (action) {
      case 'generate':
        endpoint = '/generate'
        requestBody = {
          prompt: params.prompt,
          model: params.model || 'V4',
          customMode: params.customMode || false,
          instrumental: params.instrumental || false,
          style: params.style,
          title: params.title,
          negativeTags: params.negativeTags,
          callBackUrl: params.callBackUrl
        }
        break

      case 'generate-lyrics':
        endpoint = '/lyrics'
        requestBody = {
          prompt: params.prompt,
          callBackUrl: params.callBackUrl
        }
        break

      case 'extend':
        endpoint = '/extend'
        requestBody = {
          audioId: params.audioId,
          prompt: params.prompt,
          style: params.style,
          continueAt: params.continueAt,
          model: params.model || 'V4',
          callBackUrl: params.callBackUrl
        }
        break

      case 'vocal-separation':
        endpoint = '/uploads/vocal-remove'
        requestBody = {
          audioUrl: params.audioUrl,
          callBackUrl: params.callBackUrl
        }
        break

      case 'status':
        endpoint = `/generate/record-info?taskId=${params.taskId}`
        const statusResponse = await fetch(`${SUNO_API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        const statusData = await statusResponse.json()
        return NextResponse.json(statusData)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const response = await fetch(`${SUNO_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Suno API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Suno request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
  }

  const apiKey = process.env.SUNO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Suno API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`${SUNO_API_URL}/generate/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Suno status check error', { error })
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
