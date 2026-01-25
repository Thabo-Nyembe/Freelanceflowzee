/**
 * Recurring Invoices Cron API - FreeFlow A+++ Implementation
 * Endpoint for scheduled job execution
 * Can be called by Vercel Cron, external scheduler, or manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { runRecurringInvoiceJob, getRecurringInvoiceProcessor } from '@/lib/jobs/recurring-invoice-processor';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('cron-recurring-invoices');

// ============ Security ============

const CRON_SECRET = process.env.CRON_SECRET;

function verifyCronSecret(request: NextRequest): boolean {
  // Allow in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check for cron secret in header
  const authHeader = request.headers.get('authorization');
  if (authHeader && CRON_SECRET) {
    return authHeader === `Bearer ${CRON_SECRET}`;
  }

  // Check Vercel cron header
  const vercelCron = request.headers.get('x-vercel-cron');
  if (vercelCron) {
    return true;
  }

  return false;
}

// ============ GET Handler - Process Recurring Invoices ============

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting recurring invoice processing');
    const startTime = Date.now();

    // Run the job
    const result = await runRecurringInvoiceJob();

    const duration = Date.now() - startTime;
    logger.info('Recurring invoice processing completed', { duration, result });

    return NextResponse.json({
      success: true,
      duration,
      ...result,
    });
  } catch (error) {
    logger.error('Recurring invoice job error', { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============ POST Handler - Manual Trigger with Options ============

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, templateId } = body;

    const processor = getRecurringInvoiceProcessor();
    await processor.initialize();

    switch (action) {
      case 'process':
        // Process all due invoices
        const result = await processor.processAllDue();
        return NextResponse.json({ success: true, ...result });

      case 'stats':
        // Get job statistics
        const stats = await processor.getJobStats();
        return NextResponse.json({ success: true, stats });

      case 'create-execution':
        // Create initial execution for a template
        if (!templateId) {
          return NextResponse.json(
            { error: 'templateId is required' },
            { status: 400 }
          );
        }
        const startDate = body.startDate || new Date().toISOString().split('T')[0];
        await processor.createInitialExecution(templateId, startDate);
        return NextResponse.json({ success: true, message: 'Execution created' });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: process, stats, or create-execution' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Manual trigger error', { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============ Vercel Cron Config ============
// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/recurring-invoices",
//     "schedule": "0 6 * * *"  // Run at 6 AM daily
//   }]
// }
