/**
 * KAZI Client Portal API - Clients Management
 *
 * Comprehensive API for managing portal clients with health scoring,
 * activity tracking, and metrics.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

const logger = createFeatureLogger('portal-clients')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const clientId = searchParams.get('clientId')

    switch (action) {
      case 'list': {
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('portal_clients')
          .select('*, portal_client_metrics(*)', { count: 'exact' })
          .eq('user_id', user.id)

        if (status) {
          query = query.eq('status', status)
        }

        if (search) {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
        }

        query = query.order(sortBy, { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) throw error

        return NextResponse.json({
          clients: data,
          total: count,
          limit,
          offset
        })
      }

      case 'get': {
        if (!clientId) {
          return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('portal_clients')
          .select(`
            *,
            portal_client_metrics(*),
            portal_projects(id, name, status, progress, created_at),
            portal_communications(id, type, subject, created_at)
          `)
          .eq('id', clientId)
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        return NextResponse.json({ client: data })
      }

      case 'statistics': {
        const { data, error } = await supabase.rpc('get_portal_statistics', {
          p_user_id: user.id
        })

        if (error) {
          // Fallback if function doesn't exist
          const { data: clients, error: clientsError } = await supabase
            .from('portal_clients')
            .select('status, health_score')
            .eq('user_id', user.id)

          if (clientsError) throw clientsError

          const stats = {
            total_clients: clients.length,
            active_clients: clients.filter(c => c.status === 'active').length,
            at_risk_clients: clients.filter(c => (c.health_score || 100) < 50).length,
            avg_health_score: clients.length > 0
              ? Math.round(clients.reduce((sum, c) => sum + (c.health_score || 100), 0) / clients.length)
              : 100
          }

          return NextResponse.json({ statistics: stats })
        }

        return NextResponse.json({ statistics: data })
      }

      case 'health': {
        if (!clientId) {
          return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
        }

        const { data, error } = await supabase.rpc('calculate_client_health', {
          p_client_id: clientId
        })

        if (error) {
          // Calculate health manually if function doesn't exist
          const { data: client } = await supabase
            .from('portal_clients')
            .select('health_score')
            .eq('id', clientId)
            .single()

          return NextResponse.json({ health_score: client?.health_score || 100 })
        }

        return NextResponse.json({ health_score: data })
      }

      case 'activities': {
        if (!clientId) {
          return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
        }

        const limit = parseInt(searchParams.get('limit') || '20')

        const { data, error } = await supabase
          .from('portal_client_activities')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        return NextResponse.json({ activities: data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal clients GET error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        const { data: client, error } = await supabase
          .from('portal_clients')
          .insert({
            user_id: user.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            industry: data.industry,
            website: data.website,
            address: data.address,
            notes: data.notes,
            tags: data.tags || [],
            status: 'active',
            health_score: 100
          })
          .select()
          .single()

        if (error) throw error

        // Create initial metrics record
        await supabase
          .from('portal_client_metrics')
          .insert({
            client_id: client.id,
            total_projects: 0,
            completed_projects: 0,
            total_revenue: 0,
            outstanding_balance: 0,
            avg_response_time: 0
          })

        // Log activity
        await supabase
          .from('portal_client_activities')
          .insert({
            client_id: client.id,
            user_id: user.id,
            action: 'client_created',
            description: `Client "${data.name}" was created`
          })

        return NextResponse.json({ client }, { status: 201 })
      }

      case 'import': {
        const { clients } = data
        if (!Array.isArray(clients) || clients.length === 0) {
          return NextResponse.json({ error: 'Invalid clients data' }, { status: 400 })
        }

        const clientsToInsert = clients.map(c => ({
          user_id: user.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          status: 'active',
          health_score: 100
        }))

        const { data: imported, error } = await supabase
          .from('portal_clients')
          .insert(clientsToInsert)
          .select()

        if (error) throw error

        return NextResponse.json({
          imported: imported.length,
          clients: imported
        }, { status: 201 })
      }

      case 'log_activity': {
        const { clientId, activityType, description, metadata } = data

        const { data: activity, error } = await supabase
          .from('portal_client_activities')
          .insert({
            client_id: clientId,
            user_id: user.id,
            action: activityType,
            description,
            metadata: metadata || {}
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ activity }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal clients POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, ...updateData } = body

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.user_id
    delete updateData.created_at

    const { data: client, error } = await supabase
      .from('portal_clients')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase
      .from('portal_client_activities')
      .insert({
        client_id: clientId,
        user_id: user.id,
        action: 'client_updated',
        description: `Client profile was updated`,
        metadata: { updated_fields: Object.keys(updateData) }
      })

    return NextResponse.json({ client })
  } catch (error) {
    logger.error('Portal clients PUT error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const hardDelete = searchParams.get('hard') === 'true'

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    if (hardDelete) {
      // Permanent delete
      const { error } = await supabase
        .from('portal_clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ deleted: true })
    } else {
      // Soft delete - set status to archived
      const { data: client, error } = await supabase
        .from('portal_clients')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ client, archived: true })
    }
  } catch (error) {
    logger.error('Portal clients DELETE error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
