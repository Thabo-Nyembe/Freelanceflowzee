/**
 * Lead Generation API Routes
 *
 * REST endpoints for Lead Generation:
 * GET - List leads, campaigns, landing pages, forms, stats
 * POST - Create lead, campaign, landing page, form, submission
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getLeadGenLeads,
  createLeadGenLead,
  getLeadGenCampaigns,
  createLeadGenCampaign,
  getLeadGenLandingPages,
  createLeadGenLandingPage,
  getLeadGenForms,
  createLeadGenForm,
  getFormFields,
  addFormField,
  submitForm,
  getLeadGenStats
} from '@/lib/lead-generation-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'leads'
    const status = searchParams.get('status') as any
    const source = searchParams.get('source') as any
    const formId = searchParams.get('form_id') || undefined

    switch (type) {
      case 'leads': {
        const { data, error } = await getLeadGenLeads(user.id, {
          status,
          source
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'campaigns': {
        const { data, error } = await getLeadGenCampaigns(user.id, { status })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'landing-pages': {
        const { data, error } = await getLeadGenLandingPages(user.id, { status })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'forms': {
        const { data, error } = await getLeadGenForms(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'form-fields': {
        if (!formId) {
          return NextResponse.json({ error: 'form_id required' }, { status: 400 })
        }
        const { data, error } = await getFormFields(formId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getLeadGenStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Lead Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead generation data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-lead': {
        const { data, error } = await createLeadGenLead(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-campaign': {
        const { data, error } = await createLeadGenCampaign(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-landing-page': {
        const { data, error } = await createLeadGenLandingPage(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-form': {
        const { data, error } = await createLeadGenForm(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-form-field': {
        const { form_id, ...fieldData } = payload
        if (!form_id) {
          return NextResponse.json({ error: 'form_id required' }, { status: 400 })
        }
        const { data, error } = await addFormField(form_id, fieldData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'submit-form': {
        const { form_id, lead_id, data: formData, metadata } = payload
        if (!form_id) {
          return NextResponse.json({ error: 'form_id required' }, { status: 400 })
        }
        const { data, error } = await submitForm(form_id, lead_id, formData, metadata)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Lead Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to process lead generation request' },
      { status: 500 }
    )
  }
}
