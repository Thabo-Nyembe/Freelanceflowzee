import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, reason } = body

    if (!status || !['accepted', 'rejected', 'pending', 'draft', 'expired'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString()
    } else if (status === 'rejected') {
      updateData.rejected_at = new Date().toISOString()
      if (reason) {
        updateData.rejection_reason = reason
      }
    }

    const { data: proposal, error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: proposal,
      message: `Proposal ${status}`
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update proposal status' }, { status: 500 })
  }
}
