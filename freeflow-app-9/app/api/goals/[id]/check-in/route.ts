/**
 * Goal Check-In API - FreeFlow A+++ Implementation
 * Regular progress check-ins for goals
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

const logger = createFeatureLogger('goals-check-in');

const checkInSchema = z.object({
  status: z.enum(['active', 'on_track', 'at_risk', 'behind', 'completed']).optional(),
  progress_update: z.number().optional(),
  confidence_level: z.number().min(1).max(5).optional(),
  blockers: z.string().optional(),
  wins: z.string().optional(),
  notes: z.string().optional(),
  linked_tasks: z.array(z.string()).optional(),
  linked_projects: z.array(z.string()).optional(),
});

// POST - Create a check-in
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: goalId } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = checkInSchema.parse(body);

    // Verify goal exists and belongs to user
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id, current_value, status')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (goalError || !goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Create check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from('goal_check_ins')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        ...validatedData,
        linked_tasks: validatedData.linked_tasks ? JSON.stringify(validatedData.linked_tasks) : null,
        linked_projects: validatedData.linked_projects ? JSON.stringify(validatedData.linked_projects) : null,
      })
      .select()
      .single();

    if (checkInError) {
      logger.error('Failed to create check-in', { error: checkInError });
      return NextResponse.json(
        { error: 'Failed to create check-in' },
        { status: 500 }
      );
    }

    // Update goal if progress or status changed
    const updateData: Record<string, unknown> = {};

    if (validatedData.progress_update !== undefined) {
      updateData.current_value = validatedData.progress_update;
    }

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('goals')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);
    }

    return NextResponse.json({
      success: true,
      data: checkIn,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Failed to create check-in', { error });
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    );
  }
}

// GET - Get check-ins for a goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: goalId } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data: checkIns, error } = await supabase
      .from('goal_check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch check-ins' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: checkIns || [],
    });
  } catch (error) {
    logger.error('Failed to fetch check-ins', { error });
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}
