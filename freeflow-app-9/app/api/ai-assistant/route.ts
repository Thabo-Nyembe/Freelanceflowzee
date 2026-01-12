/**
 * AI Assistant API Routes
 *
 * REST endpoints for AI Assistant feature:
 * GET - List conversations or get stats
 * POST - Create conversation, message, or insight
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getConversations,
  createConversation,
  getConversationStats,
  getInsights,
  createInsight,
  getQuickActions
} from '@/lib/ai-assistant-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'conversations'
    const status = searchParams.get('status') as any
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') as any
    const priority = searchParams.get('priority') as any

    switch (type) {
      case 'conversations': {
        const { data, error } = await getConversations(user.id, {
          status,
          search
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getConversationStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'insights': {
        const { data, error } = await getInsights(user.id, {
          category,
          priority,
          status
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'quick-actions': {
        const actionCategory = searchParams.get('category') || undefined
        const { data, error } = await getQuickActions({ category: actionCategory })
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Assistant API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI assistant data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-conversation': {
        const { title, model, tags, metadata } = payload
        const { data, error } = await createConversation(user.id, title, {
          model,
          tags,
          metadata
        })
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-insight': {
        const { data, error } = await createInsight(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Assistant API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI assistant request' },
      { status: 500 }
    )
  }
}
