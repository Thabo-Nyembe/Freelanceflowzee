import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('releases')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('releases')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'analytics': {
        const { data: releases, error } = await supabase
          .from('releases')
          .select('downloads, created_at, version')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error

        const totalDownloads = (releases || []).reduce((sum, r) => sum + (r.downloads || 0), 0)
        return NextResponse.json({
          totalDownloads,
          releases,
          refreshedAt: new Date().toISOString()
        })
      }

      case 'download_asset': {
        const assetId = searchParams.get('assetId')
        const { data, error } = await supabase
          .from('release_assets')
          .select('file_url, name')
          .eq('id', assetId)
          .single()

        if (error) throw error

        // Increment download count
        await supabase.rpc('increment_asset_downloads', { asset_id: assetId })

        return NextResponse.json({ url: data?.file_url, name: data?.name })
      }

      case 'download_all': {
        const releaseId = searchParams.get('releaseId')
        const { data, error } = await supabase
          .from('release_assets')
          .select('file_url, name')
          .eq('release_id', releaseId)

        if (error) throw error
        return NextResponse.json({ assets: data })
      }

      default: {
        const { data, error } = await supabase
          .from('releases')
          .select('*, release_assets(*)')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('Releases API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch releases' },
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
      case 'pause_deployment': {
        const { deploymentId } = body
        const { error } = await supabase
          .from('deployments')
          .update({ status: 'paused' })
          .eq('id', deploymentId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'resume_deployment': {
        const { deploymentId } = body
        const { error } = await supabase
          .from('deployments')
          .update({ status: 'in_progress' })
          .eq('id', deploymentId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'upload_asset': {
        const { releaseId, fileName, fileSize, contentType } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('release_assets')
          .insert({
            release_id: releaseId,
            name: fileName,
            size: fileSize,
            content_type: contentType,
            uploaded_by: user?.id,
            downloads: 0
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'configure_environment': {
        const { environment, config } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('environment_configs')
          .upsert({
            user_id: user?.id,
            environment,
            config,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'create_release': {
        const { version, title, description, releaseType } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('releases')
          .insert({
            user_id: user?.id,
            version,
            title,
            description,
            release_type: releaseType,
            status: 'draft',
            downloads: 0
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
    logger.error('Releases API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
