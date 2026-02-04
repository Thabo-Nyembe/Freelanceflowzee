/**
 * AI Code API - Single Resource Routes
 *
 * GET - Get single completion, snippet, analysis
 * PUT - Update completion, snippet, bug report, stats
 * DELETE - Delete completion, snippet, analysis, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-code')
import {

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
  getCodeCompletion,
  updateCodeCompletion,
  deleteCodeCompletion,
  bulkDeleteCompletions,
  getCodeSnippet,
  updateCodeSnippet,
  deleteCodeSnippet,
  incrementSnippetUsage,
  likeSnippet,
  getCodeAnalysis,
  deleteCodeAnalysis,
  getAnalysisWithIssues,
  markBugAsFixed,
  updateCodeStats
} from '@/lib/ai-code-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'completion'

    switch (type) {
      case 'completion': {
        const result = await getCodeCompletion(id)
        return NextResponse.json({ data: result.data })
      }

      case 'snippet': {
        const result = await getCodeSnippet(id)
        return NextResponse.json({ data: result.data })
      }

      case 'analysis': {
        const result = await getCodeAnalysis(id)
        return NextResponse.json({ data: result.data })
      }

      case 'analysis-with-issues': {
        const result = await getAnalysisWithIssues(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Code API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'completion': {
        const result = await updateCodeCompletion(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'snippet': {
        if (action === 'increment-usage') {
          const result = await incrementSnippetUsage(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'like') {
          const result = await likeSnippet(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateCodeSnippet(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'bug': {
        if (action === 'mark-fixed') {
          const result = await markBugAsFixed(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for bug' }, { status: 400 })
      }

      case 'stats': {
        const result = await updateCodeStats(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Code API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'completion'
    const ids = searchParams.get('ids')

    switch (type) {
      case 'completion': {
        await deleteCodeCompletion(id)
        return NextResponse.json({ success: true })
      }

      case 'completions-bulk': {
        if (!ids) {
          return NextResponse.json({ error: 'ids required for bulk delete' }, { status: 400 })
        }
        const idArray = ids.split(',')
        await bulkDeleteCompletions(idArray)
        return NextResponse.json({ success: true })
      }

      case 'snippet': {
        await deleteCodeSnippet(id)
        return NextResponse.json({ success: true })
      }

      case 'analysis': {
        await deleteCodeAnalysis(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Code API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
