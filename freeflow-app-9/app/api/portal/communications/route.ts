/**
 * KAZI Client Portal API - Communications Management
 *
 * Comprehensive API for managing client communications including
 * messages, notes, calls, and meetings.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('portal-communications')

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
    const communicationId = searchParams.get('communicationId')

    switch (action) {
      case 'list': {
        const type = searchParams.get('type')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('portal_communications')
          .select(`
            *,
            portal_clients!inner(id, name, company, user_id)
          `, { count: 'exact' })
          .eq('portal_clients.user_id', user.id)

        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        if (type) {
          query = query.eq('type', type)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          communications: data,
          total: count,
          limit,
          offset
        })
      }

      case 'get': {
        if (!communicationId) {
          return NextResponse.json({ error: 'Communication ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('portal_communications')
          .select(`
            *,
            portal_clients!inner(id, name, email, company, user_id)
          `)
          .eq('id', communicationId)
          .eq('portal_clients.user_id', user.id)
          .single()

        if (error) throw error

        return NextResponse.json({ communication: data })
      }

      case 'thread': {
        if (!clientId) {
          return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
        }

        const threadId = searchParams.get('threadId')

        let query = supabase
          .from('portal_communications')
          .select('*')
          .eq('client_id', clientId)

        if (threadId) {
          query = query.or(`id.eq.${threadId},thread_id.eq.${threadId}`)
        }

        const { data, error } = await query
          .order('created_at', { ascending: true })

        if (error) throw error

        return NextResponse.json({ thread: data })
      }

      case 'statistics': {
        let query = supabase
          .from('portal_communications')
          .select('type, direction, created_at')
          .eq('portal_clients.user_id', user.id)

        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        const { data: comms, error } = await query

        if (error) throw error

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const recentComms = comms.filter(c => new Date(c.created_at) > thirtyDaysAgo)

        const stats = {
          total: comms.length,
          last_30_days: recentComms.length,
          by_type: {
            email: comms.filter(c => c.type === 'email').length,
            call: comms.filter(c => c.type === 'call').length,
            meeting: comms.filter(c => c.type === 'meeting').length,
            note: comms.filter(c => c.type === 'note').length,
            message: comms.filter(c => c.type === 'message').length
          },
          by_direction: {
            inbound: comms.filter(c => c.direction === 'inbound').length,
            outbound: comms.filter(c => c.direction === 'outbound').length
          }
        }

        return NextResponse.json({ statistics: stats })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal communications GET error', { error })
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
        // Verify client belongs to user
        const { data: client, error: clientError } = await supabase
          .from('portal_clients')
          .select('id, name')
          .eq('id', data.clientId)
          .eq('user_id', user.id)
          .single()

        if (clientError || !client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        const { data: communication, error } = await supabase
          .from('portal_communications')
          .insert({
            client_id: data.clientId,
            type: data.type,
            direction: data.direction || 'outbound',
            subject: data.subject,
            content: data.content,
            thread_id: data.threadId,
            attachments: data.attachments || [],
            metadata: data.metadata || {}
          })
          .select()
          .single()

        if (error) throw error

        // Log activity
        await supabase
          .from('portal_client_activities')
          .insert({
            client_id: data.clientId,
            user_id: user.id,
            action: `${data.type}_logged`,
            description: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)}: ${data.subject || 'Communication logged'}`,
            metadata: { communication_id: communication.id }
          })

        // Update client's last_contact
        await supabase
          .from('portal_clients')
          .update({
            last_contact: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', data.clientId)

        return NextResponse.json({ communication }, { status: 201 })
      }

      case 'log_call': {
        const { data: communication, error } = await supabase
          .from('portal_communications')
          .insert({
            client_id: data.clientId,
            type: 'call',
            direction: data.direction || 'outbound',
            subject: data.subject || 'Phone call',
            content: data.notes,
            metadata: {
              duration: data.duration,
              outcome: data.outcome,
              phone_number: data.phoneNumber,
              ...data.metadata
            }
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ communication }, { status: 201 })
      }

      case 'log_meeting': {
        const { data: communication, error } = await supabase
          .from('portal_communications')
          .insert({
            client_id: data.clientId,
            type: 'meeting',
            direction: 'outbound',
            subject: data.subject,
            content: data.notes,
            metadata: {
              date: data.date,
              duration: data.duration,
              attendees: data.attendees,
              location: data.location,
              action_items: data.actionItems,
              ...data.metadata
            }
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ communication }, { status: 201 })
      }

      case 'add_note': {
        const { data: communication, error } = await supabase
          .from('portal_communications')
          .insert({
            client_id: data.clientId,
            type: 'note',
            direction: 'internal',
            subject: data.subject,
            content: data.content,
            metadata: {
              category: data.category,
              priority: data.priority,
              ...data.metadata
            }
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ communication }, { status: 201 })
      }

      case 'reply': {
        // Get original communication
        const { data: original, error: originalError } = await supabase
          .from('portal_communications')
          .select('*')
          .eq('id', data.communicationId)
          .single()

        if (originalError || !original) {
          return NextResponse.json({ error: 'Original communication not found' }, { status: 404 })
        }

        const { data: communication, error } = await supabase
          .from('portal_communications')
          .insert({
            client_id: original.client_id,
            type: original.type,
            direction: data.direction || 'outbound',
            subject: data.subject || `Re: ${original.subject}`,
            content: data.content,
            thread_id: original.thread_id || original.id,
            attachments: data.attachments || [],
            metadata: data.metadata || {}
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ communication }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal communications POST error', { error })
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
    const { communicationId, ...updateData } = body

    if (!communicationId) {
      return NextResponse.json({ error: 'Communication ID required' }, { status: 400 })
    }

    // Remove fields that shouldn't be updated
    delete updateData.client_id
    delete updateData.created_at

    const { data: communication, error } = await supabase
      .from('portal_communications')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', communicationId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ communication })
  } catch (error) {
    logger.error('Portal communications PUT error', { error })
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
    const communicationId = searchParams.get('communicationId')

    if (!communicationId) {
      return NextResponse.json({ error: 'Communication ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('portal_communications')
      .delete()
      .eq('id', communicationId)

    if (error) throw error

    return NextResponse.json({ deleted: true })
  } catch (error) {
    logger.error('Portal communications DELETE error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
