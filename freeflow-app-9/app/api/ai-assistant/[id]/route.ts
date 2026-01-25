/**
 * AI Assistant API - Single Resource Routes
 *
 * GET - Get single conversation with messages
 * PUT - Update conversation
 * DELETE - Delete conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-assistant')
import {
  getConversation,
  updateConversation,
  deleteConversation,
  archiveConversation,
  togglePinConversation,
  getMessages
} from '@/lib/ai-assistant-queries'

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
    const includeMessages = searchParams.get('include_messages') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: conversation, error } = await getConversation(id)
    if (error) throw error

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    let messages = null
    if (includeMessages) {
      const { data: msgs, error: msgsError } = await getMessages(id, { limit, offset })
      if (msgsError) throw msgsError
      messages = msgs
    }

    return NextResponse.json({
      data: {
        ...conversation,
        messages
      }
    })
  } catch (error) {
    logger.error('AI Assistant API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
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
    const { action, ...updates } = body

    let result

    switch (action) {
      case 'archive':
        result = await archiveConversation(id)
        break

      case 'pin':
        result = await togglePinConversation(id, true)
        break

      case 'unpin':
        result = await togglePinConversation(id, false)
        break

      default:
        result = await updateConversation(id, updates)
    }

    if (result.error) throw result.error

    return NextResponse.json({ data: result.data })
  } catch (error) {
    logger.error('AI Assistant API error', { error })
    return NextResponse.json(
      { error: 'Failed to update conversation' },
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

    const { error } = await deleteConversation(id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('AI Assistant API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
