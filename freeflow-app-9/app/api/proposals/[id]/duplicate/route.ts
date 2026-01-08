import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch the original proposal
    const { data: original, error: fetchError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ success: false, error: 'Original proposal not found' }, { status: 404 })
    }

    // Create a duplicate with new id and reset status
    const duplicateData = {
      ...original,
      id: undefined, // Let Supabase generate new ID
      title: `${original.title} (Copy)`,
      status: 'draft',
      sent_at: null,
      accepted_at: null,
      rejected_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      proposal_number: `PROP-${Date.now()}`,
    }

    delete duplicateData.id

    const { data: duplicate, error: createError } = await supabase
      .from('proposals')
      .insert(duplicateData)
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ success: false, error: createError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: duplicate,
      message: 'Proposal duplicated successfully'
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to duplicate proposal' }, { status: 500 })
  }
}
