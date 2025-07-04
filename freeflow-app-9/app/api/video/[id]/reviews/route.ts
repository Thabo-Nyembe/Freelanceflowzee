import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;
    const body = await request.json();

    // Verify video ownership or access
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, user_id, project_id')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if user owns the video or has project access
    if (video.user_id !== user.id) {
      if (video.project_id) {
        const { data: projectAccess } = await supabase
          .from('project_collaborators')
          .select('role')
          .eq('project_id', video.project_id)
          .eq('user_id', user.id)
          .single();

        if (!projectAccess || !['owner', 'editor'].includes(projectAccess.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Create review workflow
    const reviewData = {
      video_id: videoId,
      project_id: video.project_id,
      title: body.title,
      description: body.description,
      deadline: body.deadline,
      status: 'draft',
      created_by: user.id,
      settings: body.settings || {
        allow_comments: true,
        require_all_approvals: true,
        auto_advance_stages: false,
        send_notifications: true
      }
    };

    const { data: review, error: reviewError } = await supabase
      .from('client_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Create review stages
    if (body.stages && body.stages.length > 0) {
      const stagesData = body.stages.map((stage: any, index: number) => ({
        review_id: review.id,
        name: stage.name,
        description: stage.description,
        order_index: stage.order || index + 1,
        required_approvals: stage.required_approvals || 1,
        auto_advance: stage.auto_advance || false,
        deadline_hours: stage.deadline_hours
      }));

      const { error: stagesError } = await supabase
        .from('review_stages')
        .insert(stagesData);

      if (stagesError) {
        console.error('Error creating stages:', stagesError);
        // Clean up review if stages creation fails
        await supabase.from('client_reviews').delete().eq('id', review.id);
        return NextResponse.json({ error: 'Failed to create review stages' }, { status: 500 });
      }
    }

    // Add reviewers/approvers if provided
    if (body.reviewer_emails && body.reviewer_emails.length > 0) {
      // Get first stage for initial approvals
      const { data: firstStage } = await supabase
        .from('review_stages')
        .select('id')
        .eq('review_id', review.id)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      if (firstStage) {
        const approvalData = body.reviewer_emails.map((email: string) => ({
          review_id: review.id,
          stage_id: firstStage.id,
          reviewer_email: email,
          status: 'pending'
        }));

        await supabase
          .from('review_approvals')
          .insert(approvalData);
      }
    }

    // Get complete review data with stages
    const { data: completeReview, error: fetchError } = await supabase
      .from('client_reviews')
      .select(`
        *,
        stages:review_stages(*),
        approvals:review_approvals(*)
      `)
      .eq('id', review.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete review:', fetchError);
      return NextResponse.json({ error: 'Review created but failed to fetch details' }, { status: 500 });
    }

    return NextResponse.json(completeReview);

  } catch (error) {
    console.error('Error in POST /api/video/[id]/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Verify video access
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, user_id, project_id')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Get reviews for this video
    const { data: reviews, error: reviewsError } = await supabase
      .from('client_reviews')
      .select(`
        *,
        stages:review_stages(*),
        approvals:review_approvals(
          *,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json(reviews || []);

  } catch (error) {
    console.error('Error in GET /api/video/[id]/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;
    const body = await request.json();
    const { review_id, ...updates } = body;

    if (!review_id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Verify review ownership
    const { data: review, error: reviewError } = await supabase
      .from('client_reviews')
      .select('id, created_by, video_id')
      .eq('id', review_id)
      .eq('video_id', videoId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.created_by !== user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from('client_reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', review_id)
      .select(`
        *,
        stages:review_stages(*),
        approvals:review_approvals(
          *,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json(updatedReview);

  } catch (error) {
    console.error('Error in PUT /api/video/[id]/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 