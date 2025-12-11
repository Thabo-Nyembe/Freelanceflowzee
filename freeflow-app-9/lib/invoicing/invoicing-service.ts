/**
 * KAZI Invoicing & Financial Service
 *
 * Comprehensive invoicing service that integrates:
 * - Invoice creation and management
 * - Stripe payment processing
 * - Recurring invoices
 * - Payment analytics
 * - Late fees and reminders
 * - PDF generation
 *
 * World-class backend infrastructure for production deployment
 */

import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import * as recurringService from './recurring-invoice-service';
import * as analyticsService from './payment-analytics-service';
import * as lateFeeService from './late-fee-service';
import * as reminderService from './payment-reminder-service';

// ============================================================================
// Types
// ============================================================================

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'ZAR';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal' | 'crypto' | 'check' | 'cash' | 'other';

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_address?: ClientAddress;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  total: number;
  amount_paid: number;
  amount_due: number;
  currency: Currency;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  notes?: string;
  terms?: string;
  footer?: string;
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
  payment_link?: string;
  recurring_invoice_id?: string;
  attachments: InvoiceAttachment[];
  created_at: string;
  updated_at: string;
  sent_at?: string;
  viewed_at?: string;
  metadata: Record<string, any>;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit: string;
  discount?: number;
  tax_rate?: number;
  total: number;
}

export interface ClientAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface InvoiceAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  user_id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id?: string;
  stripe_charge_id?: string;
  processing_fee?: number;
  net_amount?: number;
  payment_date: string;
  refund_date?: string;
  refund_reason?: string;
  notes?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: ClientAddress;
  tax_id?: string;
  stripe_customer_id?: string;
  payment_terms_days: number;
  default_currency: Currency;
  notes?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface InvoiceTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  items: InvoiceItem[];
  tax_rate: number;
  notes?: string;
  terms?: string;
  footer?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceInput {
  client_id: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  tax_rate?: number;
  discount?: number;
  discount_type?: 'percentage' | 'fixed';
  currency?: Currency;
  due_date: Date;
  notes?: string;
  terms?: string;
  footer?: string;
  send_immediately?: boolean;
  template_id?: string;
}

export interface UpdateInvoiceInput {
  client_id?: string;
  items?: Omit<InvoiceItem, 'id' | 'total'>[];
  tax_rate?: number;
  discount?: number;
  discount_type?: 'percentage' | 'fixed';
  due_date?: Date;
  notes?: string;
  terms?: string;
  footer?: string;
  status?: InvoiceStatus;
}

// ============================================================================
// Invoicing Service
// ============================================================================

class InvoicingService {
  private static instance: InvoicingService;
  private stripe: Stripe | null = null;

