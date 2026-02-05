/**
 * Disputes API - FreeFlow A+++ Implementation
 * Create and list disputes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createSimpleLogger } from '@/lib/simple-logger';

import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('disputes');

const createDisputeSchema = z.object({
  order_id: z.string().uuid(),
  dispute_type: z.enum([
    'not_as_described', 'quality_issue', 'late_delivery', 'no_delivery',
    'scope_creep', 'communication', 'refund_request', 'payment_issue',
    'intellectual_property', 'harassment', 'other'
  ]),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  disputed_amount: z.number().min(0),
  evidence_urls: z.array(z.string()).optional(),
});

// GET - List user's disputes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'initiator', 'respondent', or 'all'
    const orderId = searchParams.get('order_id');

    let query = supabase
      .from('disputes')
      .select(`
        *,
        order:service_orders (
          id, package_name, total, status,
          listing:service_listings (id, title, images)
        ),
        initiator:auth.users!initiator_id (id, email, raw_user_meta_data),
        respondent:auth.users!respondent_id (id, email, raw_user_meta_data),
        mediator:auth.users!mediator_id (id, email, raw_user_meta_data),
        messages:dispute_messages (count),
        evidence:dispute_evidence (count),
        proposals:dispute_proposals (count)
      `)
      .order('created_at', { ascending: false });

    // Filter by role
    if (role === 'initiator') {
      query = query.eq('initiator_id', user.id);
    } else if (role === 'respondent') {
      query = query.eq('respondent_id', user.id);
    } else {
      query = query.or(`initiator_id.eq.${user.id},respondent_id.eq.${user.id},mediator_id.eq.${user.id}`);
    }

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: disputes, error } = await query;

    if (error && error.code !== '42P01') {
      throw error;
    }

    return NextResponse.json({ disputes: disputes || [] });
  } catch (error) {
    logger.error('Disputes GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDisputeSchema.parse(body);

    // Get order details to validate
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select('*, listing:service_listings (user_id)')
      .eq('id', validatedData.order_id)
      .single();

    if (orderError) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify user is part of this order
    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You are not a party to this order' },
        { status: 403 }
      );
    }

    // Check if active dispute already exists for this order
    const { data: existingDispute } = await supabase
      .from('disputes')
      .select('id, status')
      .eq('order_id', validatedData.order_id)
      .not('status', 'in', '("resolved","closed")')
      .single();

    if (existingDispute) {
      return NextResponse.json(
        { error: 'An active dispute already exists for this order', dispute_id: existingDispute.id },
        { status: 409 }
      );
    }

    // Determine respondent
    const respondentId = isBuyer ? order.seller_id : order.buyer_id;

    // Calculate deadlines
    const responseDeadline = new Date();
    responseDeadline.setDate(responseDeadline.getDate() + 3); // 3 days to respond

    const evidenceDeadline = new Date();
    evidenceDeadline.setDate(evidenceDeadline.getDate() + 7); // 7 days for evidence

    // Create the dispute
    const { data: dispute, error: createError } = await supabase
      .from('disputes')
      .insert({
        order_id: validatedData.order_id,
        initiator_id: user.id,
        respondent_id: respondentId,
        dispute_type: validatedData.dispute_type,
        title: validatedData.title,
        description: validatedData.description,
        disputed_amount: validatedData.disputed_amount,
        currency: order.currency || 'USD',
        buyer_is_initiator: isBuyer,
        status: 'opened',
        response_deadline: responseDeadline.toISOString(),
        evidence_deadline: evidenceDeadline.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Log activity
    await supabase.from('dispute_activity').insert({
      dispute_id: dispute.id,
      actor_id: user.id,
      activity_type: 'opened',
      description: `Dispute opened: ${validatedData.title}`,
    });

    // Add initial evidence if provided
    if (validatedData.evidence_urls && validatedData.evidence_urls.length > 0) {
      const evidenceInserts = validatedData.evidence_urls.map((url, index) => ({
        dispute_id: dispute.id,
        submitted_by: user.id,
        title: `Evidence ${index + 1}`,
        evidence_type: 'file',
        file_url: url,
      }));

      await supabase.from('dispute_evidence').insert(evidenceInserts);
    }

    // Update order status to disputed
    await supabase
      .from('service_orders')
      .update({ status: 'disputed', updated_at: new Date().toISOString() })
      .eq('id', validatedData.order_id);

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Disputes POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
