import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))

    // Update proposal status to 'sent'
    const { data: proposal, error } = await supabase
      .from('proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_email: body.recipient_email,
        recipient_name: body.recipient_name,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // In production, you would send an email here
    // await sendEmail({ to: body.recipient_email, subject: `Proposal: ${proposal.title}`, ... })

    return NextResponse.json({
      success: true,
      data: proposal,
      message: `Proposal sent to ${body.recipient_email || 'recipient'}`
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send proposal' }, { status: 500 })
  }
}
