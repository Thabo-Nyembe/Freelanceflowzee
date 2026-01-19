/**
 * Dispute Detail API - FreeFlow A+++ Implementation
 * Get, update, and manage individual disputes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateDisputeSchema = z.object({
  action: z.enum([
    'respond', 'escalate', 'close', 'appeal',
    'extend_deadline', 'assign_mediator'
  ]).optional(),
  response: z.string().optional(),
  status: z.enum([
    'opened', 'response_pending', 'in_discussion', 'evidence_review',
    'mediation', 'resolution_proposed', 'resolved', 'closed', 'appealed', 'escalated'
  ]).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  deadline_extension_days: z.number().min(1).max(14).optional(),
  appeal_reason: z.string().optional(),
});

// GET - Get dispute details
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

    const { data: dispute, error } = await supabase
      .from('disputes')
      .select(`
        *,
        order:service_orders (
          id, package_name, package_price, extras, extras_total, total,
          status, delivery_days, due_date, created_at,
          listing:service_listings (id, title, images, description)
        ),
        initiator:users!initiator_id (id, email, name, avatar_url),
        respondent:users!respondent_id (id, email, name, avatar_url),
        mediator:users!mediator_id (id, email, name, avatar_url),
        messages:dispute_messages (
          id, sender_id, message, message_type, attachments, created_at,
          is_private_to_mediator
        ),
        evidence:dispute_evidence (
          id, submitted_by, title, description, evidence_type,
          file_url, file_name, external_url, is_verified, created_at
        ),
        proposals:dispute_proposals (
          id, proposed_by, resolution_type, proposed_amount, description,
          initiator_accepted, respondent_accepted, status, expires_at, created_at
        ),
        activity:dispute_activity (
          id, actor_id, activity_type, description, created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
      }
      throw error;
    }

    // Verify user is a party or mediator
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

    // Determine user's role
    const userRole =
      dispute.initiator_id === user.id ? 'initiator' :
      dispute.respondent_id === user.id ? 'respondent' :
      dispute.mediator_id === user.id ? 'mediator' : 'observer';

    // Filter out private mediator messages if user is not mediator
    if (!isMediator && dispute.mediator_id !== user.id) {
      dispute.messages = dispute.messages?.filter(
        (m: { is_private_to_mediator: boolean }) => !m.is_private_to_mediator
      );
    }

    // Mark messages as read
    if (dispute.messages?.length > 0) {
      const readField =
        userRole === 'initiator' ? 'read_by_initiator' :
        userRole === 'respondent' ? 'read_by_respondent' : 'read_by_mediator';

      await supabase
        .from('dispute_messages')
        .update({ [readField]: true })
        .eq('dispute_id', id)
        .eq(readField, false);
    }

    return NextResponse.json({
      dispute,
      user_role: userRole,
      can_resolve: isMediator || dispute.mediator_id === user.id,
    });
  } catch (error) {
    console.error('Dispute GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update dispute
export async function PATCH(
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

    // Get current dispute
    const { data: dispute, error: fetchError } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Verify user is a party
    const isInitiator = dispute.initiator_id === user.id;
    const isRespondent = dispute.respondent_id === user.id;
    const isMediatorAssigned = dispute.mediator_id === user.id;

    // Check if user is a system mediator
    const { data: isMediator } = await supabase
      .from('dispute_mediators')
      .select('id, can_force_resolution')
      .eq('user_id', user.id)
      .single();

    if (!isInitiator && !isRespondent && !isMediatorAssigned && !isMediator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateDisputeSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Handle different actions
    switch (validatedData.action) {
      case 'respond':
        if (!isRespondent) {
          return NextResponse.json(
            { error: 'Only respondent can respond' },
            { status: 403 }
          );
        }
        updateData.status = 'in_discussion';

        // Add response as message
        if (validatedData.response) {
          await supabase.from('dispute_messages').insert({
            dispute_id: id,
            sender_id: user.id,
            message: validatedData.response,
            message_type: 'text',
          });
        }

        await supabase.from('dispute_activity').insert({
          dispute_id: id,
          actor_id: user.id,
          activity_type: 'responded',
          description: 'Respondent submitted their response',
        });
        break;

      case 'escalate':
        if (dispute.status === 'mediation') {
          return NextResponse.json(
            { error: 'Dispute already in mediation' },
            { status: 400 }
          );
        }
        updateData.status = 'mediation';
        updateData.requires_mediation = true;

        // Auto-assign mediator
        const { data: assignedMediatorId } = await supabase.rpc(
          'assign_dispute_mediator',
          { dispute_id_param: id }
        );

        if (assignedMediatorId) {
          updateData.mediator_id = assignedMediatorId;
        }

        await supabase.from('dispute_activity').insert({
          dispute_id: id,
          actor_id: user.id,
          activity_type: 'escalated',
          description: 'Dispute escalated to mediation',
        });
        break;

      case 'close':
        if (!isMediator && !isMediatorAssigned) {
          return NextResponse.json(
            { error: 'Only mediators can close disputes' },
            { status: 403 }
          );
        }
        updateData.status = 'closed';

        await supabase.from('dispute_activity').insert({
          dispute_id: id,
          actor_id: user.id,
          activity_type: 'closed',
          description: 'Dispute closed by mediator',
        });
        break;

      case 'appeal':
        if (dispute.status !== 'resolved' && dispute.status !== 'closed') {
          return NextResponse.json(
            { error: 'Can only appeal resolved/closed disputes' },
            { status: 400 }
          );
        }
        if (dispute.appeal_count >= dispute.appeal_limit) {
          return NextResponse.json(
            { error: 'Appeal limit reached' },
            { status: 400 }
          );
        }
        updateData.status = 'appealed';
        updateData.appeal_count = dispute.appeal_count + 1;
        updateData.last_appeal_at = new Date().toISOString();

        if (validatedData.appeal_reason) {
          await supabase.from('dispute_messages').insert({
            dispute_id: id,
            sender_id: user.id,
            message: `Appeal reason: ${validatedData.appeal_reason}`,
            message_type: 'system',
            system_event: 'appeal_submitted',
          });
        }

        await supabase.from('dispute_activity').insert({
          dispute_id: id,
          actor_id: user.id,
          activity_type: 'appealed',
          description: 'Dispute resolution appealed',
        });
        break;

      case 'extend_deadline':
        if (!isMediator && !isMediatorAssigned) {
          return NextResponse.json(
            { error: 'Only mediators can extend deadlines' },
            { status: 403 }
          );
        }
        const days = validatedData.deadline_extension_days || 3;
        const newDeadline = new Date(dispute.evidence_deadline || new Date());
        newDeadline.setDate(newDeadline.getDate() + days);
        updateData.evidence_deadline = newDeadline.toISOString();

        await supabase.from('dispute_activity').insert({
          dispute_id: id,
          actor_id: user.id,
          activity_type: 'deadline_extended',
          description: `Evidence deadline extended by ${days} days`,
        });
        break;

      case 'assign_mediator':
        if (!isMediator) {
          return NextResponse.json(
            { error: 'Only mediators can assign disputes' },
            { status: 403 }
          );
        }
        // Self-assign
        updateData.mediator_id = user.id;
        updateData.status = 'mediation';

        await supabase
          .from('dispute_mediators')
          .update({ current_disputes: supabase.rpc('increment', { x: 1 }) })
          .eq('user_id', user.id);

        await supabase.from('dispute_activity').insert({
          dispute_id: id,
          actor_id: user.id,
          activity_type: 'mediator_assigned',
          description: 'Mediator self-assigned to dispute',
        });
        break;

      default:
        // Direct field updates
        if (validatedData.status) {
          updateData.status = validatedData.status;
        }
        if (validatedData.priority && (isMediator || isMediatorAssigned)) {
          updateData.priority = validatedData.priority;
        }
    }

    const { data: updatedDispute, error: updateError } = await supabase
      .from('disputes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ dispute: updatedDispute });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Dispute PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
