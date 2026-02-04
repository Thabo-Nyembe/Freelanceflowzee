/**
 * Dispute Evidence API - FreeFlow A+++ Implementation
 * Evidence submission and management for disputes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('dispute-evidence');

const submitEvidenceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  evidence_type: z.enum([
    'screenshot', 'file', 'link', 'chat_log', 'contract',
    'invoice', 'delivery_proof', 'communication', 'other'
  ]),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  file_type: z.string().optional(),
  external_url: z.string().url().optional(),
});

// GET - Get evidence for a dispute
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

    const { data: evidence, error } = await supabase
      .from('dispute_evidence')
      .select(`
        *,
        submitter:users!submitted_by (id, name, avatar_url)
      `)
      .eq('dispute_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group evidence by submitter
    const initiatorEvidence = evidence?.filter(
      (e: { submitted_by: string }) => e.submitted_by === dispute.initiator_id
    ) || [];
    const respondentEvidence = evidence?.filter(
      (e: { submitted_by: string }) => e.submitted_by === dispute.respondent_id
    ) || [];

    return NextResponse.json({
      evidence: evidence || [],
      by_party: {
        initiator: initiatorEvidence,
        respondent: respondentEvidence,
      },
    });
  } catch (error) {
    logger.error('Evidence GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit evidence
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
      .select('initiator_id, respondent_id, mediator_id, status, evidence_deadline')
      .eq('id', id)
      .single();

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Only initiator and respondent can submit evidence
    const canSubmit =
      dispute.initiator_id === user.id ||
      dispute.respondent_id === user.id;

    if (!canSubmit) {
      return NextResponse.json(
        { error: 'Only parties to the dispute can submit evidence' },
        { status: 403 }
      );
    }

    // Check if dispute is still open for evidence
    if (['resolved', 'closed'].includes(dispute.status)) {
      return NextResponse.json(
        { error: 'Dispute is closed for new evidence' },
        { status: 400 }
      );
    }

    // Check evidence deadline
    if (dispute.evidence_deadline && new Date(dispute.evidence_deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Evidence submission deadline has passed' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = submitEvidenceSchema.parse(body);

    // Validate that either file_url or external_url is provided
    if (!validatedData.file_url && !validatedData.external_url) {
      return NextResponse.json(
        { error: 'Either file_url or external_url must be provided' },
        { status: 400 }
      );
    }

    const { data: evidence, error: createError } = await supabase
      .from('dispute_evidence')
      .insert({
        dispute_id: id,
        submitted_by: user.id,
        title: validatedData.title,
        description: validatedData.description,
        evidence_type: validatedData.evidence_type,
        file_url: validatedData.file_url,
        file_name: validatedData.file_name,
        file_size: validatedData.file_size,
        file_type: validatedData.file_type,
        external_url: validatedData.external_url,
      })
      .select(`
        *,
        submitter:users!submitted_by (id, name, avatar_url)
      `)
      .single();

    if (createError) {
      throw createError;
    }

    // Log activity
    await supabase.from('dispute_activity').insert({
      dispute_id: id,
      actor_id: user.id,
      activity_type: 'evidence_submitted',
      description: `Evidence submitted: ${validatedData.title}`,
      related_entity_type: 'evidence',
      related_entity_id: evidence.id,
    });

    // Update dispute status to evidence_review if both parties have submitted
    const { count: initiatorEvidenceCount } = await supabase
      .from('dispute_evidence')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', id)
      .eq('submitted_by', dispute.initiator_id);

    const { count: respondentEvidenceCount } = await supabase
      .from('dispute_evidence')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', id)
      .eq('submitted_by', dispute.respondent_id);

    if ((initiatorEvidenceCount || 0) > 0 && (respondentEvidenceCount || 0) > 0) {
      await supabase
        .from('disputes')
        .update({ status: 'evidence_review', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'in_discussion');
    }

    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Evidence POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
