/**
 * Dispute Proposals API - FreeFlow A+++ Implementation
 * Resolution proposals for dispute resolution
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createFeatureLogger } from '@/lib/logger';

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

const logger = createFeatureLogger('dispute-proposals');

const createProposalSchema = z.object({
  resolution_type: z.enum([
    'full_refund', 'partial_refund', 'redelivery', 'order_cancelled',
    'order_completed', 'mutual_cancellation', 'no_action',
    'account_warning', 'account_suspension'
  ]),
  proposed_amount: z.number().min(0).optional(),
  description: z.string().min(10).max(2000),
  terms: z.string().max(2000).optional(),
  expires_in_days: z.number().min(1).max(14).default(3),
});

const respondProposalSchema = z.object({
  accept: z.boolean(),
  counter: z.boolean().default(false),
  counter_proposal: createProposalSchema.optional(),
});

// GET - Get proposals for a dispute
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

    const { data: proposals, error } = await supabase
      .from('dispute_proposals')
      .select(`
        *,
        proposer:users!proposed_by (id, name, avatar_url),
        counter_proposal:dispute_proposals!counter_proposal_id (*)
      `)
      .eq('dispute_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get active (pending) proposal
    const activeProposal = proposals?.find(
      (p: { status: string; expires_at: string }) =>
        p.status === 'pending' && new Date(p.expires_at) > new Date()
    );

    return NextResponse.json({
      proposals: proposals || [],
      active_proposal: activeProposal || null,
    });
  } catch (error) {
    logger.error('Proposals GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a proposal or respond to one
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
      .select('initiator_id, respondent_id, mediator_id, status, disputed_amount')
      .eq('id', id)
      .single();

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isInitiator = dispute.initiator_id === user.id;
    const isRespondent = dispute.respondent_id === user.id;
    const isMediatorAssigned = dispute.mediator_id === user.id;

    // Check if user is a mediator
    const { data: mediatorProfile } = await supabase
      .from('dispute_mediators')
      .select('id, can_force_resolution')
      .eq('user_id', user.id)
      .single();

    const isMediator = !!mediatorProfile;

    if (!isInitiator && !isRespondent && !isMediatorAssigned && !isMediator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if dispute is still open
    if (['resolved', 'closed'].includes(dispute.status)) {
      return NextResponse.json(
        { error: 'Dispute is already resolved' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createProposalSchema.parse(body);

    // Validate proposed amount doesn't exceed disputed amount
    if (
      validatedData.proposed_amount &&
      validatedData.proposed_amount > dispute.disputed_amount
    ) {
      return NextResponse.json(
        { error: 'Proposed amount cannot exceed disputed amount' },
        { status: 400 }
      );
    }

    // Only mediators can propose certain resolution types
    const mediatorOnlyResolutions = ['account_warning', 'account_suspension'];
    if (
      mediatorOnlyResolutions.includes(validatedData.resolution_type) &&
      !isMediator &&
      !isMediatorAssigned
    ) {
      return NextResponse.json(
        { error: 'Only mediators can propose this resolution type' },
        { status: 403 }
      );
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expires_in_days);

    const { data: proposal, error: createError } = await supabase
      .from('dispute_proposals')
      .insert({
        dispute_id: id,
        proposed_by: user.id,
        resolution_type: validatedData.resolution_type,
        proposed_amount: validatedData.proposed_amount,
        description: validatedData.description,
        terms: validatedData.terms,
        expires_at: expiresAt.toISOString(),
        // Auto-accept for the proposer
        initiator_accepted: isInitiator ? true : null,
        respondent_accepted: isRespondent ? true : null,
        mediator_recommended: (isMediator || isMediatorAssigned) ? true : null,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Update dispute status
    await supabase
      .from('disputes')
      .update({
        status: 'resolution_proposed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Log activity
    await supabase.from('dispute_activity').insert({
      dispute_id: id,
      actor_id: user.id,
      activity_type: 'proposal_made',
      description: `Resolution proposal: ${validatedData.resolution_type}`,
      related_entity_type: 'proposal',
      related_entity_id: proposal.id,
    });

    // Add system message
    await supabase.from('dispute_messages').insert({
      dispute_id: id,
      sender_id: user.id,
      message: `New resolution proposal: ${validatedData.resolution_type}${
        validatedData.proposed_amount ? ` ($${validatedData.proposed_amount})` : ''
      }`,
      message_type: 'proposal',
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Proposals POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Respond to a proposal
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

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposal_id');

    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposal_id is required' },
        { status: 400 }
      );
    }

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('dispute_proposals')
      .select('*')
      .eq('id', proposalId)
      .eq('dispute_id', id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Proposal is no longer pending' },
        { status: 400 }
      );
    }

    if (new Date(proposal.expires_at) < new Date()) {
      // Expire the proposal
      await supabase
        .from('dispute_proposals')
        .update({ status: 'expired' })
        .eq('id', proposalId);

      return NextResponse.json(
        { error: 'Proposal has expired' },
        { status: 400 }
      );
    }

    // Get dispute
    const { data: dispute } = await supabase
      .from('disputes')
      .select('initiator_id, respondent_id, mediator_id')
      .eq('id', id)
      .single();

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isInitiator = dispute.initiator_id === user.id;
    const isRespondent = dispute.respondent_id === user.id;

    if (!isInitiator && !isRespondent) {
      return NextResponse.json(
        { error: 'Only parties can respond to proposals' },
        { status: 403 }
      );
    }

    // Cannot respond to own proposal
    if (proposal.proposed_by === user.id) {
      return NextResponse.json(
        { error: 'Cannot respond to your own proposal' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = respondProposalSchema.parse(body);

    const updateField = isInitiator ? 'initiator_accepted' : 'respondent_accepted';

    const updateData: Record<string, unknown> = {
      [updateField]: validatedData.accept,
      updated_at: new Date().toISOString(),
    };

    // Check if both parties have accepted
    const otherPartyAccepted = isInitiator
      ? proposal.respondent_accepted
      : proposal.initiator_accepted;

    if (validatedData.accept && otherPartyAccepted === true) {
      // Both accepted - resolve the dispute
      updateData.status = 'accepted';

      // Process resolution
      await supabase.rpc('process_dispute_resolution', {
        dispute_id_param: id,
        resolution_type_param: proposal.resolution_type,
        resolution_amount_param: proposal.proposed_amount || 0,
        resolved_by_param: user.id,
        notes_param: proposal.description,
      });
    } else if (!validatedData.accept) {
      updateData.status = validatedData.counter ? 'countered' : 'rejected';

      // Create counter proposal if provided
      if (validatedData.counter && validatedData.counter_proposal) {
        const cp = validatedData.counter_proposal;
        const counterExpiresAt = new Date();
        counterExpiresAt.setDate(counterExpiresAt.getDate() + cp.expires_in_days);

        await supabase.from('dispute_proposals').insert({
          dispute_id: id,
          proposed_by: user.id,
          resolution_type: cp.resolution_type,
          proposed_amount: cp.proposed_amount,
          description: cp.description,
          terms: cp.terms,
          expires_at: counterExpiresAt.toISOString(),
          counter_proposal_id: proposalId,
          initiator_accepted: isInitiator ? true : null,
          respondent_accepted: isRespondent ? true : null,
        });
      }
    }

    const { data: updatedProposal, error: updateError } = await supabase
      .from('dispute_proposals')
      .update(updateData)
      .eq('id', proposalId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log activity
    await supabase.from('dispute_activity').insert({
      dispute_id: id,
      actor_id: user.id,
      activity_type: validatedData.accept ? 'proposal_accepted' : 'proposal_rejected',
      description: validatedData.accept
        ? 'Resolution proposal accepted'
        : validatedData.counter
          ? 'Resolution proposal rejected with counter-offer'
          : 'Resolution proposal rejected',
      related_entity_type: 'proposal',
      related_entity_id: proposalId,
    });

    return NextResponse.json({ proposal: updatedProposal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Proposals PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
