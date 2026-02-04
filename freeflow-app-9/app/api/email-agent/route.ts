/**
 * Email Agent API
 *
 * Endpoints:
 * - POST /api/email-agent - Process incoming email or webhook
 * - GET /api/email-agent - Get agent status and statistics
 * - PUT /api/email-agent - Update agent configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailAgentService } from '@/app/lib/services/email-agent-service';
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

const emailAgent = new EmailAgentService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    logger.info('Email agent API request', { action });

    switch (action) {
      case 'process_email': {
        const result = await emailAgent.processIncomingEmail(data);
        return NextResponse.json({
          success: true,
          action,
          data: result,
          message: 'Email processed successfully',
        });
      }

      case 'approve': {
        const { workflowId, approver, approvalAction, comments } = data;
        const workflow = await emailAgent.processApproval(
          workflowId,
          approver,
          approvalAction,
          comments
        );
        return NextResponse.json({
          success: true,
          action,
          data: workflow,
          message: `Workflow ${approvalAction}`,
        });
      }

      case 'send_response': {
        const { responseId } = data;
        // Get response from database
        const response = data.response || { id: responseId };
        await emailAgent.sendResponse(response);
        return NextResponse.json({
          success: true,
          action,
          message: 'Response sent successfully',
        });
      }

      case 'send_quotation': {
        const { quotationId } = data;
        const quotation = data.quotation || { id: quotationId };
        await emailAgent.sendQuotation(quotation);
        return NextResponse.json({
          success: true,
          action,
          message: 'Quotation sent successfully',
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: ['process_email', 'approve', 'send_response', 'send_quotation'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Email agent API error', { error });
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
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status': {
        const stats = await emailAgent.getStatistics();
        return NextResponse.json({
          success: true,
          data: {
            enabled: true,
            status: 'active',
            statistics: stats,
          },
        });
      }

      case 'statistics': {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const dateRange = from && to
          ? { from: new Date(from), to: new Date(to) }
          : undefined;

        const stats = await emailAgent.getStatistics(dateRange);
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      default:
        return NextResponse.json({
          success: true,
          data: { message: 'Email Agent API' },
        });
    }
  } catch (error) {
    logger.error('Email agent API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    await emailAgent.updateConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config,
    });
  } catch (error) {
    logger.error('Email agent API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
