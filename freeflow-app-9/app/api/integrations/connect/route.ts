/**
 * Integrations Connect API
 * Connect third-party integrations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('integrations-connect')

/**
 * POST /api/integrations/connect - Connect an integration
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
    const { integration_name, action: _action, credentials, settings } = body as {
      integration_name: string
      action: 'connect' | 'oauth'
      credentials?: Record<string, string>
      settings?: Record<string, unknown>
    }
    void _action // Action type for future OAuth flow support

    if (!integration_name) {
      return NextResponse.json(
        { error: 'integration_name is required' },
        { status: 400 }
      )
    }

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', integration_name)
      .single()

    if (existing) {
      // Update existing integration to connected status
      const { data, error } = await supabase
        .from('integrations')
        .update({
          status: 'active',
          credentials: credentials ? { ...existing.credentials, ...credentials } : existing.credentials,
          settings: settings ? { ...existing.settings, ...settings } : existing.settings,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: `${integration_name} has been connected`,
        integration: {
          ...data,
          credentials: undefined // Don't expose credentials
        }
      })
    }

    // Create new integration
    const { data, error } = await supabase
      .from('integrations')
      .insert({
        user_id: user.id,
        type: integration_name.toLowerCase().replace(/\s+/g, '_'),
        name: integration_name,
        status: 'active',
        credentials,
        settings: settings || {},
        connected_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `${integration_name} has been connected successfully`,
      integration: {
        ...data,
        credentials: undefined // Don't expose credentials
      }
    }, { status: 201 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect integration'
    logger.error('Integration connect error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
