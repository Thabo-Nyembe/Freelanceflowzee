/**
 * Custom AI Agents API
 *
 * GET /api/ai/agents - List user's agents
 * POST /api/ai/agents - Create new agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-agents')

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const includePublic = searchParams.get('includePublic') === 'true'
    const includeTemplates = searchParams.get('includeTemplates') === 'true'

    let query = supabase
      .from('ai_agents')
      .select('*')
      .order('updated_at', { ascending: false })

    if (includePublic || includeTemplates) {
      // Get user's agents + public/template agents
      query = query.or(`user_id.eq.${user.id},is_public.eq.true,is_template.eq.true`)
    } else {
      // Only user's agents
      query = query.eq('user_id', user.id)
    }

    const { data: agents, error } = await query

    if (error) {
      logger.error('Error fetching agents', { error })
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ agents })
  } catch (error) {
    logger.error('Get agents error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      avatar_url,
      system_prompt,
      model = 'gpt-4o',
      temperature = 0.7,
      max_tokens = 2000,
      capabilities = {},
      conversation_starters = [],
      is_public = false,
      // Clone from template
      templateId,
    } = body

    // Validate required fields
    if (!name || !system_prompt) {
      return NextResponse.json(
        { error: 'Name and system_prompt are required' },
        { status: 400 }
      )
    }

    // If cloning from template
    let agentData: Record<string, unknown>

    if (templateId) {
      const { data: template } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', templateId)
        .eq('is_template', true)
        .single()

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      agentData = {
        ...template,
        id: undefined,
        user_id: user.id,
        name: name || template.name,
        description: description || template.description,
        is_public: false,
        is_template: false,
        conversation_count: 0,
        message_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    } else {
      agentData = {
        user_id: user.id,
        name,
        description,
        avatar_url,
        system_prompt,
        model,
        temperature,
        max_tokens,
        capabilities: {
          web_search: false,
          code_execution: false,
          file_upload: true,
          image_generation: false,
          voice_mode: false,
          ...capabilities,
        },
        conversation_starters,
        is_public,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const { data: agent, error } = await supabase
      .from('ai_agents')
      .insert(agentData)
      .select()
      .single()

    if (error) {
      logger.error('Error creating agent', { error })
      return NextResponse.json(
        { error: 'Failed to create agent' },
        { status: 500 }
      )
    }

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    logger.error('Create agent error', { error })
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
