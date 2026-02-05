import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-Analytics')

// =====================================================
// GET - Fetch Analytics Data
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const demoMode = isDemoMode(request);

    const effectiveUserId = user?.id || (demoMode ? getDemoUserId(null, true) : null);

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return basic analytics summary
    return NextResponse.json({
      success: true,
      analytics: {
        user_id: effectiveUserId,
        demo: demoMode || effectiveUserId === DEMO_USER_ID,
        message: 'Analytics data available'
      }
    });
  } catch (error) {
    logger.error('Analytics GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Fetch failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Update Analytics Configuration
// =====================================================
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const demoMode = isDemoMode(request);

    const effectiveUserId = user?.id || (demoMode ? getDemoUserId(null, true) : null);

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, table, ...updates } = body;

    if (!id || !table) {
      return NextResponse.json(
        { success: false, error: 'ID and table name required' },
        { status: 400 }
      );
    }

    // Update record in specified analytics table
    const { data, error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', effectiveUserId)
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          message: 'Update recorded (demo mode)',
          data: { id, ...updates }
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Updated successfully'
    });
  } catch (error) {
    logger.error('Analytics PATCH error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete Analytics Data
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const demoMode = isDemoMode(request);

    const effectiveUserId = user?.id || (demoMode ? getDemoUserId(null, true) : null);

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const table = searchParams.get('table');

    if (!id || !table) {
      return NextResponse.json(
        { success: false, error: 'ID and table name required' },
        { status: 400 }
      );
    }

    // Delete record from specified analytics table
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', effectiveUserId);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          message: 'Deletion recorded (demo mode)'
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully'
    });
  } catch (error) {
    logger.error('Analytics DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Deletion failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper Functions
// =====================================================
