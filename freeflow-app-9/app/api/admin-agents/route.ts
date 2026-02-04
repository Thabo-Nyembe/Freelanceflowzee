/**
 * Admin Agents API Routes
 *
 * REST endpoints for Admin Agents:
 * GET - Agents, executions, logs, metrics, configurations, stats
 * POST - Create agent, execution, log, metric, configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-agents')
import {

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
  getAgents,
  createAgent,
  getActiveAgents,
  getAgentsByType,
  getAgentsByStatus,
  getCriticalAgents,
  getUnhealthyAgents,
  getAgentsDueForExecution,
  getRecentExecutions,
  createExecution,
  getRunningExecutions,
  getFailedExecutions,
  getExecutionsByStatus,
  createLog,
  getErrorLogs,
  getLogsByLevel,
  recordMetric,
  setConfiguration,
  getAgentStats,
  getSystemHealth
} from '@/lib/admin-agents-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'agents'
    const agentType = searchParams.get('agent_type') as string | null
    const status = searchParams.get('status') as string | null
    const executionStatus = searchParams.get('execution_status') as string | null
    const logLevel = searchParams.get('log_level') as string | null
    const maxHealthScore = searchParams.get('max_health_score') ? parseInt(searchParams.get('max_health_score')!) : 70
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'agents': {
        const result = await getAgents(user.id)
        return NextResponse.json({ data: result })
      }

      case 'active-agents': {
        const result = await getActiveAgents(user.id)
        return NextResponse.json({ data: result })
      }

      case 'agents-by-type': {
        if (!agentType) {
          return NextResponse.json({ error: 'agent_type required' }, { status: 400 })
        }
        const result = await getAgentsByType(user.id, agentType)
        return NextResponse.json({ data: result })
      }

      case 'agents-by-status': {
        if (!status) {
          return NextResponse.json({ error: 'status required' }, { status: 400 })
        }
        const result = await getAgentsByStatus(user.id, status)
        return NextResponse.json({ data: result })
      }

      case 'critical-agents': {
        const result = await getCriticalAgents(user.id)
        return NextResponse.json({ data: result })
      }

      case 'unhealthy-agents': {
        const result = await getUnhealthyAgents(user.id, maxHealthScore)
        return NextResponse.json({ data: result })
      }

      case 'agents-due': {
        const result = await getAgentsDueForExecution(user.id)
        return NextResponse.json({ data: result })
      }

      case 'executions': {
        const result = await getRecentExecutions(user.id, limit)
        return NextResponse.json({ data: result })
      }

      case 'running-executions': {
        const result = await getRunningExecutions(user.id)
        return NextResponse.json({ data: result })
      }

      case 'failed-executions': {
        const result = await getFailedExecutions(user.id, limit)
        return NextResponse.json({ data: result })
      }

      case 'executions-by-status': {
        if (!executionStatus) {
          return NextResponse.json({ error: 'execution_status required' }, { status: 400 })
        }
        const result = await getExecutionsByStatus(user.id, executionStatus, limit)
        return NextResponse.json({ data: result })
      }

      case 'error-logs': {
        const result = await getErrorLogs(user.id, limit)
        return NextResponse.json({ data: result })
      }

      case 'logs-by-level': {
        if (!logLevel) {
          return NextResponse.json({ error: 'log_level required' }, { status: 400 })
        }
        const result = await getLogsByLevel(user.id, logLevel, limit)
        return NextResponse.json({ data: result })
      }

      case 'stats': {
        const result = await getAgentStats(user.id)
        return NextResponse.json({ data: result })
      }

      case 'system-health': {
        const result = await getSystemHealth(user.id)
        return NextResponse.json({ data: { health_score: result } })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Admin Agents data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Admin Agents data' },
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
    const { action, ...payload } = body

    switch (action) {
      case 'create-agent': {
        const result = await createAgent(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-execution': {
        const result = await createExecution(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-log': {
        const result = await createLog(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'record-metric': {
        const result = await recordMetric(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'set-configuration': {
        const result = await setConfiguration(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Admin Agents request', { error })
    return NextResponse.json(
      { error: 'Failed to process Admin Agents request' },
      { status: 500 }
    )
  }
}
