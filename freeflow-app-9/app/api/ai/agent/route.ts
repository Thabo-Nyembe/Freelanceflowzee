/**
 * AI Agent API - Create and manage agent sessions
 * Manus-like autonomous agent system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ManusAgent } from '@/lib/agents/manus-agent';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for long-running tasks

// GET - List all agent sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('agent_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      sessions,
      total: count,
      limit,
      offset
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new agent session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      model = 'gpt-4o',
      provider = 'openai',
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt
    } = body;

    const agent = new ManusAgent({
      model,
      provider,
      temperature,
      maxTokens,
      systemPrompt
    });

    const session = await agent.createSession(user.id, title);

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}
