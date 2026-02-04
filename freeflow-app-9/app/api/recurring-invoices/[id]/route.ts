/**
 * Individual Recurring Invoice API - FreeFlow A+++ Implementation
 * Handles single template operations: GET, PUT, DELETE
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

const logger = createSimpleLogger('recurring-invoice');

// ============ Validation Schema ============

const lineItemSchema = z.object({
  id: z.string().uuid().optional(),
  item_name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit_price: z.number().min(0),
  unit: z.string().optional(),
  taxable: z.boolean().default(true),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().min(0).default(0),
  sort_order: z.number().int().default(0),
});

const updateSchema = z.object({
  template_name: z.string().min(1).max(255).optional(),
  template_code: z.string().max(50).optional(),
  description: z.string().optional(),
  client_id: z.string().uuid().nullable().optional(),
  client_name: z.string().optional(),
  client_email: z.string().email().optional(),
  client_address: z.string().optional(),
  frequency: z.enum([
    'daily', 'weekly', 'biweekly', 'monthly',
    'quarterly', 'biannually', 'annually', 'custom'
  ]).optional(),
  custom_interval_days: z.number().int().positive().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  day_of_week: z.number().int().min(0).max(6).nullable().optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  month_of_year: z.number().int().min(1).max(12).nullable().optional(),
  invoice_prefix: z.string().max(20).optional(),
  currency: z.string().length(3).optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().min(0).optional(),
  payment_terms_days: z.number().int().min(0).optional(),
  late_fee_enabled: z.boolean().optional(),
  late_fee_percentage: z.number().min(0).max(100).optional(),
  late_fee_grace_days: z.number().int().min(0).optional(),
  auto_send: z.boolean().optional(),
  send_days_before: z.number().int().min(0).optional(),
  cc_emails: z.array(z.string().email()).optional(),
  bcc_emails: z.array(z.string().email()).optional(),
  email_subject_template: z.string().optional(),
  email_body_template: z.string().optional(),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  line_items: z.array(lineItemSchema).optional(),
});

// ============ Helper Functions ============

function calculateLineItemTotals(item: z.infer<typeof lineItemSchema>) {
  const subtotal = item.quantity * item.unit_price;
  let discountAmount = 0;

  if (item.discount_value > 0) {
    discountAmount = item.discount_type === 'percentage'
      ? subtotal * (item.discount_value / 100)
      : item.discount_value;
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = item.taxable && item.tax_rate
    ? taxableAmount * (item.tax_rate / 100)
    : 0;

  return {
    ...item,
    subtotal,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    total: taxableAmount + taxAmount,
  };
}

// ============ GET Handler ============

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

    const { data, error } = await supabase
      .from('recurring_invoice_templates')
      .select(`
        *,
        client:clients(id, name, email, company),
        line_items:recurring_invoice_line_items(*),
        executions:recurring_invoice_executions(
          id, scheduled_date, executed_at, status, invoice_id, total_amount, error_message
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('GET recurring-invoice error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============ PUT Handler ============

export async function PUT(
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

    // Check ownership
    const { data: existing, error: checkError } = await supabase
      .from('recurring_invoice_templates')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { line_items, ...templateUpdates } = validation.data;

    // Start transaction-like operations
    let templateTotals = {};

    // Handle line items if provided
    if (line_items && line_items.length > 0) {
      // Delete existing line items
      await supabase
        .from('recurring_invoice_line_items')
        .delete()
        .eq('template_id', id);

      // Calculate and insert new line items
      const processedLineItems = line_items.map(calculateLineItemTotals);

      const lineItemsToInsert = processedLineItems.map((item, index) => ({
        ...item,
        template_id: id,
        sort_order: item.sort_order || index,
      }));

      const { error: lineItemsError } = await supabase
        .from('recurring_invoice_line_items')
        .insert(lineItemsToInsert);

      if (lineItemsError) {
        return NextResponse.json({ error: lineItemsError.message }, { status: 400 });
      }

      // Calculate totals
      templateTotals = {
        subtotal: processedLineItems.reduce((sum, item) => sum + item.subtotal, 0),
        tax_amount: processedLineItems.reduce((sum, item) => sum + item.tax_amount, 0),
        discount_amount: processedLineItems.reduce((sum, item) => sum + item.discount_amount, 0),
        total_amount: processedLineItems.reduce((sum, item) => sum + item.total, 0),
      };
    }

    // Update template
    const { data: updated, error: updateError } = await supabase
      .from('recurring_invoice_templates')
      .update({
        ...templateUpdates,
        ...templateTotals,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        client:clients(id, name, email),
        line_items:recurring_invoice_line_items(*)
      `)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Log modification
    await supabase
      .from('recurring_invoice_modifications')
      .insert({
        template_id: id,
        modification_type: 'update',
        modified_by: user.id,
        new_values: validation.data,
      });

    return NextResponse.json({ data: updated });
  } catch (error) {
    logger.error('PUT recurring-invoice error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============ DELETE Handler ============

export async function DELETE(
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

    // Soft delete
    const { error: deleteError } = await supabase
      .from('recurring_invoice_templates')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Log modification
    await supabase
      .from('recurring_invoice_modifications')
      .insert({
        template_id: id,
        modification_type: 'delete',
        modified_by: user.id,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE recurring-invoice error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
