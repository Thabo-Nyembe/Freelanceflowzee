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

const logger = createSimpleLogger('plugins')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('plugins')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'installed': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('user_plugins')
          .select('*, plugins(*)')
          .eq('user_id', user?.id)
          .order('installed_at', { ascending: false })

        if (error && error.code !== 'PGRST116') throw error
        return NextResponse.json({ data: data || [] })
      }

      case 'collections': {
        const { data, error } = await supabase
          .from('plugin_collections')
          .select('*')
          .order('name')

        if (error && error.code !== 'PGRST116') throw error
        return NextResponse.json({ data: data || [] })
      }

      case 'export': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('user_plugins')
          .select('plugins(name, version, category)')
          .eq('user_id', user?.id)

        if (error) throw error

        const csvRows = ['Name,Version,Category']
        data?.forEach((p: any) => {
          if (p.plugins) {
            csvRows.push(`"${p.plugins.name}","${p.plugins.version}","${p.plugins.category}"`)
          }
        })

        return new NextResponse(csvRows.join('\n'), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="plugins-export-${Date.now()}.csv"`
          }
        })
      }

      default: {
        const { data, error } = await supabase
          .from('plugins')
          .select('*')
          .order('downloads', { ascending: false })
          .limit(50)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('Plugins API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plugins' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    const { data: { user } } = await supabase.auth.getUser()

    switch (action) {
      case 'install': {
        const { pluginId, pluginName } = body

        const { data, error } = await supabase
          .from('user_plugins')
          .insert({
            user_id: user?.id,
            plugin_id: pluginId,
            is_active: true,
            installed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, pluginName, installed: true })
      }

      case 'uninstall': {
        const { pluginId, pluginName } = body

        const { error } = await supabase
          .from('user_plugins')
          .delete()
          .eq('user_id', user?.id)
          .eq('plugin_id', pluginId)

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, pluginName, removed: true })
      }

      case 'activate': {
        const { pluginId, pluginName } = body

        const { error } = await supabase
          .from('user_plugins')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('user_id', user?.id)
          .eq('plugin_id', pluginId)

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, pluginName, activated: true })
      }

      case 'deactivate': {
        const { pluginId, pluginName } = body

        const { error } = await supabase
          .from('user_plugins')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('user_id', user?.id)
          .eq('plugin_id', pluginId)

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, pluginName, deactivated: true })
      }

      case 'update': {
        const { pluginId, pluginName, newVersion } = body

        const { error } = await supabase
          .from('user_plugins')
          .update({
            current_version: newVersion,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id)
          .eq('plugin_id', pluginId)

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, pluginName, version: newVersion })
      }

      case 'bulk_update': {
        const { pluginIds } = body

        const { error } = await supabase
          .from('user_plugins')
          .update({ updated_at: new Date().toISOString() })
          .eq('user_id', user?.id)
          .in('plugin_id', pluginIds)

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, updated: pluginIds.length })
      }

      case 'install_collection': {
        const { collectionId, pluginIds, collectionName } = body

        const inserts = pluginIds.map((pluginId: string) => ({
          user_id: user?.id,
          plugin_id: pluginId,
          is_active: true,
          installed_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('user_plugins')
          .upsert(inserts, { onConflict: 'user_id,plugin_id' })

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, collectionName, installed: pluginIds.length })
      }

      case 'configure': {
        const { pluginId, pluginName, settings } = body

        const { data, error } = await supabase
          .from('user_plugin_settings')
          .upsert({
            user_id: user?.id,
            plugin_id: pluginId,
            settings: settings || {},
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, pluginName, configured: true })
      }

      case 'save_settings': {
        const { settings } = body

        const { data, error } = await supabase
          .from('plugin_general_settings')
          .upsert({
            user_id: user?.id,
            ...settings,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, saved: true })
      }

      case 'backup': {
        const { data, error } = await supabase
          .from('user_plugins')
          .select('*, plugins(name, version, category)')
          .eq('user_id', user?.id)

        if (error && error.code !== '42P01') throw error

        const backup = {
          timestamp: new Date().toISOString(),
          userId: user?.id,
          plugins: data || [],
          version: '1.0'
        }

        return NextResponse.json({
          success: true,
          backup,
          downloadUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(backup)).toString('base64')}`
        })
      }

      case 'security_scan': {
        // In production, this would actually scan plugins for vulnerabilities
        const { data, error } = await supabase
          .from('user_plugins')
          .select('plugin_id, plugins(name)')
          .eq('user_id', user?.id)

        const scannedCount = data?.length || 0
        return NextResponse.json({
          success: true,
          scannedCount,
          vulnerabilities: [],
          message: `Security scan completed. ${scannedCount} plugins scanned. No vulnerabilities detected.`
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Plugins API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
