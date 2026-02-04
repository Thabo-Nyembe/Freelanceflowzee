/**
 * Business Automation API
 *
 * Comprehensive automation endpoint for business tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessAutomationAgent } from '@/app/lib/services/business-automation-agent';
import logger from '@/lib/logger';

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

const automationAgent = new BusinessAutomationAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    logger.info('Automation API request', { action });

    switch (action) {
      case 'client_followup': {
        const { clientId, reason } = data;
        const followUp = await automationAgent.generateClientFollowUp(clientId, reason);
        return NextResponse.json({
          success: true,
          action,
          data: followUp,
          message: 'Client follow-up generated successfully',
        });
      }

      case 'identify_followups': {
        const followUps = await automationAgent.identifyClientsNeedingFollowUp();
        return NextResponse.json({
          success: true,
          action,
          data: followUps,
          count: followUps.length,
          message: `Identified ${followUps.length} clients needing follow-up`,
        });
      }

      case 'invoice_reminder': {
        const { invoiceId } = data;
        const reminder = await automationAgent.generateInvoiceReminder(invoiceId);
        return NextResponse.json({
          success: true,
          action,
          data: reminder,
          message: 'Invoice reminder generated successfully',
        });
      }

      case 'process_overdue_invoices': {
        const reminders = await automationAgent.processOverdueInvoices();
        return NextResponse.json({
          success: true,
          action,
          data: reminders,
          count: reminders.length,
          message: `Generated ${reminders.length} invoice reminders`,
        });
      }

      case 'project_update': {
        const { projectId } = data;
        const update = await automationAgent.generateProjectUpdate(projectId);
        return NextResponse.json({
          success: true,
          action,
          data: update,
          message: 'Project update generated successfully',
        });
      }

      case 'weekly_project_updates': {
        const updates = await automationAgent.sendWeeklyProjectUpdates();
        return NextResponse.json({
          success: true,
          action,
          data: updates,
          count: updates.length,
          message: `Sent ${updates.length} project updates`,
        });
      }

      case 'schedule_meeting': {
        const result = await automationAgent.scheduleMeeting(data);
        return NextResponse.json({
          success: true,
          action,
          data: result,
          message: 'Meeting scheduling prepared',
        });
      }

      case 'generate_insights': {
        const { type, period } = data;
        const insights = await automationAgent.generateBusinessInsights(type, period);
        return NextResponse.json({
          success: true,
          action,
          data: insights,
          message: 'Business insights generated successfully',
        });
      }

      case 'execute_task': {
        const { task } = data;
        const result = await automationAgent.executeTask(task);
        return NextResponse.json({
          success: true,
          action,
          data: result,
          message: 'Task executed successfully',
        });
      }

      case 'process_pending': {
        await automationAgent.processPendingTasks();
        return NextResponse.json({
          success: true,
          action,
          message: 'Pending tasks processed',
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: [
              'client_followup',
              'identify_followups',
              'invoice_reminder',
              'process_overdue_invoices',
              'project_update',
              'weekly_project_updates',
              'schedule_meeting',
              'generate_insights',
              'execute_task',
              'process_pending',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Automation API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'info';

    switch (action) {
      case 'info':
        return NextResponse.json({
          success: true,
          data: {
            name: 'Business Automation Agent',
            version: '1.0.0',
            capabilities: [
              'Email monitoring and automated responses',
              'Client follow-up automation',
              'Invoice reminders and payment tracking',
              'Project status updates',
              'Meeting scheduling',
              'Document generation',
              'Analytics and insights',
              'Task automation',
            ],
            status: 'active',
          },
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Business Automation API',
        });
    }
  } catch (error) {
    logger.error('Automation API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
