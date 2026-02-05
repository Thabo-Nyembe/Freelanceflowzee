/**
 * KAZI Email Automations API
 *
 * Endpoints for automation workflow management and execution.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { automationEngine } from '@/lib/email/automation-engine'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('email-automations')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const automationId = searchParams.get('id')

    if (automationId) {
      const automation = await automationEngine.getAutomation(automationId)
      if (!automation) {
        return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
      }
      return NextResponse.json({ automation })
    }

    const automations = await automationEngine.getAutomationsByUser(user.id)
    return NextResponse.json({ automations })
  } catch (error) {
    logger.error('Failed to fetch automations', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch automations' },
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
        const automation = await automationEngine.createAutomation(user.id, {
          name: data.name,
          description: data.description,
          status: 'draft',
          triggers: data.triggers || [],
          steps: data.steps || [],
          settings: data.settings || {
            allowReEntry: false,
            exitOnUnsubscribe: true,
            exitOnBounce: true,
            exitOnComplaint: true,
            timezone: data.timezone || 'UTC'
          }
        })
        return NextResponse.json({ automation })
      }

      case 'activate': {
        await automationEngine.activateAutomation(data.automationId)
        return NextResponse.json({ success: true })
      }

      case 'pause': {
        await automationEngine.pauseAutomation(data.automationId)
        return NextResponse.json({ success: true })
      }

      case 'archive': {
        await automationEngine.archiveAutomation(data.automationId)
        return NextResponse.json({ success: true })
      }

      case 'trigger': {
        const result = await automationEngine.handleTrigger(
          data.triggerType,
          data.subscriberId,
          data.eventData || {}
        )
        return NextResponse.json(result)
      }

      case 'enter': {
        const automation = await automationEngine.getAutomation(data.automationId)
        if (!automation) {
          return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }
        const state = await automationEngine.enterAutomation(
          automation,
          data.subscriberId,
          data.triggerId,
          data.eventData || {}
        )
        return NextResponse.json({ state })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Automation action failed', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Automation action failed' },
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
    const { automationId, ...updates } = body

    if (!automationId) {
      return NextResponse.json({ error: 'Automation ID required' }, { status: 400 })
    }

    const automation = await automationEngine.updateAutomation(automationId, updates)
    return NextResponse.json({ automation })
  } catch (error) {
    logger.error('Failed to update automation', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update automation' },
      { status: 500 }
    )
  }
}
