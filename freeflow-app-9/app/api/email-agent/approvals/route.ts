/**
 * Email Agent Approvals API
 *
 * Manage approval workflows for email responses and quotations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const approver = searchParams.get('approver');

    let query = supabase.from('approval_workflows').select('*');

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (approver) {
      query = query.contains('approvers', [approver]);
    }

    const { data: workflows, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch related items (responses or quotations)
    const enrichedWorkflows = await Promise.all(
      workflows.map(async (workflow) => {
        let item = null;

        if (workflow.type === 'email_response') {
          const { data } = await supabase
            .from('email_responses')
            .select('*')
            .eq('id', workflow.itemId)
            .single();
          item = data;
        } else if (workflow.type === 'quotation') {
          const { data } = await supabase
            .from('quotations')
            .select('*')
            .eq('id', workflow.itemId)
            .single();
          item = data;
        }

        return {
          ...workflow,
          item,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedWorkflows,
      count: workflows.length,
    });
  } catch (error: any) {
    logger.error('Error fetching approval workflows', { error });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch approval workflows',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { workflowId, approver, action, comments } = body;

    if (!workflowId || !approver || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: workflowId, approver, action',
        },
        { status: 400 }
      );
    }

    // Get workflow
    const { data: workflow, error: fetchError } = await supabase
      .from('approval_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (fetchError || !workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      );
    }

    // Verify approver is authorized
    if (!workflow.approvers.includes(approver)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized approver',
        },
        { status: 403 }
      );
    }

    // Add approval action to history
    const approvalAction = {
      approver,
      action,
      timestamp: new Date().toISOString(),
      comments,
    };

    const updatedHistory = [...(workflow.approval_history || []), approvalAction];
    const newStatus = action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : workflow.status;

    // Update workflow
    const { error: updateError } = await supabase
      .from('approval_workflows')
      .update({
        approval_history: updatedHistory,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId);

    if (updateError) throw updateError;

    // If approved, update the related item status
    if (action === 'approved') {
      if (workflow.type === 'email_response') {
        await supabase
          .from('email_responses')
          .update({
            status: 'approved',
            approved_by: approver,
            approved_at: new Date().toISOString(),
          })
          .eq('id', workflow.item_id);
      } else if (workflow.type === 'quotation') {
        await supabase
          .from('quotations')
          .update({
            status: 'approved',
            approved_by: approver,
            approved_at: new Date().toISOString(),
          })
          .eq('id', workflow.item_id);
      }

      // Create notification for requester
      await supabase.from('notifications').insert({
        user_id: workflow.requested_by,
        type: 'approval_completed',
        title: `${workflow.type} Approved`,
        message: `Your ${workflow.type} has been approved by ${approver}`,
        metadata: { workflowId, action },
        created_at: new Date().toISOString(),
      });
    }

    logger.info('Approval action processed', {
      workflowId,
      approver,
      action,
    });

    return NextResponse.json({
      success: true,
      message: `Workflow ${action} successfully`,
      data: {
        workflowId,
        status: newStatus,
        action,
      },
    });
  } catch (error: any) {
    logger.error('Error processing approval', { error });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process approval',
      },
      { status: 500 }
    );
  }
}
