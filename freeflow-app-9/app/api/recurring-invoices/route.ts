/**
 * Recurring Invoices API - FreeFlow A+++ Implementation
 * Handles CRUD operations for recurring invoice templates
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

const logger = createFeatureLogger('recurring-invoices');

// ============ Validation Schemas ============

const lineItemSchema = z.object({
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

const createTemplateSchema = z.object({
  template_name: z.string().min(1).max(255),
  template_code: z.string().max(50).optional(),
  description: z.string().optional(),
  client_id: z.string().uuid().optional(),
  client_name: z.string().optional(),
  client_email: z.string().email().optional(),
  client_address: z.string().optional(),
  frequency: z.enum([
    'daily', 'weekly', 'biweekly', 'monthly',
    'quarterly', 'biannually', 'annually', 'custom'
  ]).default('monthly'),
  custom_interval_days: z.number().int().positive().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  day_of_month: z.number().int().min(1).max(31).optional(),
  month_of_year: z.number().int().min(1).max(12).optional(),
  invoice_prefix: z.string().max(20).default('INV'),
  currency: z.string().length(3).default('USD'),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_type: z.enum(['percentage', 'fixed']).default('percentage'),
  discount_value: z.number().min(0).default(0),
  payment_terms_days: z.number().int().min(0).default(30),
  late_fee_enabled: z.boolean().default(false),
  late_fee_percentage: z.number().min(0).max(100).default(0),
  late_fee_grace_days: z.number().int().min(0).default(0),
  auto_send: z.boolean().default(false),
  send_days_before: z.number().int().min(0).default(0),
  cc_emails: z.array(z.string().email()).optional(),
  bcc_emails: z.array(z.string().email()).optional(),
  email_subject_template: z.string().optional(),
  email_body_template: z.string().optional(),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1),
});

const updateTemplateSchema = createTemplateSchema.partial().extend({
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
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

function calculateNextRunDate(startDate: string, frequency: string): string {
  const date = new Date(startDate);

  // If start date is in the future, use it
  if (date > new Date()) {
    return startDate;
  }

  // Otherwise calculate next occurrence
  const now = new Date();

  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case 'biweekly':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().split('T')[0];
    case 'quarterly':
      const nextQuarter = new Date(now);
      nextQuarter.setMonth(nextQuarter.getMonth() + 3);
      return nextQuarter.toISOString().split('T')[0];
    case 'biannually':
      const nextHalf = new Date(now);
      nextHalf.setMonth(nextHalf.getMonth() + 6);
      return nextHalf.toISOString().split('T')[0];
    case 'annually':
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return nextYear.toISOString().split('T')[0];
    default:
      return startDate;
  }
}

// ============ GET Handler ============

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const frequency = searchParams.get('frequency');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('recurring_invoice_templates')
      .select(`
        *,
        client:clients(id, name, email),
        line_items:recurring_invoice_line_items(*)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (frequency) {
      query = query.eq('frequency', frequency);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('GET recurring-invoices error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============ POST Handler ============

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { line_items, ...templateData } = validation.data;

    // Calculate line item totals
    const processedLineItems = line_items.map(calculateLineItemTotals);

    // Calculate template totals
    const subtotal = processedLineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = processedLineItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const discountAmount = processedLineItems.reduce((sum, item) => sum + item.discount_amount, 0);
    const totalAmount = processedLineItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate next run date
    const nextRunDate = calculateNextRunDate(templateData.start_date, templateData.frequency);

    // Insert template
    const { data: template, error: templateError } = await supabase
      .from('recurring_invoice_templates')
      .insert({
        ...templateData,
        user_id: user.id,
        next_run_date: nextRunDate,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (templateError) {
      return NextResponse.json({ error: templateError.message }, { status: 400 });
    }

    // Insert line items
    const lineItemsToInsert = processedLineItems.map((item, index) => ({
      ...item,
      template_id: template.id,
      sort_order: item.sort_order || index,
    }));

    const { error: lineItemsError } = await supabase
      .from('recurring_invoice_line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      // Rollback template
      await supabase
        .from('recurring_invoice_templates')
        .delete()
        .eq('id', template.id);

      return NextResponse.json({ error: lineItemsError.message }, { status: 400 });
    }

    // Fetch complete template with line items
    const { data: completeTemplate, error: fetchError } = await supabase
      .from('recurring_invoice_templates')
      .select(`
        *,
        client:clients(id, name, email),
        line_items:recurring_invoice_line_items(*)
      `)
      .eq('id', template.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    return NextResponse.json({ data: completeTemplate }, { status: 201 });
  } catch (error) {
    logger.error('POST recurring-invoices error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============ PATCH Handler (Bulk Update) ============

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'pause':
        updateData = { status: 'paused' };
        break;
      case 'resume':
        updateData = { status: 'active' };
        break;
      case 'cancel':
        updateData = { status: 'cancelled' };
        break;
      case 'delete':
        updateData = { deleted_at: new Date().toISOString() };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('recurring_invoice_templates')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('id', ids)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, updated: data.length });
  } catch (error) {
    logger.error('PATCH recurring-invoices error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
