/**
 * Key Results API - FreeFlow A+++ Implementation
 * Manage key results for OKRs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('goals-key-results');

const createKeyResultSchema = z.object({
  objective_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  metric_type: z.enum(['number', 'percentage', 'currency', 'boolean', 'milestone', 'count']).default('percentage'),
  target_value: z.number().default(100),
  starting_value: z.number().default(0),
  unit: z.string().optional(),
  weight: z.number().default(1),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
});

const updateKeyResultSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'on_track', 'at_risk', 'behind', 'completed', 'cancelled']).optional(),
  current_value: z.number().optional(),
  target_value: z.number().optional(),
  weight: z.number().optional(),
  due_date: z.string().optional(),
});

// POST - Create a key result
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createKeyResultSchema.parse(body);

    // Verify objective exists and belongs to user
    const { data: objective, error: objError } = await supabase
      .from('goals')
      .select('id')
      .eq('id', validatedData.objective_id)
      .eq('user_id', user.id)
      .eq('goal_type', 'objective')
      .single();

    if (objError || !objective) {
      return NextResponse.json(
        { error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Get the max sort_order
    const { data: existing } = await supabase
      .from('key_results')
      .select('sort_order')
      .eq('objective_id', validatedData.objective_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = existing ? existing.sort_order + 1 : 0;

    // Create key result
    const { data: keyResult, error } = await supabase
      .from('key_results')
      .insert({
        ...validatedData,
        user_id: user.id,
        status: 'active',
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create key result', { error });
      return NextResponse.json(
        { error: 'Failed to create key result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: keyResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Failed to create key result', { error });
    return NextResponse.json(
      { error: 'Failed to create key result' },
      { status: 500 }
    );
  }
}

// PATCH - Update key result(s)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, updates, reorder } = body;

    // Handle reordering
    if (reorder && Array.isArray(reorder)) {
      const updatePromises = reorder.map((item: { id: string; sort_order: number }) =>
        supabase
          .from('key_results')
          .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
          .eq('user_id', user.id)
      );

      await Promise.all(updatePromises);

      return NextResponse.json({
        success: true,
        message: 'Key results reordered',
      });
    }

    // Handle single update
    if (id && updates) {
      const validatedUpdates = updateKeyResultSchema.parse(updates);

      // Handle completion
      let updateData = { ...validatedUpdates } as Record<string, unknown>;
      if (validatedUpdates.status === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      }

      const { data: keyResult, error } = await supabase
        .from('key_results')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update key result' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: keyResult,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Failed to update key result', { error });
    return NextResponse.json(
      { error: 'Failed to update key result' },
      { status: 500 }
    );
  }
}

// DELETE - Delete key result
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Key result ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('key_results')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete key result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Key result deleted',
    });
  } catch (error) {
    logger.error('Failed to delete key result', { error });
    return NextResponse.json(
      { error: 'Failed to delete key result' },
      { status: 500 }
    );
  }
}
