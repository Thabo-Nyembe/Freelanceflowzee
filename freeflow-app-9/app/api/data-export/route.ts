// =====================================================
// KAZI Data Export API - Database-Wired
// Pipeline management and data export operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('data-export')

// =====================================================
// GET - List pipelines, sources, destinations
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'pipelines': {
        const { data: pipelines, error } = await supabase
          .from('data_pipelines')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ success: true, pipelines: pipelines || [] })
      }

      case 'sources': {
        const { data: sources, error } = await supabase
          .from('data_sources')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error
        return NextResponse.json({ success: true, sources: sources || [] })
      }

      case 'destinations': {
        const { data: destinations, error } = await supabase
          .from('data_destinations')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error
        return NextResponse.json({ success: true, destinations: destinations || [] })
      }

      case 'exports': {
        const { data: exports, error } = await supabase
          .from('data_exports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        return NextResponse.json({ success: true, exports: exports || [] })
      }

      default: {
        const { data: pipelines } = await supabase
          .from('data_pipelines')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        return NextResponse.json({ success: true, pipelines: pipelines || [] })
      }
    }
  } catch (error: any) {
    logger.error('Data Export GET error', { error })
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// =====================================================
// POST - Create pipelines, run exports, perform actions
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create-pipeline': {
        const { data: pipeline, error } = await supabase
          .from('data_pipelines')
          .insert({
            user_id: user.id,
            name: data.name,
            description: data.description,
            source_type: data.sourceType,
            destination_type: data.destinationType,
            frequency: data.frequency || 'hourly',
            status: 'active',
            config: data.config || {}
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ success: true, pipeline }, { status: 201 })
      }

      case 'pause-pipeline': {
        const { error } = await supabase
          .from('data_pipelines')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', data.pipelineId)
          .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true, message: 'Pipeline paused' })
      }

      case 'resume-pipeline': {
        const { error } = await supabase
          .from('data_pipelines')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', data.pipelineId)
          .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true, message: 'Pipeline resumed' })
      }

      case 'run-pipeline': {
        const { data: exportJob, error } = await supabase
          .from('data_exports')
          .insert({
            user_id: user.id,
            pipeline_id: data.pipelineId,
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ success: true, exportJob })
      }

      case 'clone-pipeline': {
        const { data: original, error: fetchError } = await supabase
          .from('data_pipelines')
          .select('*')
          .eq('id', data.pipelineId)
          .eq('user_id', user.id)
          .single()

        if (fetchError) throw fetchError

        const { data: clone, error: insertError } = await supabase
          .from('data_pipelines')
          .insert({
            user_id: user.id,
            name: `${original.name} (Copy)`,
            description: original.description,
            source_type: original.source_type,
            destination_type: original.destination_type,
            frequency: original.frequency,
            status: 'paused',
            config: original.config
          })
          .select()
          .single()

        if (insertError) throw insertError
        return NextResponse.json({ success: true, pipeline: clone }, { status: 201 })
      }

      case 'pause-all': {
        const { error } = await supabase
          .from('data_pipelines')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('status', 'active')

        if (error) throw error
        return NextResponse.json({ success: true, message: 'All pipelines paused' })
      }

      case 'sync-source': {
        const { error } = await supabase
          .from('data_sources')
          .update({ last_synced_at: new Date().toISOString(), status: 'connected' })
          .eq('id', data.sourceId)
          .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true, message: 'Source synced' })
      }

      case 'create-source': {
        const { data: source, error } = await supabase
          .from('data_sources')
          .insert({
            user_id: user.id,
            name: data.name,
            type: data.type,
            connection_string: data.connectionString,
            config: data.config || {},
            status: 'connected'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ success: true, source }, { status: 201 })
      }

      case 'create-destination': {
        const { data: destination, error } = await supabase
          .from('data_destinations')
          .insert({
            user_id: user.id,
            name: data.name,
            type: data.type,
            connection_string: data.connectionString,
            config: data.config || {},
            status: 'connected'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ success: true, destination }, { status: 201 })
      }

      case 'export-data': {
        const { data: exportJob, error } = await supabase
          .from('data_exports')
          .insert({
            user_id: user.id,
            export_type: data.exportType || 'manual',
            format: data.format || 'csv',
            filters: data.filters || {},
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ success: true, exportJob }, { status: 201 })
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    logger.error('Data Export POST error', { error })
    return NextResponse.json({ success: false, error: error.message || 'Operation failed' }, { status: 500 })
  }
}

// =====================================================
// DELETE - Delete pipelines, sources, destinations
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id required' }, { status: 400 })
    }

    const tableName = type === 'pipeline' ? 'data_pipelines' : 
                      type === 'source' ? 'data_sources' : 
                      type === 'destination' ? 'data_destinations' : null

    if (!tableName) {
      return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 })
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id).eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true, message: `${type} deleted` })
  } catch (error: any) {
    logger.error('Data Export DELETE error', { error })
    return NextResponse.json({ success: false, error: error.message || 'Delete failed' }, { status: 500 })
  }
}
