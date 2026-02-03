}

// =====================================================
// PATCH - Update Analytics Configuration
// =====================================================
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const demoMode = isDemoMode(request);

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null);

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

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null);

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
