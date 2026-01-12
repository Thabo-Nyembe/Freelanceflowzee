/**
 * Admin Agents API - Single Resource Routes
 *
 * GET - Get single agent, execution, logs, metrics, configurations, performance
 * PUT - Update agent, execution, enable/disable/pause/resume/stop agent
 * DELETE - Delete agent, configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAgent,
  getAgentByName,
  updateAgent,
  deleteAgent,
  enableAgent,
  disableAgent,
  pauseAgent,
  resumeAgent,
  stopAgent,
  getExecution,
  getExecutionsByAgent,
  updateExecution,
  startExecution,
  completeExecution,
  failExecution,
  cancelExecution,
  getLogs,
  getLogsByExecution,
  getMetrics,
  getMetricsByTimeRange,
  getConfiguration,
  getConfigurations,
  deleteConfiguration,
  getAgentPerformance
} from '@/lib/admin-agents-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'agent'
    const agentName = searchParams.get('agent_name')
    const executionId = searchParams.get('execution_id')
    const configKey = searchParams.get('config_key')
    const metricName = searchParams.get('metric_name')
    const startTime = searchParams.get('start_time')
    const endTime = searchParams.get('end_time')
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 7
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    switch (type) {
      case 'agent': {
        const result = await getAgent(id)
        return NextResponse.json({ data: result })
      }

      case 'agent-by-name': {
        if (!agentName) {
          return NextResponse.json({ error: 'agent_name required' }, { status: 400 })
        }
        const result = await getAgentByName(user.id, agentName)
        return NextResponse.json({ data: result })
      }

      case 'execution': {
        const result = await getExecution(id)
        return NextResponse.json({ data: result })
      }

      case 'executions': {
        const result = await getExecutionsByAgent(id, limit)
        return NextResponse.json({ data: result })
      }

      case 'logs': {
        const result = await getLogs(id, limit)
        return NextResponse.json({ data: result })
      }

      case 'logs-by-execution': {
        if (!executionId) {
          return NextResponse.json({ error: 'execution_id required' }, { status: 400 })
        }
        const result = await getLogsByExecution(executionId)
        return NextResponse.json({ data: result })
      }

      case 'metrics': {
        const result = await getMetrics(id, metricName || undefined, limit)
        return NextResponse.json({ data: result })
      }

      case 'metrics-by-time': {
        if (!metricName || !startTime || !endTime) {
          return NextResponse.json({ error: 'metric_name, start_time, and end_time required' }, { status: 400 })
        }
        const result = await getMetricsByTimeRange(id, metricName, startTime, endTime)
        return NextResponse.json({ data: result })
      }

      case 'configuration': {
        if (!configKey) {
          return NextResponse.json({ error: 'config_key required' }, { status: 400 })
        }
        const result = await getConfiguration(id, configKey)
        return NextResponse.json({ data: result })
      }

      case 'configurations': {
        const result = await getConfigurations(id)
        return NextResponse.json({ data: result })
      }

      case 'performance': {
        const result = await getAgentPerformance(id, days)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Agents API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'agent': {
        if (action === 'enable') {
          const result = await enableAgent(id)
          return NextResponse.json({ data: result })
        } else if (action === 'disable') {
          const result = await disableAgent(id)
          return NextResponse.json({ data: result })
        } else if (action === 'pause') {
          const result = await pauseAgent(id)
          return NextResponse.json({ data: result })
        } else if (action === 'resume') {
          const result = await resumeAgent(id)
          return NextResponse.json({ data: result })
        } else if (action === 'stop') {
          const result = await stopAgent(id)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateAgent(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'execution': {
        if (action === 'start') {
          const result = await startExecution(id)
          return NextResponse.json({ data: result })
        } else if (action === 'complete') {
          const result = await completeExecution(id, updates.result || {})
          return NextResponse.json({ data: result })
        } else if (action === 'fail') {
          const result = await failExecution(id, updates.error_message, updates.stack_trace)
          return NextResponse.json({ data: result })
        } else if (action === 'cancel') {
          const result = await cancelExecution(id)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateExecution(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Agents API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'agent'
    const configKey = searchParams.get('config_key')

    switch (type) {
      case 'agent': {
        await deleteAgent(id)
        return NextResponse.json({ success: true })
      }

      case 'configuration': {
        if (!configKey) {
          return NextResponse.json({ error: 'config_key required' }, { status: 400 })
        }
        await deleteConfiguration(id, configKey)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Agents API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
