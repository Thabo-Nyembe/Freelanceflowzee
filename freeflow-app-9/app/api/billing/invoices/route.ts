import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable?: boolean;
}

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionId?: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'void' | 'uncollectible';
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  lineItems: LineItem[];
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

// GET - Fetch invoices
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (invoiceId) {
      // Fetch single invoice with full details
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          users(id, name, email),
          subscriptions(id, plan_id, plans(name, price)),
          payments(id, amount, status, created_at, payment_method)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      // Fetch organization details for invoice header
      const { data: organization } = await supabase
        .from('organizations')
        .select('name, address, tax_id, logo_url')
        .eq('id', invoice.organization_id)
        .single();

      return NextResponse.json({
        invoice: {
          ...invoice,
          organization
        }
      });
    }

    // Build query for invoice list
    let query = supabase
      .from('invoices')
      .select(`
        *,
        users(id, name, email)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: invoices, error, count } = await query;

    if (error) throw error;

    // Calculate summary stats
    const { data: stats } = await supabase
      .from('invoices')
      .select('status, total')
      .eq('organization_id', organizationId);

    const summary = {
      total: stats?.length || 0,
      totalRevenue: stats?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0) || 0,
      outstanding: stats?.filter(i => ['pending', 'draft'].includes(i.status)).reduce((sum, i) => sum + i.total, 0) || 0,
      overdue: stats?.filter(i => i.status === 'pending').length || 0,
      byStatus: {
        draft: stats?.filter(i => i.status === 'draft').length || 0,
        pending: stats?.filter(i => i.status === 'pending').length || 0,
        paid: stats?.filter(i => i.status === 'paid').length || 0,
        failed: stats?.filter(i => i.status === 'failed').length || 0,
        void: stats?.filter(i => i.status === 'void').length || 0
      }
    };

    return NextResponse.json({
      invoices: invoices || [],
      summary,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Invoice actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create': {
        const {
          organizationId,
          customerId,
          subscriptionId,
          lineItems,
          dueDate,
          currency,
          memo,
          footer,
          taxRate,
          discountAmount
        } = params;

        // Generate invoice number
        const { data: lastInvoice } = await supabase
          .from('invoices')
          .select('number')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const lastNumber = lastInvoice?.number ? parseInt(lastInvoice.number.split('-')[1]) : 0;
        const invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;

        // Calculate totals
        const subtotal = lineItems.reduce((sum: number, item: LineItem) => sum + item.amount, 0);
        const taxableAmount = lineItems
          .filter((item: LineItem) => item.taxable !== false)
          .reduce((sum: number, item: LineItem) => sum + item.amount, 0);
        const taxAmount = taxableAmount * (taxRate || 0) / 100;
        const total = subtotal + taxAmount - (discountAmount || 0);

        const { data: invoice, error } = await supabase
          .from('invoices')
          .insert({
            organization_id: organizationId,
            customer_id: customerId,
            subscription_id: subscriptionId,
            number: invoiceNumber,
            status: 'draft',
            currency: currency || 'USD',
            subtotal,
            tax_amount: taxAmount,
            tax_rate: taxRate || 0,
            discount_amount: discountAmount || 0,
            total,
            amount_due: total,
            amount_paid: 0,
            line_items: lineItems,
            due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            memo,
            footer
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'invoice_created',
          resource_type: 'invoice',
          resource_id: invoice.id,
          details: { invoiceNumber, total }
        });

        return NextResponse.json({
          success: true,
          invoice
        });
      }

      case 'update': {
        const { invoiceId, updates } = params;

        // Check invoice status
        const { data: existing } = await supabase
          .from('invoices')
          .select('status')
          .eq('id', invoiceId)
          .single();

        if (existing?.status === 'paid') {
          return NextResponse.json(
            { error: 'Cannot update a paid invoice' },
            { status: 400 }
          );
        }

        // Recalculate totals if line items changed
        if (updates.line_items) {
          const subtotal = updates.line_items.reduce((sum: number, item: LineItem) => sum + item.amount, 0);
          const taxableAmount = updates.line_items
            .filter((item: LineItem) => item.taxable !== false)
            .reduce((sum: number, item: LineItem) => sum + item.amount, 0);
          const taxAmount = taxableAmount * (updates.tax_rate || existing?.tax_rate || 0) / 100;
          const total = subtotal + taxAmount - (updates.discount_amount || 0);

          updates.subtotal = subtotal;
          updates.tax_amount = taxAmount;
          updates.total = total;
          updates.amount_due = total - (existing?.amount_paid || 0);
        }

        const { data: invoice, error } = await supabase
          .from('invoices')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          invoice
        });
      }

      case 'finalize': {
        const { invoiceId, sendEmail } = params;

        const { data: invoice, error } = await supabase
          .from('invoices')
          .update({
            status: 'pending',
            finalized_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
          .eq('status', 'draft')
          .select('*, users(email, name)')
          .single();

        if (error) throw error;

        if (sendEmail && invoice.users?.email) {
          // Queue email notification
          await supabase.from('email_queue').insert({
            to: invoice.users.email,
            template: 'invoice_finalized',
            data: {
              invoiceNumber: invoice.number,
              amount: invoice.total,
              dueDate: invoice.due_date,
              customerName: invoice.users.name,
              invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`
            }
          });
        }

        return NextResponse.json({
          success: true,
          invoice,
          emailSent: sendEmail && !!invoice.users?.email
        });
      }

      case 'send': {
        const { invoiceId, email, message } = params;

        const { data: invoice } = await supabase
          .from('invoices')
          .select('*, users(email, name), organizations(name)')
          .eq('id', invoiceId)
          .single();

        if (!invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const recipientEmail = email || invoice.users?.email;
        if (!recipientEmail) {
          return NextResponse.json({ error: 'No recipient email' }, { status: 400 });
        }

        // Queue email
        await supabase.from('email_queue').insert({
          to: recipientEmail,
          template: 'invoice_sent',
          data: {
            invoiceNumber: invoice.number,
            amount: invoice.total,
            currency: invoice.currency,
            dueDate: invoice.due_date,
            customerName: invoice.users?.name,
            organizationName: invoice.organizations?.name,
            customMessage: message,
            invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/pay`
          }
        });

        // Update sent timestamp
        await supabase
          .from('invoices')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invoiceId);

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'invoice_sent',
          resource_type: 'invoice',
          resource_id: invoiceId,
          details: { recipientEmail }
        });

        return NextResponse.json({
          success: true,
          message: `Invoice sent to ${recipientEmail}`
        });
      }

      case 'record-payment': {
        const { invoiceId, amount, paymentMethod, transactionId, notes } = params;

        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (!invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const newAmountPaid = (invoice.amount_paid || 0) + amount;
        const newAmountDue = invoice.total - newAmountPaid;
        const newStatus = newAmountDue <= 0 ? 'paid' : 'pending';

        // Create payment record
        const { data: payment } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            organization_id: invoice.organization_id,
            customer_id: invoice.customer_id,
            amount,
            currency: invoice.currency,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            status: 'completed',
            notes
          })
          .select()
          .single();

        // Update invoice
        await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            amount_due: newAmountDue,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId);

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'payment_recorded',
          resource_type: 'invoice',
          resource_id: invoiceId,
          details: { amount, paymentMethod, paymentId: payment?.id }
        });

        return NextResponse.json({
          success: true,
          payment,
          invoiceStatus: newStatus,
          amountDue: newAmountDue
        });
      }

      case 'void': {
        const { invoiceId, reason } = params;

        const { data: invoice } = await supabase
          .from('invoices')
          .select('status')
          .eq('id', invoiceId)
          .single();

        if (invoice?.status === 'paid') {
          return NextResponse.json(
            { error: 'Cannot void a paid invoice. Create a credit note instead.' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('invoices')
          .update({
            status: 'void',
            void_reason: reason,
            voided_at: new Date().toISOString(),
            voided_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId);

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'invoice_voided',
          resource_type: 'invoice',
          resource_id: invoiceId,
          details: { reason }
        });

        return NextResponse.json({
          success: true,
          message: 'Invoice voided successfully'
        });
      }

      case 'create-credit-note': {
        const { invoiceId, amount, reason, lineItems } = params;

        const { data: originalInvoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (!originalInvoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Generate credit note number
        const creditNoteNumber = `CN-${originalInvoice.number}`;

        const { data: creditNote, error } = await supabase
          .from('invoices')
          .insert({
            organization_id: originalInvoice.organization_id,
            customer_id: originalInvoice.customer_id,
            number: creditNoteNumber,
            type: 'credit_note',
            status: 'paid',
            currency: originalInvoice.currency,
            subtotal: -amount,
            tax_amount: 0,
            discount_amount: 0,
            total: -amount,
            amount_paid: -amount,
            amount_due: 0,
            line_items: lineItems || [{
              description: `Credit for Invoice ${originalInvoice.number}`,
              quantity: 1,
              unitPrice: -amount,
              amount: -amount
            }],
            related_invoice_id: invoiceId,
            memo: reason
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'credit_note_created',
          resource_type: 'invoice',
          resource_id: creditNote.id,
          details: { originalInvoiceId: invoiceId, amount, reason }
        });

        return NextResponse.json({
          success: true,
          creditNote
        });
      }

      case 'download-pdf': {
        const { invoiceId } = params;

        // In a real implementation, this would generate a PDF
        // For now, return invoice data that can be used to generate PDF on client
        const { data: invoice } = await supabase
          .from('invoices')
          .select(`
            *,
            users(name, email, address),
            organizations(name, address, tax_id, logo_url)
          `)
          .eq('id', invoiceId)
          .single();

        if (!invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          invoice,
          pdfData: {
            // This would normally be a PDF buffer or URL
            message: 'PDF generation endpoint - implement with @react-pdf/renderer'
          }
        });
      }

      case 'bulk-send': {
        const { invoiceIds, message } = params;

        const results = [];
        for (const invoiceId of invoiceIds) {
          try {
            const { data: invoice } = await supabase
              .from('invoices')
              .select('*, users(email, name)')
              .eq('id', invoiceId)
              .single();

            if (invoice?.users?.email) {
              await supabase.from('email_queue').insert({
                to: invoice.users.email,
                template: 'invoice_sent',
                data: {
                  invoiceNumber: invoice.number,
                  amount: invoice.total,
                  customMessage: message,
                  invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/pay`
                }
              });

              await supabase
                .from('invoices')
                .update({ sent_at: new Date().toISOString() })
                .eq('id', invoiceId);

              results.push({ invoiceId, success: true });
            } else {
              results.push({ invoiceId, success: false, error: 'No email address' });
            }
          } catch (err) {
            results.push({ invoiceId, success: false, error: 'Failed to send' });
          }
        }

        return NextResponse.json({
          success: true,
          results,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Invoice action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform invoice action' },
      { status: 500 }
    );
  }
}
