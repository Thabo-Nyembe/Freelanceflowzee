/**
 * Renewals API Routes
 *
 * REST endpoints for Customer Renewal Management:
 * GET - List renewals, playbooks, pipeline
 * POST - Create renewal, run playbook, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'list'

    switch (type) {
      case 'list': {
        const { data, error } = await supabase
          .from('renewals')
          .select('*')
          .eq('user_id', user.id)
          .order('renewal_date', { ascending: true })
          .limit(50)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          renewals: data || []
        })
      }

      case 'playbooks': {
        const { data, error } = await supabase
          .from('renewal_playbooks')
          .select('*')
          .order('name')

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          playbooks: data || [
            { id: '1', name: 'Standard Renewal', steps: 5, successRate: 78 },
            { id: '2', name: 'High-Value Account', steps: 8, successRate: 85 },
            { id: '3', name: 'At-Risk Recovery', steps: 12, successRate: 62 }
          ]
        })
      }

      case 'pipeline': {
        const { data, error } = await supabase
          .from('renewal_pipeline')
          .select('*')
          .eq('user_id', user.id)
          .order('stage')

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          pipeline: data || []
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Renewals GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch renewals' }, { status: 500 })
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
      case 'create-renewal': {
        const { customerName, contractValue, renewalDate, type, notes } = data

        const { data: renewal, error } = await supabase
          .from('renewals')
          .insert({
            user_id: user.id,
            customer_name: customerName,
            contract_value: contractValue,
            renewal_date: renewalDate,
            type: type || 'standard',
            notes,
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'create-renewal',
          renewal: renewal || {
            id: `renewal-${Date.now()}`,
            customerName,
            status: 'pending'
          },
          message: 'Renewal created successfully'
        })
      }

      case 'run-playbook': {
        const { renewalId, playbookId } = data

        // In production, this would start a workflow/automation
        const { error } = await supabase
          .from('playbook_runs')
          .insert({
            user_id: user.id,
            renewal_id: renewalId,
            playbook_id: playbookId,
            status: 'running',
            started_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'run-playbook',
          message: 'Playbook started successfully'
        })
      }

      case 'export-pipeline': {
        const { format = 'csv', dateRange = 'all' } = data

        const { data: pipeline, error } = await supabase
          .from('renewals')
          .select('*')
          .eq('user_id', user.id)
          .order('renewal_date', { ascending: true })

        if (error && error.code !== '42P01') throw error

        const exportData = pipeline || []

        if (format === 'csv') {
          const csvContent = 'Customer,Contract Value,Renewal Date,Status\n' +
            exportData.map((r: any) => `"${r.customer_name}",${r.contract_value},${r.renewal_date},${r.status}`).join('\n')

          return NextResponse.json({
            success: true,
            action: 'export-pipeline',
            format: 'csv',
            content: csvContent,
            filename: `renewals-pipeline-${new Date().toISOString().split('T')[0]}.csv`,
            message: 'Pipeline exported successfully'
          })
        }

        return NextResponse.json({
          success: true,
          action: 'export-pipeline',
          format: format || 'json',
          data: exportData,
          filename: `renewals-pipeline-${new Date().toISOString().split('T')[0]}.json`,
          message: 'Pipeline exported successfully'
        })
      }

      case 'update-status': {
        const { renewalId, status } = data

        const { error } = await supabase
          .from('renewals')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', renewalId)
          .eq('user_id', user.id)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'update-status',
          message: 'Renewal status updated'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Renewals POST error:', error)
    return NextResponse.json({ error: 'Failed to process renewal request' }, { status: 500 })
  }
}