  private constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-08-27.basil',
      });
    }
  }

  public static getInstance(): InvoicingService {
    if (!InvoicingService.instance) {
      InvoicingService.instance = new InvoicingService();
    }
    return InvoicingService.instance;
  }

  private async getSupabase() {
    return await createClient();
  }

  // ==========================================================================
  // Invoice Management
  // ==========================================================================

  /**
   * Create a new invoice
   */
  async createInvoice(userId: string, input: CreateInvoiceInput): Promise<Invoice> {
    const supabase = await this.getSupabase();

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', input.client_id)
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Calculate item totals
    const items = input.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      ...item,
      total: item.quantity * item.unit_price * (1 - (item.discount || 0) / 100),
    }));

    // Calculate invoice totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = input.tax_rate || 0;
    const discountAmount = input.discount_type === 'percentage'
      ? subtotal * ((input.discount || 0) / 100)
      : (input.discount || 0);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(userId);

    const invoiceData = {
      invoice_number: invoiceNumber,
      user_id: userId,
      client_id: input.client_id,
      client_name: client.name,
      client_email: client.email,
      client_address: client.address,
      status: 'draft' as InvoiceStatus,
      items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount: discountAmount,
      discount_type: input.discount_type || 'fixed',
      total,
      amount_paid: 0,
      amount_due: total,
      currency: input.currency || client.default_currency || 'USD',
      issue_date: new Date().toISOString(),
      due_date: input.due_date.toISOString(),
      notes: input.notes,
      terms: input.terms,
      footer: input.footer,
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {},
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create invoice: ${error.message}`);

    const invoice = data as Invoice;

    // Create Stripe invoice if Stripe is configured
    if (this.stripe && client.stripe_customer_id) {
      await this.createStripeInvoice(invoice, client);
    }

    // Send immediately if requested
    if (input.send_immediately) {
      await this.sendInvoice(invoice.id, userId);
    }

    // Log creation event
    await this.logInvoiceEvent(invoice.id, userId, 'created', {});

    return invoice;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string, userId?: string): Promise<Invoice | null> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) return null;
    return data as Invoice;
  }

  /**
   * Update invoice
   */
  async updateInvoice(
    invoiceId: string,
    userId: string,
    updates: UpdateInvoiceInput
  ): Promise<Invoice> {
    const supabase = await this.getSupabase();

    const existing = await this.getInvoice(invoiceId, userId);
    if (!existing) {
      throw new Error('Invoice not found');
    }

    if (existing.status === 'paid') {
      throw new Error('Cannot modify a paid invoice');
    }

    const updateData: Partial<Invoice> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.items) {
      updateData.items = updates.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        ...item,
        total: item.quantity * item.unit_price * (1 - (item.discount || 0) / 100),
      }));

      // Recalculate totals
      const subtotal = updateData.items.reduce((sum, item) => sum + item.total, 0);
      const taxRate = updates.tax_rate ?? existing.tax_rate;
      const discount = updates.discount ?? existing.discount;
      const discountType = updates.discount_type ?? existing.discount_type;
      const discountAmount = discountType === 'percentage'
        ? subtotal * (discount / 100)
        : discount;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (taxRate / 100);

      updateData.subtotal = subtotal;
      updateData.tax_rate = taxRate;
      updateData.tax_amount = taxAmount;
      updateData.discount = discountAmount;
      updateData.total = taxableAmount + taxAmount;
      updateData.amount_due = (taxableAmount + taxAmount) - existing.amount_paid;
    }

    if (updates.due_date) {
      updateData.due_date = updates.due_date.toISOString();
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.terms !== undefined) updateData.terms = updates.terms;
    if (updates.footer !== undefined) updateData.footer = updates.footer;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update invoice: ${error.message}`);

    // Log update event
    await this.logInvoiceEvent(invoiceId, userId, 'updated', { updates });

    return data as Invoice;
  }

  /**
   * Delete invoice (soft delete by cancelling)
   */
  async deleteInvoice(invoiceId: string, userId: string): Promise<void> {
    const supabase = await this.getSupabase();

    const invoice = await this.getInvoice(invoiceId, userId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new Error('Cannot delete a paid invoice');
    }

    // Void Stripe invoice if exists
    if (this.stripe && invoice.stripe_invoice_id) {
      try {
        await this.stripe.invoices.voidInvoice(invoice.stripe_invoice_id);
      } catch (error) {
        console.error('Failed to void Stripe invoice:', error);
      }
    }

    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete invoice: ${error.message}`);

    await this.logInvoiceEvent(invoiceId, userId, 'cancelled', {});
  }

  /**
   * List invoices
   */
  async listInvoices(
    userId: string,
    filters?: {
      status?: InvoiceStatus[];
      client_id?: string;
      date_from?: Date;
      date_to?: Date;
      search?: string;
    },
    pagination?: { page: number; perPage: number }
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const supabase = await this.getSupabase();
    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;

    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters?.date_from) {
      query = query.gte('issue_date', filters.date_from.toISOString());
    }
    if (filters?.date_to) {
      query = query.lte('issue_date', filters.date_to.toISOString());
    }
    if (filters?.search) {
      query = query.or(
        `invoice_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`
      );
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to).order('issue_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to list invoices: ${error.message}`);

    return {
      invoices: (data || []) as Invoice[],
      total: count || 0,
    };
  }

  // ==========================================================================
  // Invoice Actions
  // ==========================================================================

  /**
   * Send invoice to client
   */
  async sendInvoice(invoiceId: string, userId: string): Promise<Invoice> {
    const supabase = await this.getSupabase();

    const invoice = await this.getInvoice(invoiceId, userId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'draft') {
      throw new Error('Invoice has already been sent');
    }

    // Generate payment link
    const paymentLink = await this.generatePaymentLink(invoice);

    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        payment_link: paymentLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw new Error(`Failed to send invoice: ${error.message}`);

    // Send email notification
    await this.sendInvoiceEmail(data as Invoice);

    await this.logInvoiceEvent(invoiceId, userId, 'sent', { paymentLink });

    return data as Invoice;
  }

  /**
   * Mark invoice as viewed
   */
  async markAsViewed(invoiceId: string): Promise<Invoice> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'viewed',
        viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('status', 'sent')
      .select()
      .single();

    if (error) return await this.getInvoice(invoiceId) as Invoice;

    await this.logInvoiceEvent(invoiceId, data.user_id, 'viewed', {});

    return data as Invoice;
  }

  /**
   * Record payment
   */
  async recordPayment(
    invoiceId: string,
    userId: string,
    paymentData: {
      amount: number;
      method: PaymentMethod;
      payment_date?: Date;
      notes?: string;
      stripe_payment_id?: string;
    }
  ): Promise<{ invoice: Invoice; payment: Payment }> {
    const supabase = await this.getSupabase();

    const invoice = await this.getInvoice(invoiceId, userId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice is already fully paid');
    }

    // Create payment record
    const payment: Partial<Payment> = {
      invoice_id: invoiceId,
      user_id: userId,
      amount: paymentData.amount,
      currency: invoice.currency,
      method: paymentData.method,
      status: 'completed',
      stripe_payment_id: paymentData.stripe_payment_id,
      payment_date: (paymentData.payment_date || new Date()).toISOString(),
      notes: paymentData.notes,
      created_at: new Date().toISOString(),
      metadata: {},
    };

    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (paymentError) throw new Error(`Failed to record payment: ${paymentError.message}`);

    // Update invoice
    const newAmountPaid = invoice.amount_paid + paymentData.amount;
    const newAmountDue = invoice.total - newAmountPaid;
    const isPaid = newAmountDue <= 0;

    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: Math.max(0, newAmountDue),
        status: isPaid ? 'paid' : invoice.status,
        paid_date: isPaid ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (invoiceError) throw new Error(`Failed to update invoice: ${invoiceError.message}`);

    await this.logInvoiceEvent(invoiceId, userId, 'payment_received', {
      amount: paymentData.amount,
      method: paymentData.method,
    });

    return {
      invoice: updatedInvoice as Invoice,
      payment: paymentRecord as Payment,
    };
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    userId: string,
    reason?: string
  ): Promise<{ invoice: Invoice; payment: Payment }> {
    const supabase = await this.getSupabase();

    const { data: payment, error: paymentFetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentFetchError || !payment) {
      throw new Error('Payment not found');
    }

    // Refund via Stripe if applicable
    if (this.stripe && payment.stripe_payment_id) {
      await this.stripe.refunds.create({
        payment_intent: payment.stripe_payment_id,
      });
    }

    // Update payment record
    const { data: updatedPayment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_date: new Date().toISOString(),
        refund_reason: reason,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (paymentError) throw new Error(`Failed to refund payment: ${paymentError.message}`);

    // Update invoice
    const invoice = await this.getInvoice(payment.invoice_id, userId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const newAmountPaid = invoice.amount_paid - payment.amount;
    const newAmountDue = invoice.total - newAmountPaid;

    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        amount_paid: Math.max(0, newAmountPaid),
        amount_due: newAmountDue,
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.invoice_id)
      .select()
      .single();

    if (invoiceError) throw new Error(`Failed to update invoice: ${invoiceError.message}`);

    await this.logInvoiceEvent(payment.invoice_id, userId, 'refunded', {
      paymentId,
      amount: payment.amount,
      reason,
    });

    return {
      invoice: updatedInvoice as Invoice,
      payment: updatedPayment as Payment,
    };
  }

  // ==========================================================================
  // Stripe Integration
  // ==========================================================================

  /**
   * Create Stripe invoice
   */
  private async createStripeInvoice(invoice: Invoice, client: Client): Promise<void> {
    if (!this.stripe || !client.stripe_customer_id) return;

    try {
      // Create invoice items
      for (const item of invoice.items) {
        await this.stripe.invoiceItems.create({
          customer: client.stripe_customer_id,
          amount: Math.round(item.total * 100),
          currency: invoice.currency.toLowerCase(),
          description: item.description,
        });
      }

      // Create the invoice
      const stripeInvoice = await this.stripe.invoices.create({
        customer: client.stripe_customer_id,
        collection_method: 'send_invoice',
        days_until_due: Math.ceil(
          (new Date(invoice.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        metadata: {
          kazi_invoice_id: invoice.id,
          kazi_invoice_number: invoice.invoice_number,
        },
      });

      // Update invoice with Stripe ID
      const supabase = await this.getSupabase();
      await supabase
        .from('invoices')
        .update({
          stripe_invoice_id: stripeInvoice.id,
          payment_link: stripeInvoice.hosted_invoice_url,
        })
        .eq('id', invoice.id);
    } catch (error) {
      console.error('Failed to create Stripe invoice:', error);
    }
  }

  /**
   * Generate payment link
   */
  private async generatePaymentLink(invoice: Invoice): Promise<string> {
    if (this.stripe && invoice.stripe_invoice_id) {
      try {
        const stripeInvoice = await this.stripe.invoices.retrieve(invoice.stripe_invoice_id);
        if (stripeInvoice.hosted_invoice_url) {
          return stripeInvoice.hosted_invoice_url;
        }
      } catch (error) {
        console.error('Failed to get Stripe invoice URL:', error);
      }
    }

    // Fallback to internal payment page
    return `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    const supabase = await this.getSupabase();

    switch (event.type) {
      case 'invoice.paid': {
        const stripeInvoice = event.data.object as Stripe.Invoice;
        const kaziInvoiceId = stripeInvoice.metadata?.kazi_invoice_id;

        if (kaziInvoiceId) {
          const invoice = await this.getInvoice(kaziInvoiceId);
          if (invoice) {
            await this.recordPayment(kaziInvoiceId, invoice.user_id, {
              amount: (stripeInvoice.amount_paid || 0) / 100,
              method: 'card',
              stripe_payment_id: stripeInvoice.payment_intent as string,
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const stripeInvoice = event.data.object as Stripe.Invoice;
        const kaziInvoiceId = stripeInvoice.metadata?.kazi_invoice_id;

        if (kaziInvoiceId) {
          await this.logInvoiceEvent(kaziInvoiceId, '', 'payment_failed', {
            stripeInvoiceId: stripeInvoice.id,
            error: stripeInvoice.last_finalization_error?.message,
          });
        }
        break;
      }
    }
  }

  // ==========================================================================
  // Client Management
  // ==========================================================================

  /**
   * Create client
   */
  async createClient(userId: string, clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const supabase = await this.getSupabase();

    // Create Stripe customer if Stripe is configured
    let stripeCustomerId: string | undefined;
    if (this.stripe) {
      try {
        const customer = await this.stripe.customers.create({
          email: clientData.email,
          name: clientData.name,
          phone: clientData.phone,
          address: clientData.address ? {
            line1: clientData.address.line1,
            line2: clientData.address.line2,
            city: clientData.address.city,
            state: clientData.address.state,
            postal_code: clientData.address.postal_code,
            country: clientData.address.country,
          } : undefined,
          metadata: {
            company: clientData.company || '',
            tax_id: clientData.tax_id || '',
          },
        });
        stripeCustomerId = customer.id;
      } catch (error) {
        console.error('Failed to create Stripe customer:', error);
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        ...clientData,
        stripe_customer_id: stripeCustomerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create client: ${error.message}`);

    return data as Client;
  }

  /**
   * Get client
   */
  async getClient(clientId: string, userId: string): Promise<Client | null> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data as Client;
  }

  /**
   * List clients
   */
  async listClients(
    userId: string,
    filters?: { search?: string },
    pagination?: { page: number; perPage: number }
  ): Promise<{ clients: Client[]; total: number }> {
    const supabase = await this.getSupabase();
    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
      );
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to).order('name', { ascending: true });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to list clients: ${error.message}`);

    return {
      clients: (data || []) as Client[],
      total: count || 0,
    };
  }

  // ==========================================================================
  // Templates
  // ==========================================================================

  /**
   * Create invoice template
   */
  async createTemplate(
    userId: string,
    templateData: Omit<InvoiceTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<InvoiceTemplate> {
    const supabase = await this.getSupabase();

    // If setting as default, unset other defaults
    if (templateData.is_default) {
      await supabase
        .from('invoice_templates')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('invoice_templates')
      .insert({
        user_id: userId,
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);

    return data as InvoiceTemplate;
  }

  /**
   * List templates
   */
  async listTemplates(userId: string): Promise<InvoiceTemplate[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to list templates: ${error.message}`);

    return (data || []) as InvoiceTemplate[];
  }

  // ==========================================================================
  // Analytics
  // ==========================================================================

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(userId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return analyticsService.getRevenueMetrics(userId, period);
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(userId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return analyticsService.getPaymentMetrics(userId, period);
  }

  /**
   * Get aging report
   */
  async getAgingReport(userId: string, currency: Currency = 'USD') {
    return analyticsService.getAgingReport(userId, currency);
  }

  /**
   * Get full analytics dashboard
   */
  async getAnalyticsDashboard(userId: string, currency: Currency = 'USD') {
    return analyticsService.getAnalyticsDashboard(userId, 'month', currency);
  }

  // ==========================================================================
  // Recurring Invoices
  // ==========================================================================

  /**
   * Create recurring invoice
   */
  async createRecurringInvoice(userId: string, data: recurringService.RecurringInvoiceCreate) {
    return recurringService.createRecurringInvoice(userId, data);
  }

  /**
   * List recurring invoices
   */
  async listRecurringInvoices(userId: string, options?: { isActive?: boolean }) {
    return recurringService.listRecurringInvoices(userId, options);
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(userId: string): Promise<string> {
    const supabase = await this.getSupabase();

    // Get the latest invoice number
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (data?.invoice_number) {
      const match = data.invoice_number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const year = new Date().getFullYear();
    return `INV-${year}-${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Send invoice email
   */
  private async sendInvoiceEmail(invoice: Invoice): Promise<void> {
    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    console.log('Sending invoice email to:', invoice.client_email);
  }

  /**
   * Log invoice event
   */
  private async logInvoiceEvent(
    invoiceId: string,
    userId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase();

      await supabase.from('invoice_events').insert({
        invoice_id: invoiceId,
        user_id: userId,
        event_type: event,
        event_data: data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log invoice event:', error);
    }
  }
}

// Export singleton instance
export const invoicingService = InvoicingService.getInstance();

// Also export the class for testing
export { InvoicingService };

// Re-export related services
export { recurringService, analyticsService, lateFeeService, reminderService };
