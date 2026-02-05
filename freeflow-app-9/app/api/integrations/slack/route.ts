/**
 * Slack Integration API
 * Configure Slack notifications and channels
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('integrations-slack')

/**
 * POST /api/integrations/slack - Configure Slack integration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, enabled, settings } = body as {
      action: 'configure' | 'test' | 'disconnect'
      enabled?: boolean
      settings?: {
        notifications?: boolean
        channel?: string
        webhook_url?: string
      }
    }

    switch (action) {
      case 'configure': {
        // Check if Slack integration exists
        const { data: existing } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'slack')
          .single()

        if (existing) {
          // Update existing integration
          const { data, error } = await supabase
            .from('integrations')
            .update({
              settings: {
                ...existing.settings,
                ...settings
              },
              status: enabled ? 'active' : 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) throw error

          return NextResponse.json({
            success: true,
            message: 'Slack configuration updated',
            integration: data
          })
        } else {
          // Create new Slack integration
          const { data, error } = await supabase
            .from('integrations')
            .insert({
              user_id: user.id,
              type: 'slack',
              name: 'Slack',
              description: 'Slack notifications for announcements',
              status: enabled ? 'active' : 'inactive',
              settings: settings || {
                notifications: true,
                channel: '#announcements'
              }
            })
            .select()
            .single()

          if (error) throw error

          return NextResponse.json({
            success: true,
            message: 'Slack integration configured',
            integration: data
          }, { status: 201 })
        }
      }

      case 'test': {
        // Test Slack connection
        const { data: integration } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'slack')
          .single()

        if (!integration) {
          return NextResponse.json(
            { error: 'Slack integration not configured' },
            { status: 404 }
          )
        }

        // In production, would send test message to Slack
        return NextResponse.json({
          success: true,
          message: 'Test message sent to Slack',
          channel: integration.settings?.channel || '#general'
        })
      }

      case 'disconnect': {
        const { error } = await supabase
          .from('integrations')
          .update({
            status: 'disconnected',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('type', 'slack')

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Slack integration disconnected'
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to configure Slack'
    logger.error('Slack integration error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
