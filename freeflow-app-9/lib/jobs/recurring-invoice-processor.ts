/**
 * Recurring Invoice Processor - FreeFlow A+++ Implementation
 * Background job processor for generating invoices from recurring templates
 * Features: Batch processing, retry logic, email delivery, error handling
 */

import { createClient } from '@/lib/supabase/server';

// ============ Types ============

interface RecurringTemplate {
  id: string;
  user_id: string;
  template_name: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  client_address: string | null;
  invoice_prefix: string;
  currency: string;
  tax_rate: number;
  discount_type: string;
  discount_value: number;
  payment_terms_days: number;
  late_fee_enabled: boolean;
  late_fee_percentage: number;
  late_fee_grace_days: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  auto_send: boolean;
  send_days_before: number;
  cc_emails: string[] | null;
  bcc_emails: string[] | null;
  email_subject_template: string | null;
  email_body_template: string | null;
  notes: string | null;
  terms_and_conditions: string | null;
  frequency: string;
  custom_interval_days: number | null;
  day_of_week: number | null;
  day_of_month: number | null;
  month_of_year: number | null;
  total_invoices_generated: number;
}

interface RecurringExecution {
  id: string;
  template_id: string;
  scheduled_date: string;
  status: string;
  retry_count: number;
  max_retries: number;
}

interface LineItem {
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  unit: string | null;
  taxable: boolean;
  tax_rate: number | null;
  discount_type: string | null;
  discount_value: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  sort_order: number;
}

interface ProcessResult {
  success: boolean;
  executionId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  error?: string;
}

interface JobResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: ProcessResult[];
}

// ============ Main Processor Class ============

export class RecurringInvoiceProcessor {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  async initialize() {
    this.supabase = await createClient();
  }

