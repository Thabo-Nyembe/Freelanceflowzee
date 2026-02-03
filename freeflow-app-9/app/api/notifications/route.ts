}

// =====================================================
// PATCH - Update Notification
// =====================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notification: data,
      message: 'Notification updated successfully'
    })
  } catch (error) {
    logger.error('Notifications PATCH error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// DELETE - Delete Notification (hard delete)
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID required' },
        { status: 400 }
      )
    }

    await notificationService.delete(user.id, notificationId)

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    logger.error('Notifications DELETE error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
