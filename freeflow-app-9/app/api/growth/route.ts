import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('growth')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'dashboards': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('growth_dashboards')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'paths': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('user_paths')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'integrations': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('growth_integrations')
          .select('*')
          .eq('user_id', user?.id)

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export': {
        const reportType = searchParams.get('reportType') || 'all'
        const format = searchParams.get('format') || 'json'
        const dateRange = searchParams.get('dateRange') || 'last30'
        const { data: { user } } = await supabase.auth.getUser()

        const exportData: Record<string, any> = {
          exportedAt: new Date().toISOString(),
          reportType,
          dateRange,
          userId: user?.id
        }

        // Fetch data based on report type
        if (reportType === 'all' || reportType === 'conversion') {
          const { data: funnels } = await supabase
            .from('conversion_funnels')
            .select('*')
          exportData.funnels = funnels
        }

        if (reportType === 'all' || reportType === 'cohort') {
          const { data: cohorts } = await supabase
            .from('cohorts')
            .select('*')
          exportData.cohorts = cohorts
        }

        if (reportType === 'all' || reportType === 'experiment') {
          const { data: experiments } = await supabase
            .from('growth_experiments')
            .select('*')
            .eq('user_id', user?.id)
          exportData.experiments = experiments
        }

        if (format === 'csv') {
          const csvRows = ['Type,Name,Status,Created At']
          exportData.funnels?.forEach((f: any) => {
            csvRows.push(`"Funnel","${f.name}","${f.is_active ? 'active' : 'inactive'}","${f.created_at}"`)
          })
          exportData.cohorts?.forEach((c: any) => {
            csvRows.push(`"Cohort","${c.name}","active","${c.created_at}"`)
          })
          exportData.experiments?.forEach((e: any) => {
            csvRows.push(`"Experiment","${e.name}","${e.status}","${e.created_at}"`)
          })

          return new NextResponse(csvRows.join('\n'), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="growth-report-${reportType}-${Date.now()}.csv"`
            }
          })
        }

        return NextResponse.json({ data: exportData })
      }

      default: {
        // Return overview stats
        const { data: { user } } = await supabase.auth.getUser()

        const [funnelsResult, cohortsResult, experimentsResult] = await Promise.all([
          supabase.from('conversion_funnels').select('id', { count: 'exact' }),
          supabase.from('cohorts').select('id', { count: 'exact' }),
          supabase.from('growth_experiments').select('id', { count: 'exact' }).eq('user_id', user?.id)
        ])

        return NextResponse.json({
          data: {
            totalFunnels: funnelsResult.count || 0,
            totalCohorts: cohortsResult.count || 0,
            totalExperiments: experimentsResult.count || 0
          }
        })
      }
    }
  } catch (error) {
    logger.error('Growth API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch growth data' },
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
      case 'create_dashboard': {
        const { name, description, widgets } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('growth_dashboards')
          .insert({
            user_id: user?.id,
            name,
            description,
            widgets: widgets || [],
            is_default: false
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'create_path': {
        const { name, startEvent, endEvent, maxSteps } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('user_paths')
          .insert({
            user_id: user?.id,
            name,
            start_event: startEvent,
            end_event: endEvent,
            max_steps: parseInt(maxSteps) || 10,
            status: 'active'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'configure_integration': {
        const { integrationName, config } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('growth_integrations')
          .upsert({
            user_id: user?.id,
            name: integrationName,
            config,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'clear_data': {
        const { dataType } = body
        const { data: { user } } = await supabase.auth.getUser()

        // Clear specific data type or all
        if (dataType === 'all' || dataType === 'experiments') {
          await supabase.from('growth_experiments').delete().eq('user_id', user?.id)
        }
        if (dataType === 'all' || dataType === 'dashboards') {
          await supabase.from('growth_dashboards').delete().eq('user_id', user?.id)
        }
        if (dataType === 'all' || dataType === 'paths') {
          await supabase.from('user_paths').delete().eq('user_id', user?.id)
        }

        return NextResponse.json({ success: true, cleared: dataType })
      }

      case 'reset_settings': {
        const { data: { user } } = await supabase.auth.getUser()

        // Reset to defaults
        const { data, error } = await supabase
          .from('growth_settings')
          .upsert({
            user_id: user?.id,
            settings: {
              dateRange: 'last30',
              autoRefresh: true,
              refreshInterval: 60,
              theme: 'system'
            },
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Growth API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
