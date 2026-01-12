/**
 * Lead Generation API - Single Resource Routes
 *
 * PUT - Update lead, campaign, landing page, form
 * DELETE - Delete form field
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateLeadGenLead,
  convertLead,
  updateLeadGenCampaign,
  updateLeadGenLandingPage,
  publishLandingPage,
  updateLeadGenForm,
  deleteFormField
} from '@/lib/lead-generation-queries'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    let result

    switch (type) {
      case 'lead':
        if (action === 'convert') {
          result = await convertLead(id)
        } else {
          result = await updateLeadGenLead(id, updates)
        }
        break

      case 'campaign':
        result = await updateLeadGenCampaign(id, updates)
        break

      case 'landing-page':
        if (action === 'publish') {
          result = await publishLandingPage(id)
        } else {
          result = await updateLeadGenLandingPage(id, updates)
        }
        break

      case 'form':
        result = await updateLeadGenForm(id, updates)
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (result?.error) throw result.error

    return NextResponse.json({ data: result?.data })
  } catch (error) {
    console.error('Lead Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'form-field'

    if (type === 'form-field') {
      const { error } = await deleteFormField(id)
      if (error) throw error
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
