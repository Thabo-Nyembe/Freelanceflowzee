/**
 * Single Goal API - FreeFlow A+++ Implementation
 * Individual goal management, updates, and progress tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createFeatureLogger } from '@/lib/logger';

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

const logger = createFeatureLogger('goals-detail');

const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'on_track', 'at_risk', 'behind', 'completed', 'cancelled', 'deferred']).optional(),
  due_date: z.string().optional(),
  target_value: z.number().optional(),
  current_value: z.number().optional(),
  priority: z.number().min(1).max(5).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  visibility: z.enum(['private', 'team', 'public']).optional(),
});

// GET - Get single goal with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch goal with related data
    const { data: goal, error } = await supabase
      .from('goals')
      .select(`
        *,
        parent:goals!parent_id(id, title, goal_type),
        children:goals!parent_id(id, title, status, progress_percentage, goal_type)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Fetch key results if objective
    let keyResults = [];
    if (goal.goal_type === 'objective') {
      const { data: krs } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', id)
        .order('sort_order');
      keyResults = krs || [];
    }

    // Fetch milestones
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', id)
      .order('sort_order');

    // Fetch recent progress history
    const { data: progressHistory } = await supabase
      .from('goal_progress_history')
      .select('*')
      .eq('goal_id', id)
      .order('recorded_at', { ascending: false })
      .limit(20);

    // Fetch recent check-ins
    const { data: checkIns } = await supabase
      .from('goal_check_ins')
      .select('*')
      .eq('goal_id', id)
      .order('check_in_date', { ascending: false })
      .limit(10);

    // Fetch linked entities
    const { data: links } = await supabase
      .from('goal_links')
      .select('*')
      .eq('goal_id', id);

    return NextResponse.json({
      success: true,
      data: {
        ...goal,
        key_results: keyResults,
        milestones: milestones || [],
        progress_history: progressHistory || [],
        check_ins: checkIns || [],
        links: links || [],
      },
    });
  } catch (error) {
    logger.error('Failed to fetch goal', { error });
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

// PUT - Update goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateGoalSchema.parse(body);

    // Check if goal exists and belongs to user
    const { data: existing, error: existError } = await supabase
      .from('goals')
      .select('id, current_value, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Handle status changes
    const updateData = { ...validatedData } as Record<string, unknown>;

    if (validatedData.status === 'completed' && existing.status !== 'completed') {
      updateData.completed_date = new Date().toISOString().split('T')[0];
    }

    // Update goal
    const { data: goal, error } = await supabase
      .from('goals')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update goal', { error });
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Failed to update goal', { error });
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete goal (cascades to related tables)
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Failed to delete goal', { error });
      return NextResponse.json(
        { error: 'Failed to delete goal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted',
    });
  } catch (error) {
    logger.error('Failed to delete goal', { error });
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
