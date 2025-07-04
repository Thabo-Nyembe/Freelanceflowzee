import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;
    const reviewId = params.reviewId;
    const body = await request.json();
    const { action, stage_id, feedback } = body;

    // Validate action
    if (!['approve', 'reject', 'changes_requested'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify review exists and get details
    const { data: review, error: reviewError } = await supabase
      .from('client_reviews')
      .select(`
        *,
        video:videos(id, user_id, project_id),
        stages:review_stages(*),
        approvals:review_approvals(*)
      `)
      .eq('id', reviewId)
      .eq('video_id', videoId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user has permission to approve (reviewer or video owner)
    const isVideoOwner = review.video.user_id === user.id;
    const existingApproval = review.approvals.find(
      approval => approval.user_id === user.id && approval.stage_id === stage_id
    );

    // For non-owners, check if they are assigned as reviewers
    if (!isVideoOwner && !existingApproval) {
      // Check if user is invited as reviewer by email
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      const emailApproval = review.approvals.find(
        approval => approval.reviewer_email === userProfile?.email && approval.stage_id === stage_id
      );

      if (!emailApproval) {
        return NextResponse.json({ error: 'Not authorized to review this stage' }, { status: 403 });
      }
    }

    // Get stage details
    const stage = review.stages.find(s => s.id === stage_id);
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Create or update approval record
    const approvalData = {
      review_id: reviewId,
      stage_id: stage_id,
      user_id: user.id,
      status: action,
      feedback: feedback || null,
      timestamp: new Date().toISOString()
    };

    let approval;
    if (existingApproval) {
      // Update existing approval
      const { data: updatedApproval, error: updateError } = await supabase
        .from('review_approvals')
        .update(approvalData)
        .eq('id', existingApproval.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating approval:', updateError);
        return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
      }

      approval = updatedApproval;
    } else {
      // Create new approval
      const { data: newApproval, error: createError } = await supabase
        .from('review_approvals')
        .insert(approvalData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating approval:', createError);
        return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
      }

      approval = newApproval;
    }

    // Check if stage is complete and update review status
    const { data: allStageApprovals } = await supabase
      .from('review_approvals')
      .select('*')
      .eq('review_id', reviewId)
      .eq('stage_id', stage_id);

    const approvedCount = allStageApprovals?.filter(a => a.status === 'approved').length || 0;
    const rejectedCount = allStageApprovals?.filter(a => a.status === 'rejected').length || 0;
    const changesRequestedCount = allStageApprovals?.filter(a => a.status === 'changes_requested').length || 0;

    let reviewStatus = review.status;
    let nextStageId = review.current_stage;

    // Determine if stage is complete
    const isStageComplete = approvedCount >= stage.required_approvals;
    const isStageRejected = rejectedCount > 0;
    const hasChangesRequested = changesRequestedCount > 0;

    if (isStageRejected) {
      reviewStatus = 'rejected';
    } else if (hasChangesRequested) {
      reviewStatus = 'changes_requested';
    } else if (isStageComplete) {
      // Find next stage
      const currentStageOrder = stage.order_index;
      const nextStage = review.stages
        .filter(s => s.order_index > currentStageOrder)
        .sort((a, b) => a.order_index - b.order_index)[0];

      if (nextStage) {
        // Move to next stage
        nextStageId = nextStage.id;
        reviewStatus = 'in_review';

        // Auto-create approvals for next stage if auto-advance is enabled
        if (stage.auto_advance) {
          // Get reviewers for next stage (could be from templates or settings)
          // For now, we'll use the same reviewers
          const nextStageApprovals = review.approvals
            .filter(a => a.stage_id === stage_id)
            .map(a => ({
              review_id: reviewId,
              stage_id: nextStage.id,
              user_id: a.user_id,
              reviewer_email: a.reviewer_email,
              status: 'pending',
              timestamp: new Date().toISOString()
            }));

          if (nextStageApprovals.length > 0) {
            await supabase
              .from('review_approvals')
              .insert(nextStageApprovals);
          }
        }
      } else {
        // All stages complete
        reviewStatus = 'approved';
        await supabase
          .from('client_reviews')
          .update({ 
            completed_at: new Date().toISOString()
          })
          .eq('id', reviewId);
      }
    }

    // Update review status and current stage
    const { error: reviewUpdateError } = await supabase
      .from('client_reviews')
      .update({
        status: reviewStatus,
        current_stage: nextStageId,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (reviewUpdateError) {
      console.error('Error updating review status:', reviewUpdateError);
      return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
    }

    // Send notifications if enabled
    if (review.settings?.send_notifications) {
      // TODO: Implement notification system
      // This could include email notifications, in-app notifications, etc.
    }

    // Return updated approval with review status
    const { data: updatedReview } = await supabase
      .from('client_reviews')
      .select(`
        *,
        stages:review_stages(*),
        approvals:review_approvals(
          *,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .eq('id', reviewId)
      .single();

    return NextResponse.json({
      approval,
      review: updatedReview,
      stage_complete: isStageComplete,
      review_complete: reviewStatus === 'approved'
    });

  } catch (error) {
    console.error('Error in POST /api/video/[id]/reviews/[reviewId]/approve:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.reviewId;

    // Get review approval status
    const { data: review, error: reviewError } = await supabase
      .from('client_reviews')
      .select(`
        *,
        stages:review_stages(*),
        approvals:review_approvals(
          *,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Calculate stage completion status
    const stageStats = review.stages.map(stage => {
      const stageApprovals = review.approvals.filter(a => a.stage_id === stage.id);
      const approvedCount = stageApprovals.filter(a => a.status === 'approved').length;
      const rejectedCount = stageApprovals.filter(a => a.status === 'rejected').length;
      const pendingCount = stageApprovals.filter(a => a.status === 'pending').length;
      
      return {
        stage_id: stage.id,
        stage_name: stage.name,
        required_approvals: stage.required_approvals,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        pending_count: pendingCount,
        is_complete: approvedCount >= stage.required_approvals,
        is_rejected: rejectedCount > 0
      };
    });

    const overallProgress = stageStats.filter(s => s.is_complete).length / stageStats.length * 100;

    return NextResponse.json({
      review,
      stage_stats: stageStats,
      overall_progress: overallProgress
    });

  } catch (error) {
    console.error('Error in GET /api/video/[id]/reviews/[reviewId]/approve:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 