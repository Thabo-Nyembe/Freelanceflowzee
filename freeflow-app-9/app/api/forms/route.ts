import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('forms')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const formId = searchParams.get('formId')

    // Handle export action
    if (action === 'export') {
      const { data: forms, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const exportData = {
        forms: forms?.map(form => ({
          id: form.id,
          title: form.title,
          status: form.status,
          type: form.form_type,
          submissions: form.total_submissions,
          views: form.total_views,
          completionRate: form.completion_rate,
          createdAt: form.created_at,
        })),
        exportedAt: new Date().toISOString(),
        totalForms: forms?.length || 0,
      }

      return NextResponse.json(exportData)
    }

    // Get forms list
    const { data: forms, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: forms })
  } catch (error) {
    logger.error('Forms API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch forms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'regenerate_api_key': {
        // Generate a new API key
        const newApiKey = `fk_${crypto.randomUUID().replace(/-/g, '')}`
        return NextResponse.json({ apiKey: newApiKey })
      }

      case 'add_webhook': {
        const { url, events, formId } = body
        const { error } = await supabase
          .from('forms')
          .update({
            webhook_url: url,
            webhook_events: events
          })
          .eq('id', formId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'verify_domain': {
        const { domain } = body
        // In production, this would verify DNS records
        return NextResponse.json({ verified: true, domain })
      }

      case 'delete_all_responses': {
        const { formId } = body
        const { error } = await supabase
          .from('form_submissions')
          .delete()
          .eq('form_id', formId)

        if (error) throw error

        // Reset form statistics
        await supabase
          .from('forms')
          .update({
            total_submissions: 0,
            total_completed: 0,
            total_started: 0
          })
          .eq('id', formId)

        return NextResponse.json({ success: true })
      }

      case 'delete_workspace': {
        const { workspaceId, userId } = body
        // Delete all forms in workspace
        const { error } = await supabase
          .from('forms')
          .delete()
          .eq('organization_id', workspaceId)
          .eq('user_id', userId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'connect_integration': {
        const { integrationId, formId, config } = body
        const { data: form, error: fetchError } = await supabase
          .from('forms')
          .select('integration_settings')
          .eq('id', formId)
          .single()

        if (fetchError) throw fetchError

        const currentSettings = form?.integration_settings || {}
        const { error } = await supabase
          .from('forms')
          .update({
            integration_settings: {
              ...currentSettings,
              [integrationId]: { ...config, connected: true, connectedAt: new Date().toISOString() }
            }
          })
          .eq('id', formId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'disconnect_integration': {
        const { integrationId, formId } = body
        const { data: form, error: fetchError } = await supabase
          .from('forms')
          .select('integration_settings')
          .eq('id', formId)
          .single()

        if (fetchError) throw fetchError

        const currentSettings = form?.integration_settings || {}
        delete currentSettings[integrationId]

        const { error } = await supabase
          .from('forms')
          .update({ integration_settings: currentSettings })
          .eq('id', formId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'apply_theme': {
        const { themeId, formId } = body
        const { error } = await supabase
          .from('forms')
          .update({ theme: themeId })
          .eq('id', formId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'delete_webhook': {
        const { formId } = body
        const { error } = await supabase
          .from('forms')
          .update({ webhook_url: null, webhook_events: null })
          .eq('id', formId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Forms API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