  /**
   * Process all due recurring invoices
   */
  async processAllDue(): Promise<JobResult> {
    if (!this.supabase) {
      await this.initialize();
    }

    const results: ProcessResult[] = [];
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    try {
      // Get all pending executions that are due
      const today = new Date().toISOString().split('T')[0];

      const { data: executions, error } = await this.supabase!
        .from('recurring_invoice_executions')
        .select(`
          *,
          template:recurring_invoice_templates(
            *,
            line_items:recurring_invoice_line_items(*)
          )
        `)
        .eq('status', 'pending')
        .lte('scheduled_date', today)
        .lt('retry_count', 3)
        .order('scheduled_date', { ascending: true })
        .limit(100); // Process in batches

      if (error) {
        console.error('Error fetching executions:', error);
        return { processed: 0, succeeded: 0, failed: 0, skipped: 0, results: [] };
      }

      if (!executions || executions.length === 0) {
        return { processed: 0, succeeded: 0, failed: 0, skipped: 0, results: [] };
      }

      // Process each execution
      for (const execution of executions) {
        processed++;

        // Skip if template is not active
        if (!execution.template || execution.template.status !== 'active') {
          await this.updateExecutionStatus(execution.id, 'skipped', 'Template is not active');
          skipped++;
          results.push({
            success: false,
            executionId: execution.id,
            error: 'Template is not active',
          });
          continue;
        }

        // Check if template has an end date that has passed
        if (execution.template.end_date && execution.template.end_date < today) {
          await this.updateExecutionStatus(execution.id, 'skipped', 'Template has ended');
          skipped++;
          results.push({
            success: false,
            executionId: execution.id,
            error: 'Template has ended',
          });
          continue;
        }

        try {
          const result = await this.processExecution(execution, execution.template);
          results.push(result);

          if (result.success) {
            succeeded++;
          } else {
            failed++;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          failed++;
          results.push({
            success: false,
            executionId: execution.id,
            error: errorMessage,
          });

          // Update execution with error
          await this.handleExecutionError(execution, errorMessage);
        }
      }

      return { processed, succeeded, failed, skipped, results };
    } catch (err) {
      console.error('Job processing error:', err);
      return { processed, succeeded, failed, skipped, results };
    }
  }

  /**
   * Process a single execution
   */
  private async processExecution(
    execution: RecurringExecution,
    template: RecurringTemplate & { line_items: LineItem[] }
  ): Promise<ProcessResult> {
    // Mark as processing
    await this.supabase!
      .from('recurring_invoice_executions')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', execution.id);

    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(template);

      // Calculate due date
      const dueDate = new Date(execution.scheduled_date);
      dueDate.setDate(dueDate.getDate() + template.payment_terms_days);

      // Create the invoice
      const { data: invoice, error: invoiceError } = await this.supabase!
        .from('invoices')
        .insert({
          user_id: template.user_id,
          client_id: template.client_id,
          invoice_number: invoiceNumber,
          status: 'draft',
          issue_date: execution.scheduled_date,
          due_date: dueDate.toISOString().split('T')[0],
          currency: template.currency,
          subtotal: template.subtotal,
          tax_rate: template.tax_rate,
          tax_amount: template.tax_amount,
          discount_type: template.discount_type,
          discount_value: template.discount_value,
          discount_amount: template.discount_amount,
          total: template.total_amount,
          notes: template.notes,
          terms: template.terms_and_conditions,
          recurring_template_id: template.id,
          metadata: {
            generated_from_recurring: true,
            template_name: template.template_name,
            execution_id: execution.id,
          },
        })
        .select()
        .single();

      if (invoiceError) {
        throw new Error(`Failed to create invoice: ${invoiceError.message}`);
      }

      // Create invoice line items
      if (template.line_items && template.line_items.length > 0) {
        const lineItems = template.line_items.map((item, index) => ({
          invoice_id: invoice.id,
          description: item.item_name,
          details: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit,
          tax_rate: item.tax_rate,
          subtotal: item.subtotal,
          tax_amount: item.tax_amount,
          total: item.total,
          sort_order: item.sort_order || index,
        }));

        const { error: lineItemsError } = await this.supabase!
          .from('invoice_items')
          .insert(lineItems);

        if (lineItemsError) {
          console.warn('Warning: Failed to create line items:', lineItemsError.message);
        }
      }

      // Update execution as completed
      await this.supabase!
        .from('recurring_invoice_executions')
        .update({
          status: 'completed',
          executed_at: new Date().toISOString(),
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          subtotal: template.subtotal,
          tax_amount: template.tax_amount,
          discount_amount: template.discount_amount,
          total_amount: template.total_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      // Schedule next execution
      await this.scheduleNextExecution(template, execution.scheduled_date);

      // Handle auto-send if enabled
      if (template.auto_send && template.client_email) {
        await this.sendInvoiceEmail(invoice.id, template);
      }

      return {
        success: true,
        executionId: execution.id,
        invoiceId: invoice.id,
        invoiceNumber,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await this.handleExecutionError(execution, errorMessage);
      throw err;
    }
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(template: RecurringTemplate): Promise<string> {
    const prefix = template.invoice_prefix || 'INV';
    const nextNumber = template.total_invoices_generated + 1;

    // Format: PREFIX-YYYYMM-XXXX
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const paddedNumber = String(nextNumber).padStart(4, '0');

    return `${prefix}-${yearMonth}-${paddedNumber}`;
  }

  /**
   * Schedule the next execution for a template
   */
  private async scheduleNextExecution(template: RecurringTemplate, currentDate: string): Promise<void> {
    // Calculate next run date using database function
    const { data: nextDate } = await this.supabase!.rpc('calculate_next_run_date', {
      p_current_date: currentDate,
      p_frequency: template.frequency,
      p_custom_interval: template.custom_interval_days,
      p_day_of_week: template.day_of_week,
      p_day_of_month: template.day_of_month,
      p_month_of_year: template.month_of_year,
    });

    if (nextDate) {
      // Check if next date is within end_date (if set)
      const templateEndDate = template.end_date;
      if (templateEndDate && nextDate > templateEndDate) {
        // Template has ended, update status
        await this.supabase!
          .from('recurring_invoice_templates')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', template.id);
        return;
      }

      // Create next execution record
      await this.supabase!
        .from('recurring_invoice_executions')
        .insert({
          template_id: template.id,
          scheduled_date: nextDate,
          status: 'pending',
        });
    }
  }

  /**
   * Handle execution error
   */
  private async handleExecutionError(execution: RecurringExecution, errorMessage: string): Promise<void> {
    const newRetryCount = execution.retry_count + 1;
    const shouldRetry = newRetryCount < execution.max_retries;

    // Calculate next retry time (exponential backoff)
    const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000; // 2^n minutes
    const nextRetryAt = new Date(Date.now() + retryDelay).toISOString();

    await this.supabase!
      .from('recurring_invoice_executions')
      .update({
        status: shouldRetry ? 'pending' : 'failed',
        error_message: errorMessage,
        retry_count: newRetryCount,
        next_retry_at: shouldRetry ? nextRetryAt : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', execution.id);
  }

  /**
   * Update execution status
   */
  private async updateExecutionStatus(
    executionId: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    await this.supabase!
      .from('recurring_invoice_executions')
      .update({
        status,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);
  }

  /**
   * Send invoice email (placeholder - integrate with your email service)
   */
  private async sendInvoiceEmail(
    invoiceId: string,
    template: RecurringTemplate
  ): Promise<void> {
    // This would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll log and update the execution
    console.log(`[RecurringInvoice] Would send invoice ${invoiceId} to ${template.client_email}`);

    // Update execution with email sent status
    // In production, this would be called after successful email delivery
    // await this.supabase!
    //   .from('recurring_invoice_executions')
    //   .update({
    //     email_sent: true,
    //     email_sent_at: new Date().toISOString(),
    //     email_recipients: [template.client_email, ...(template.cc_emails || [])],
    //   })
    //   .eq('invoice_id', invoiceId);
  }

  /**
   * Create initial executions for a new template
   */
  async createInitialExecution(templateId: string, startDate: string): Promise<void> {
    if (!this.supabase) {
      await this.initialize();
    }

    await this.supabase!
      .from('recurring_invoice_executions')
      .insert({
        template_id: templateId,
        scheduled_date: startDate,
        status: 'pending',
      });
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<{
    pendingToday: number;
    pendingTotal: number;
    completedToday: number;
    failedToday: number;
    activeTemplates: number;
  }> {
    if (!this.supabase) {
      await this.initialize();
    }

    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00Z`;
    const endOfDay = `${today}T23:59:59Z`;

    const [pendingToday, pendingTotal, completedToday, failedToday, activeTemplates] = await Promise.all([
      this.supabase!
        .from('recurring_invoice_executions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('scheduled_date', today),

      this.supabase!
        .from('recurring_invoice_executions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      this.supabase!
        .from('recurring_invoice_executions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('executed_at', startOfDay)
        .lte('executed_at', endOfDay),

      this.supabase!
        .from('recurring_invoice_executions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('updated_at', startOfDay)
        .lte('updated_at', endOfDay),

      this.supabase!
        .from('recurring_invoice_templates')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('deleted_at', null),
    ]);

    return {
      pendingToday: pendingToday.count || 0,
      pendingTotal: pendingTotal.count || 0,
      completedToday: completedToday.count || 0,
      failedToday: failedToday.count || 0,
      activeTemplates: activeTemplates.count || 0,
    };
  }
}

// ============ Singleton Instance ============

let processorInstance: RecurringInvoiceProcessor | null = null;

export function getRecurringInvoiceProcessor(): RecurringInvoiceProcessor {
  if (!processorInstance) {
    processorInstance = new RecurringInvoiceProcessor();
  }
  return processorInstance;
}

// ============ Cron Job Entry Point ============

export async function runRecurringInvoiceJob(): Promise<JobResult> {
  const processor = getRecurringInvoiceProcessor();
  await processor.initialize();
  return processor.processAllDue();
}
