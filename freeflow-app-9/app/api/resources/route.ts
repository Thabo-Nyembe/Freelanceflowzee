import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('resources')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'export': {
        const format = searchParams.get('format') || 'json'
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (format === 'csv') {
          const csv = [
            'Title,Type,Category,Downloads,Price,CreatedAt',
            ...(data || []).map(r => `${r.title},${r.type},${r.category},${r.downloads},${r.price || 0},${r.created_at}`)
          ].join('\n')
          return new NextResponse(csv, {
            headers: { 'Content-Type': 'text/csv' }
          })
        }

        return NextResponse.json({ data })
      }

      case 'download': {
        const resourceId = searchParams.get('resourceId')
        const { data, error } = await supabase
          .from('resources')
          .select('file_url, title')
          .eq('id', resourceId)
          .single()

        if (error) throw error
        return NextResponse.json({ url: data?.file_url, title: data?.title })
      }

      case 'share': {
        const resourceId = searchParams.get('resourceId')
        const shareUrl = `https://freeflow.app/resources/${resourceId}`
        return NextResponse.json({ shareUrl })
      }

      default: {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('Resources API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
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
      case 'create': {
        const { title, description, type, category, tags, isPremium, price, visibility } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('resources')
          .insert({
            user_id: user?.id,
            title,
            description,
            type,
            category,
            tags,
            is_premium: isPremium,
            price: price || 0,
            visibility,
            downloads: 0
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'upload': {
        const { title, description, files } = body
        const { data: { user } } = await supabase.auth.getUser()

        // In production, files would be uploaded to storage
        const { data, error } = await supabase
          .from('resources')
          .insert({
            user_id: user?.id,
            title,
            description,
            type: 'file',
            downloads: 0
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save_settings': {
        const { settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('resource_settings')
          .upsert({
            user_id: user?.id,
            ...settings
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'purchase': {
        const { resourceId, price } = body
        // In production, this would process payment
        return NextResponse.json({ success: true, resourceId, price })
      }

      case 'duplicate': {
        const { resourceId } = body
        const { data: original, error: fetchError } = await supabase
          .from('resources')
          .select('*')
          .eq('id', resourceId)
          .single()

        if (fetchError) throw fetchError

        const { id, created_at, updated_at, ...resourceData } = original
        const { data, error } = await supabase
          .from('resources')
          .insert({
            ...resourceData,
            title: `${original.title} (Copy)`
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'archive': {
        const { resourceId } = body
        const { error } = await supabase
          .from('resources')
          .update({ status: 'archived' })
          .eq('id', resourceId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'save_general_settings': {
        const { defaultWorkingHours, workDays, timeZone, fiscalYearStart } = body

        const { data, error } = await supabase
          .from('resource_settings')
          .upsert({
            user_id: user?.id,
            setting_type: 'general',
            default_working_hours: defaultWorkingHours || 8,
            work_days: workDays || 5,
            timezone: timeZone || 'America/New_York',
            fiscal_year_start: fiscalYearStart || 'January',
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, settings: data })
      }

      case 'save_capacity_settings': {
        const { defaultWeeklyCapacity, overallocationThreshold, warningThreshold, billableTarget, includeWeekends } = body

        const { data, error } = await supabase
          .from('resource_settings')
          .upsert({
            user_id: user?.id,
            setting_type: 'capacity',
            default_weekly_capacity: defaultWeeklyCapacity || 40,
            overallocation_threshold: overallocationThreshold || 100,
            warning_threshold: warningThreshold || 90,
            billable_target: billableTarget || 75,
            include_weekends: includeWeekends || false,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, settings: data })
      }

      case 'save_notification_settings': {
        const { overallocationAlerts, bookingConfirmations, leaveRequestNotifications, weeklyUtilizationReports, skillExpiryReminders } = body

        const { data, error } = await supabase
          .from('resource_settings')
          .upsert({
            user_id: user?.id,
            setting_type: 'notifications',
            overallocation_alerts: overallocationAlerts !== false,
            booking_confirmations: bookingConfirmations !== false,
            leave_request_notifications: leaveRequestNotifications !== false,
            weekly_utilization_reports: weeklyUtilizationReports !== false,
            skill_expiry_reminders: skillExpiryReminders || false,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, settings: data })
      }

      case 'save_security_settings': {
        const { twoFactorAuth, sessionTimeout, auditLogging, dataEncryption } = body

        const { data, error } = await supabase
          .from('resource_settings')
          .upsert({
            user_id: user?.id,
            setting_type: 'security',
            two_factor_auth: twoFactorAuth !== false,
            session_timeout: sessionTimeout || 30,
            audit_logging: auditLogging !== false,
            data_encryption: dataEncryption !== false,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, settings: data })
      }

      case 'configure_integration': {
        const { integrationName, config } = body

        const { data, error } = await supabase
          .from('resource_integrations')
          .upsert({
            user_id: user?.id,
            name: integrationName,
            config: config || {},
            is_connected: true,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, integrationName, configured: true })
      }

      case 'regenerate_api_key': {
        const newKey = `res_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')}`.substring(0, 36)

        const { data, error } = await supabase
          .from('resource_api_keys')
          .upsert({
            user_id: user?.id,
            api_key_prefix: newKey.substring(0, 12),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, apiKey: newKey })
      }

      case 'prepare_import': {
        // Mark import session as initiated
        return NextResponse.json({
          success: true,
          importSessionId: `imp_${Date.now()}`,
          message: 'Import wizard ready - Select files to import'
        })
      }

      case 'clear_all_data': {
        // Soft delete all user resources
        const { error } = await supabase
          .from('resources')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', user?.id)
          .is('deleted_at', null)

        if (error) throw error

        // Clear settings
        await supabase
          .from('resource_settings')
          .delete()
          .eq('user_id', user?.id)

        return NextResponse.json({ success: true, message: 'All data has been cleared' })
      }

      case 'reset_to_defaults': {
        // Delete all custom settings
        const { error } = await supabase
          .from('resource_settings')
          .delete()
          .eq('user_id', user?.id)

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, message: 'Settings reset to defaults' })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Resources API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Resources API error', { error })
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    )
  }
}
