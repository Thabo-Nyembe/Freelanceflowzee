/**
 * Dispute Messages API - FreeFlow A+++ Implementation
 * Real-time messaging for dispute resolution
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  message_type: z.enum(['text', 'proposal', 'evidence']).default('text'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number().optional(),
    type: z.string().optional(),
  })).optional(),
  is_private_to_mediator: z.boolean().default(false),
});

// GET - Get messages for a dispute
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a party to the dispute
    const { data: dispute } = await supabase
      .from('disputes')
      .select('initiator_id, respondent_id, mediator_id')
      .eq('id', id)
      .single();

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isParty =
      dispute.initiator_id === user.id ||
      dispute.respondent_id === user.id ||
      dispute.mediator_id === user.id;

    // Check if user is a mediator
    const { data: isMediator } = await supabase
      .from('dispute_mediators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!isParty && !isMediator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('dispute_messages')
      .select(`
        *,
        sender:users!sender_id (id, name, avatar_url)
      `)
      .eq('dispute_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    // Filter private messages if not mediator
    if (!isMediator && dispute.mediator_id !== user.id) {
      query = query.eq('is_private_to_mediator', false);
    }

    const { data: messages, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count
    const { count } = await supabase
      .from('dispute_messages')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', id);

    return NextResponse.json({
      messages: messages || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a party to the dispute
    const { data: dispute } = await supabase
      .from('disputes')
      .select('initiator_id, respondent_id, mediator_id, status')
      .eq('id', id)
      .single();

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isParty =
      dispute.initiator_id === user.id ||
      dispute.respondent_id === user.id ||
      dispute.mediator_id === user.id;

    // Check if user is a mediator
    const { data: isMediator } = await supabase
      .from('dispute_mediators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!isParty && !isMediator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if dispute is still open for messages
    if (['resolved', 'closed'].includes(dispute.status)) {
      return NextResponse.json(
        { error: 'Dispute is closed for new messages' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Only mediators can send private messages
    if (validatedData.is_private_to_mediator && !isMediator && dispute.mediator_id !== user.id) {
      return NextResponse.json(
        { error: 'Only mediators can send private messages' },
        { status: 403 }
      );
    }

    const { data: message, error: createError } = await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: id,
        sender_id: user.id,
        message: validatedData.message,
        message_type: validatedData.message_type,
        attachments: validatedData.attachments || [],
        is_private_to_mediator: validatedData.is_private_to_mediator,
      })
      .select(`
        *,
        sender:users!sender_id (id, name, avatar_url)
      `)
      .single();

    if (createError) {
      throw createError;
    }

    // Log activity
    await supabase.from('dispute_activity').insert({
      dispute_id: id,
      actor_id: user.id,
      activity_type: 'message_sent',
      description: 'New message sent',
    });

    // Update dispute status if respondent is messaging for first time
    if (
      dispute.status === 'response_pending' &&
      user.id === dispute.respondent_id
    ) {
      await supabase
        .from('disputes')
        .update({ status: 'in_discussion', updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
