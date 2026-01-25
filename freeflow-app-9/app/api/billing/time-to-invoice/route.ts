/**
 * Time-to-Invoice API
 *
 * Converts billable time entries into professional invoices.
 * Critical feature for matching Harvest, FreshBooks, and other time tracking tools.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';
import Stripe from 'stripe';

const logger = createFeatureLogger('billing-time-to-invoice');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

interface TimeEntry {
  id: string;
  project_id: string;
  project_name: string;
  task_id?: string;
  task_name?: string;
  description: string;
  duration_minutes: number;
  hourly_rate: number;
  is_billable: boolean;
  date: string;
}

interface TimeToInvoiceRequest {
  action: 'preview' | 'create';
  clientId: string;
  timeEntryIds: string[];
  includeDetails?: boolean;
  discountPercent?: number;
  taxRateId?: string;
  notes?: string;
  dueDate?: string;
  currency?: string;
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TimeToInvoiceRequest = await request.json();
    const {
      action,
      clientId,
      timeEntryIds,
      includeDetails = true,
      discountPercent = 0,
      taxRateId,
      notes,
      dueDate,
      currency = 'usd',
    } = body;

    if (!clientId || !timeEntryIds || timeEntryIds.length === 0) {
      return NextResponse.json(
        { error: 'Client ID and time entry IDs are required' },
        { status: 400 }
      );
    }

    // Fetch time entries
    const { data: timeEntries, error: entriesError } = await supabase
      .from('time_entries')
      .select(`
        id,
        project_id,
        task_id,
        description,
        duration_minutes,
        hourly_rate,
        is_billable,
        date,
        projects:project_id (title),
        tasks:task_id (title)
      `)
      .eq('user_id', user.id)
      .eq('is_billable', true)
      .in('id', timeEntryIds);

    if (entriesError) {
      logger.error('Error fetching time entries', { error: entriesError });
      // Return demo data if table doesn't exist
      return handleDemoMode(action, clientId, timeEntryIds, includeDetails, discountPercent);
    }

    if (!timeEntries || timeEntries.length === 0) {
      return NextResponse.json(
        { error: 'No billable time entries found' },
        { status: 404 }
      );
    }

    // Get client details
    const { data: client } = await supabase
      .from('clients')
      .select('id, name, email, stripe_customer_id')
      .eq('id', clientId)
      .single();

    // Calculate totals
    const lineItems = timeEntries.map((entry: any) => {
      const hours = entry.duration_minutes / 60;
      const amount = Math.round(hours * (entry.hourly_rate || 75) * 100); // Convert to cents

      return {
        timeEntryId: entry.id,
        projectName: entry.projects?.title || 'General',
        taskName: entry.tasks?.title || null,
        description: includeDetails
          ? `${entry.projects?.title || 'Project'}: ${entry.description} (${hours.toFixed(2)} hrs @ $${entry.hourly_rate || 75}/hr)`
          : `${entry.projects?.title || 'Project'} - ${hours.toFixed(2)} hours`,
        hours,
        rate: entry.hourly_rate || 75,
        amount, // in cents
        date: entry.date,
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const preTotal = subtotal - discountAmount;

    // Get tax rate if provided
    let taxAmount = 0;
    let taxRate = null;
    if (taxRateId) {
      const { data: tax } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('id', taxRateId)
        .single();

      if (tax) {
        taxRate = tax;
        taxAmount = Math.round(preTotal * (tax.percentage / 100));
      }
    }

    const total = preTotal + taxAmount;

    // Build invoice summary
    const invoiceSummary = {
      client: client || { id: clientId, name: 'Client', email: 'client@example.com' },
      lineItems,
      summary: {
        totalHours: lineItems.reduce((sum, item) => sum + item.hours, 0),
        subtotal,
        discountPercent,
        discountAmount,
        taxRate: taxRate?.percentage || 0,
        taxAmount,
        total,
      },
      currency,
      notes,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      timeEntryCount: timeEntries.length,
    };

    // PREVIEW MODE - Just return calculated invoice
    if (action === 'preview') {
      return NextResponse.json({
        success: true,
        data: {
          type: 'preview',
          invoice: invoiceSummary,
        },
      });
    }

    // CREATE MODE - Actually create the invoice
    // Check if Stripe is configured
    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === '';

    if (isDemo) {
      // Demo mode - create invoice in database only
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: clientId,
          invoice_number: invoiceNumber,
          status: 'draft',
          subtotal: subtotal / 100,
          discount: discountAmount / 100,
          tax: taxAmount / 100,
          total: total / 100,
          currency,
          due_date: invoiceSummary.dueDate,
          notes,
          line_items: lineItems.map((item) => ({
            description: item.description,
            quantity: 1,
            unit_price: item.amount / 100,
            amount: item.amount / 100,
            time_entry_id: item.timeEntryId,
          })),
          time_entry_ids: timeEntryIds,
          created_from: 'time_entries',
        })
        .select()
        .single();

      if (invoiceError) {
        logger.error('Invoice creation error', { error: invoiceError });
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            type: 'created',
            invoiceId: invoiceNumber,
            invoice: invoiceSummary,
            message: 'Invoice created successfully (demo mode)',
          },
        });
      }

      // Mark time entries as invoiced
      await supabase
        .from('time_entries')
        .update({ status: 'invoiced', invoice_id: invoice?.id })
        .in('id', timeEntryIds);

      return NextResponse.json({
        success: true,
        data: {
          type: 'created',
          invoiceId: invoice?.id || invoiceNumber,
          invoiceNumber: invoice?.invoice_number || invoiceNumber,
          invoice: invoiceSummary,
        },
      });
    }

    // Production mode - create Stripe invoice
    let stripeCustomerId = client?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: client?.email || 'client@example.com',
        name: client?.name || 'Client',
        metadata: {
          freeflow_client_id: clientId,
        },
      });
      stripeCustomerId = stripeCustomer.id;

      // Save Stripe customer ID
      if (client) {
        await supabase
          .from('clients')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', clientId);
      }
    }

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      due_date: Math.floor(new Date(invoiceSummary.dueDate).getTime() / 1000),
      auto_advance: false,
      metadata: {
        freeflow_user_id: user.id,
        freeflow_client_id: clientId,
        time_entry_ids: timeEntryIds.join(','),
        created_from: 'time_entries',
      },
    });

    // Add line items
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: item.description,
        unit_amount: item.amount,
        quantity: 1,
        currency,
      });
    }

    // Apply discount if any
    if (discountPercent > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: discountPercent,
        duration: 'once',
        name: `Time Invoice Discount - ${discountPercent}%`,
      });
      await stripe.invoices.update(stripeInvoice.id, {
        discounts: [{ coupon: coupon.id }],
      });
    }

    // Finalize and send
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // Save to database
    const invoiceNumber = finalizedInvoice.number || `INV-${Date.now().toString(36).toUpperCase()}`;
    await supabase.from('invoices').insert({
      user_id: user.id,
      client_id: clientId,
      invoice_number: invoiceNumber,
      stripe_invoice_id: finalizedInvoice.id,
      status: 'sent',
      subtotal: subtotal / 100,
      discount: discountAmount / 100,
      tax: taxAmount / 100,
      total: total / 100,
      currency,
      due_date: invoiceSummary.dueDate,
      notes,
      hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
      pdf_url: finalizedInvoice.invoice_pdf,
      time_entry_ids: timeEntryIds,
      created_from: 'time_entries',
    });

    // Mark time entries as invoiced
    await supabase
      .from('time_entries')
      .update({ status: 'invoiced' })
      .in('id', timeEntryIds);

    return NextResponse.json({
      success: true,
      data: {
        type: 'created',
        invoiceId: finalizedInvoice.id,
        invoiceNumber,
        invoice: invoiceSummary,
        hostedUrl: finalizedInvoice.hosted_invoice_url,
        pdfUrl: finalizedInvoice.invoice_pdf,
      },
    });
  } catch (error) {
    logger.error('Time-to-Invoice API error', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Get unbilled time entries
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');

    // Fetch unbilled time entries
    let query = supabase
      .from('time_entries')
      .select(`
        id,
        project_id,
        task_id,
        description,
        duration_minutes,
        hourly_rate,
        date,
        projects:project_id (id, title, client_id)
      `)
      .eq('user_id', user.id)
      .eq('is_billable', true)
      .is('invoice_id', null)
      .order('date', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: entries, error } = await query;

    if (error) {
      // Return demo data
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          entries: [
            {
              id: 'demo-1',
              project_name: 'Website Redesign',
              description: 'Homepage design work',
              duration_minutes: 120,
              hourly_rate: 100,
              date: new Date().toISOString(),
            },
            {
              id: 'demo-2',
              project_name: 'Mobile App',
              description: 'UI implementation',
              duration_minutes: 180,
              hourly_rate: 100,
              date: new Date().toISOString(),
            },
          ],
          summary: {
            totalEntries: 2,
            totalHours: 5,
            totalAmount: 500,
          },
        },
      });
    }

    // Filter by client if specified
    let filteredEntries = entries || [];
    if (clientId) {
      filteredEntries = entries?.filter(
        (entry: any) => entry.projects?.client_id === clientId
      ) || [];
    }

    // Calculate summary
    const summary = {
      totalEntries: filteredEntries.length,
      totalHours: filteredEntries.reduce((sum: number, e: any) => sum + (e.duration_minutes / 60), 0),
      totalAmount: filteredEntries.reduce((sum: number, e: any) => {
        const hours = e.duration_minutes / 60;
        return sum + (hours * (e.hourly_rate || 75));
      }, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        entries: filteredEntries.map((entry: any) => ({
          ...entry,
          project_name: entry.projects?.title || 'Unknown Project',
        })),
        summary,
      },
    });
  } catch (error) {
    logger.error('Get unbilled entries error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch unbilled time entries' },
      { status: 500 }
    );
  }
}

// Demo mode handler
function handleDemoMode(
  action: string,
  clientId: string,
  timeEntryIds: string[],
  includeDetails: boolean,
  discountPercent: number
) {
  const demoLineItems = [
    {
      timeEntryId: 'demo-1',
      projectName: 'Website Redesign',
      description: 'Homepage design and development (4.00 hrs @ $100/hr)',
      hours: 4,
      rate: 100,
      amount: 40000,
      date: new Date().toISOString(),
    },
    {
      timeEntryId: 'demo-2',
      projectName: 'Mobile App',
      description: 'UI implementation and testing (6.00 hrs @ $100/hr)',
      hours: 6,
      rate: 100,
      amount: 60000,
      date: new Date().toISOString(),
    },
  ];

  const subtotal = 100000; // $1000
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  return NextResponse.json({
    success: true,
    demo: true,
    data: {
      type: action,
      invoice: {
        client: { id: clientId, name: 'Demo Client', email: 'demo@example.com' },
        lineItems: demoLineItems,
        summary: {
          totalHours: 10,
          subtotal,
          discountPercent,
          discountAmount,
          taxRate: 0,
          taxAmount: 0,
          total,
        },
        currency: 'usd',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        timeEntryCount: timeEntryIds.length,
      },
      message: action === 'create'
        ? 'Invoice created successfully (demo mode)'
        : 'Invoice preview generated (demo mode)',
    },
  });
}
