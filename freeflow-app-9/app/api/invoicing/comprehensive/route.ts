// =====================================================
// KAZI Invoicing API - Comprehensive Route
// Full invoicing with Stripe integration
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { invoicingService } from '@/lib/invoicing/invoicing-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('invoicing');

// =====================================================
// GET - List invoices, clients, analytics
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const invoiceId = searchParams.get('id');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(action, invoiceId);
    }

    switch (action) {
      case 'get': {
        if (!invoiceId) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID required' },
            { status: 400 }
          );
        }
        const invoice = await invoicingService.getInvoice(invoiceId, user.id);
        if (!invoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, invoice });
      }

      case 'clients': {
        const clientId = searchParams.get('clientId');
        if (clientId) {
          const client = await invoicingService.getClient(clientId, user.id);
          return NextResponse.json({ success: true, client });
        }

        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') as any;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await invoicingService.listClients(
          user.id,
          { search, status },
          { page, limit }
        );

        return NextResponse.json({
          success: true,
          ...result,
          page,
          limit
        });
      }

      case 'analytics': {
        const currency = searchParams.get('currency') || 'USD';
        const dashboard = await invoicingService.getAnalyticsDashboard(user.id, currency);
        return NextResponse.json({ success: true, analytics: dashboard });
      }

      case 'stats': {
        const period = searchParams.get('period') as any;
        const stats = await invoicingService.getInvoiceStats(user.id, period);
        return NextResponse.json({ success: true, stats });
      }

      case 'templates': {
        const templates = await invoicingService.getTemplates(user.id);
        return NextResponse.json({ success: true, templates });
      }

      case 'recurring': {
        const recurring = await invoicingService.getRecurringInvoices(user.id);
        return NextResponse.json({ success: true, recurring });
      }

      case 'overdue': {
        const overdue = await invoicingService.getOverdueInvoices(user.id);
        return NextResponse.json({ success: true, invoices: overdue });
      }

      case 'payments': {
        if (!invoiceId) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID required' },
            { status: 400 }
          );
        }
        const payments = await invoicingService.getPayments(invoiceId, user.id);
        return NextResponse.json({ success: true, payments });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Invoicing Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'invoice_management',
            'client_management',
            'stripe_integration',
            'payment_tracking',
            'recurring_invoices',
            'analytics_dashboard',
            'pdf_generation',
            'email_reminders'
          ]
        });
      }

      default: {
        // List all invoices
        const status = searchParams.get('status') as any;
        const clientId = searchParams.get('clientId') || undefined;
        const search = searchParams.get('search') || undefined;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await invoicingService.listInvoices(
          user.id,
          {
            status,
            clientId,
            search,
            dateRange: startDate && endDate ? {
              start: new Date(startDate),
              end: new Date(endDate)
            } : undefined
          },
          { page, limit }
        );

        return NextResponse.json({
          success: true,
          ...result,
          page,
          limit
        });
      }
    }
  } catch (error) {
    logger.error('Invoicing GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch invoicing data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create invoices, clients, payments
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'create-invoice': {
        if (!data.clientId && (!data.clientName || !data.clientEmail)) {
          return NextResponse.json(
            { success: false, error: 'Client information required' },
            { status: 400 }
          );
        }

        const invoice = await invoicingService.createInvoice(user.id, {
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientAddress: data.clientAddress,
          items: data.items || [],
          currency: data.currency,
          taxRate: data.taxRate,
          discount: data.discount,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          notes: data.notes,
          terms: data.terms,
          isRecurring: data.isRecurring,
          recurringConfig: data.recurringConfig,
          metadata: data.metadata,
        });

        return NextResponse.json({
          success: true,
          action: 'create-invoice',
          invoice,
          message: 'Invoice created successfully'
        }, { status: 201 });
      }

      case 'create-client': {
        if (!data.name || !data.email) {
          return NextResponse.json(
            { success: false, error: 'Name and email required' },
            { status: 400 }
          );
        }

        const client = await invoicingService.createClient(user.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          vatNumber: data.vatNumber,
          taxId: data.taxId,
          address: data.address,
          billingAddress: data.billingAddress,
          defaultCurrency: data.defaultCurrency,
          defaultPaymentTerms: data.defaultPaymentTerms,
          defaultTaxRate: data.defaultTaxRate,
          notes: data.notes,
          tags: data.tags,
          category: data.category,
          metadata: data.metadata,
        });

        return NextResponse.json({
          success: true,
          action: 'create-client',
          client,
          message: 'Client created successfully'
        }, { status: 201 });
      }

      case 'send-invoice': {
        if (!data.invoiceId) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID required' },
            { status: 400 }
          );
        }

        const invoice = await invoicingService.sendInvoice(data.invoiceId, user.id);
        return NextResponse.json({
          success: true,
          action: 'send-invoice',
          invoice,
          message: 'Invoice sent to client'
        });
      }

      case 'record-payment': {
        if (!data.invoiceId || !data.amount) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID and amount required' },
            { status: 400 }
          );
        }

        const result = await invoicingService.recordPayment(
          data.invoiceId,
          user.id,
          {
            amount: data.amount,
            method: data.method,
            transactionId: data.transactionId,
            processingFee: data.processingFee,
            notes: data.notes,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
          }
        );

        return NextResponse.json({
          success: true,
          action: 'record-payment',
          ...result,
          message: 'Payment recorded'
        });
      }

      case 'refund-payment': {
        if (!data.paymentId) {
          return NextResponse.json(
            { success: false, error: 'Payment ID required' },
            { status: 400 }
          );
        }

        const result = await invoicingService.refundPayment(
          data.paymentId,
          user.id,
          data.reason
        );

        return NextResponse.json({
          success: true,
          action: 'refund-payment',
          ...result,
          message: 'Payment refunded'
        });
      }

      case 'mark-viewed': {
        if (!data.invoiceId) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID required' },
            { status: 400 }
          );
        }

        const invoice = await invoicingService.markAsViewed(data.invoiceId);
        return NextResponse.json({
          success: true,
          action: 'mark-viewed',
          invoice,
          message: 'Invoice marked as viewed'
        });
      }

      case 'duplicate-invoice': {
        if (!data.invoiceId) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID required' },
            { status: 400 }
          );
        }

        const invoice = await invoicingService.duplicateInvoice(data.invoiceId, user.id);
        return NextResponse.json({
          success: true,
          action: 'duplicate-invoice',
          invoice,
          message: 'Invoice duplicated'
        });
      }

      case 'create-template': {
        if (!data.name || !data.items) {
          return NextResponse.json(
            { success: false, error: 'Name and items required' },
            { status: 400 }
          );
        }

        const template = await invoicingService.createTemplate(user.id, {
          name: data.name,
          description: data.description,
          items: data.items,
          taxRate: data.taxRate,
          discount: data.discount,
          terms: data.terms,
          notes: data.notes,
        });

        return NextResponse.json({
          success: true,
          action: 'create-template',
          template,
          message: 'Template created'
        });
      }

      case 'create-recurring': {
        if (!data.clientId || !data.items || !data.frequency) {
          return NextResponse.json(
            { success: false, error: 'Client, items, and frequency required' },
            { status: 400 }
          );
        }

        const recurring = await invoicingService.createRecurringInvoice(user.id, {
          clientId: data.clientId,
          name: data.name,
          items: data.items,
          frequency: data.frequency,
          intervalCount: data.intervalCount,
          dayOfMonth: data.dayOfMonth,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          autoSend: data.autoSend,
          paymentTerms: data.paymentTerms,
          currency: data.currency,
          taxRate: data.taxRate,
          notes: data.notes,
          terms: data.terms,
        });

        return NextResponse.json({
          success: true,
          action: 'create-recurring',
          recurring,
          message: 'Recurring invoice created'
        });
      }

      case 'create-payment-link': {
        if (!data.invoiceId) {
          return NextResponse.json(
            { success: false, error: 'Invoice ID required' },
            { status: 400 }
          );
        }

        const paymentLink = await invoicingService.createPaymentLink(
          data.invoiceId,
          user.id,
          {
            allowPartialPayment: data.allowPartialPayment,
            minimumPayment: data.minimumPayment,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          }
        );

        return NextResponse.json({
          success: true,
          action: 'create-payment-link',
          paymentLink,
          message: 'Payment link created'
        });
      }

      case 'stripe-webhook': {
        // Handle Stripe webhook events
        await invoicingService.handleStripeWebhook(data);
        return NextResponse.json({ success: true, received: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Invoicing POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update invoice, client
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceId, clientId, ...updates } = body;

    if (invoiceId) {
      const invoice = await invoicingService.updateInvoice(invoiceId, user.id, updates);
      return NextResponse.json({
        success: true,
        invoice,
        message: 'Invoice updated successfully'
      });
    }

    if (clientId) {
      const client = await invoicingService.updateClient(clientId, user.id, updates);
      return NextResponse.json({
        success: true,
        client,
        message: 'Client updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invoice ID or Client ID required' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Invoicing PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete invoice, client
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const clientId = searchParams.get('clientId');
    const templateId = searchParams.get('templateId');
    const recurringId = searchParams.get('recurringId');

    if (invoiceId) {
      await invoicingService.deleteInvoice(invoiceId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    }

    if (clientId) {
      await invoicingService.deleteClient(clientId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Client deleted successfully'
      });
    }

    if (templateId) {
      await invoicingService.deleteTemplate(templateId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Template deleted successfully'
      });
    }

    if (recurringId) {
      await invoicingService.cancelRecurringInvoice(recurringId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Recurring invoice cancelled'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Invoicing DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// DEMO MODE HANDLERS
// =====================================================
function handleDemoGet(action: string | null, invoiceId: string | null): NextResponse {
  const mockInvoices = [
    {
      id: 'demo-inv-1',
      invoiceNumber: 'INV-2024-0001',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      status: 'paid',
      total: 2500.00,
      currency: 'USD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-inv-2',
      invoiceNumber: 'INV-2024-0002',
      clientName: 'Tech Solutions',
      clientEmail: 'finance@techsolutions.com',
      status: 'sent',
      total: 5000.00,
      currency: 'USD',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const mockClients = [
    {
      id: 'demo-client-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
      company: 'Acme Corporation',
      totalInvoiced: 25000.00,
      totalPaid: 22500.00,
    },
    {
      id: 'demo-client-2',
      name: 'Tech Solutions',
      email: 'finance@techsolutions.com',
      company: 'Tech Solutions Inc',
      totalInvoiced: 15000.00,
      totalPaid: 10000.00,
    },
  ];

  switch (action) {
    case 'get':
      return NextResponse.json({
        success: true,
        invoice: mockInvoices[0],
        message: 'Demo invoice loaded'
      });
    case 'clients':
      return NextResponse.json({
        success: true,
        clients: mockClients,
        total: mockClients.length,
        message: 'Demo clients loaded'
      });
    case 'analytics':
      return NextResponse.json({
        success: true,
        analytics: {
          totalRevenue: 47500.00,
          totalOutstanding: 7500.00,
          invoiceCount: 15,
          paidInvoices: 12,
          overdueInvoices: 1,
          averageInvoiceValue: 3166.67,
          collectionRate: 0.86,
        },
        message: 'Demo analytics'
      });
    case 'stats':
      return NextResponse.json({
        success: true,
        stats: {
          thisMonth: { revenue: 12500, invoices: 5 },
          lastMonth: { revenue: 10000, invoices: 4 },
          growth: 0.25,
        },
        message: 'Demo stats'
      });
    default:
      return NextResponse.json({
        success: true,
        invoices: mockInvoices,
        total: mockInvoices.length,
        page: 1,
        limit: 20,
        message: 'Demo invoices loaded'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'create-invoice':
      return NextResponse.json({
        success: true,
        action: 'create-invoice',
        invoice: {
          id: 'demo-new-invoice',
          invoiceNumber: 'INV-2024-0003',
          clientName: data.clientName,
          status: 'draft',
          total: data.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0,
          createdAt: new Date().toISOString(),
        },
        message: 'Demo invoice created'
      });
    case 'create-client':
      return NextResponse.json({
        success: true,
        action: 'create-client',
        client: {
          id: 'demo-new-client',
          name: data.name,
          email: data.email,
          createdAt: new Date().toISOString(),
        },
        message: 'Demo client created'
      });
    case 'send-invoice':
      return NextResponse.json({
        success: true,
        action: 'send-invoice',
        message: 'Invoice sent (demo mode)'
      });
    case 'record-payment':
      return NextResponse.json({
        success: true,
        action: 'record-payment',
        payment: {
          id: 'demo-payment',
          amount: data.amount,
          method: data.method,
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
        message: 'Payment recorded (demo mode)'
      });
    default:
      return NextResponse.json({
        success: false,
        error: 'Please log in to use this feature'
      }, { status: 401 });
  }
}
