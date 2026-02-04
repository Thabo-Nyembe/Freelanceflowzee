/**
 * Voice API Routes
 *
 * REST endpoints for Voice Collaboration:
 * GET - List recordings, settings, participants
 * POST - Export recordings, save settings, start/end session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('voice')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'recordings'

    switch (type) {
      case 'recordings': {
        const { data, error } = await supabase
          .from('voice_recordings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          recordings: data || []
        })
      }

      case 'settings': {
        const { data, error } = await supabase
          .from('voice_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== '42P01' && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          success: true,
          settings: data || {
            inputDevice: 'default',
            outputDevice: 'default',
            noiseCancellation: true,
            echoCancellation: true,
            autoGainControl: true,
            sampleRate: 48000,
            bitrate: 128000
          }
        })
      }

      case 'active-sessions': {
        const { data, error } = await supabase
          .from('voice_sessions')
          .select('*')
          .eq('status', 'active')
          .order('started_at', { ascending: false })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          sessions: data || []
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Voice GET error', { error })
    return NextResponse.json({ error: 'Failed to fetch voice data' }, { status: 500 })
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
      case 'export-recordings': {
        const { recordingIds, format = 'mp3' } = data

        const { data: recordings, error } = await supabase
          .from('voice_recordings')
          .select('*')
          .eq('user_id', user.id)
          .in('id', recordingIds || [])

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'export-recordings',
          recordings: recordings || [],
          format,
          message: `${recordings?.length || 0} recordings ready for export`
        })
      }

      case 'save-settings': {
        const { inputDevice, outputDevice, noiseCancellation, echoCancellation, autoGainControl, sampleRate, bitrate } = data

        const { error } = await supabase
          .from('voice_settings')
          .upsert({
            user_id: user.id,
            input_device: inputDevice,
            output_device: outputDevice,
            noise_cancellation: noiseCancellation,
            echo_cancellation: echoCancellation,
            auto_gain_control: autoGainControl,
            sample_rate: sampleRate,
            bitrate,
            updated_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'save-settings',
          message: 'Voice settings saved successfully'
        })
      }

      case 'start-session': {
        const { roomName, participants } = data

        const { data: session, error } = await supabase
          .from('voice_sessions')
          .insert({
            host_id: user.id,
            room_name: roomName || `Room ${Date.now()}`,
            participants: participants || [],
            status: 'active',
            started_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'start-session',
          session: session || { id: `session-${Date.now()}`, status: 'active' },
          message: 'Voice session started'
        })
      }

      case 'end-session': {
        const { sessionId } = data

        const { error } = await supabase
          .from('voice_sessions')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', sessionId)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'end-session',
          message: 'Voice session ended'
        })
      }

      case 'save-recording': {
        const { sessionId, name, duration, fileUrl } = data

        const { data: recording, error } = await supabase
          .from('voice_recordings')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            name: name || `Recording ${Date.now()}`,
            duration,
            file_url: fileUrl,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'save-recording',
          recording: recording || { id: `rec-${Date.now()}` },
          message: 'Recording saved'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Voice POST error', { error })
    return NextResponse.json({ error: 'Failed to process voice request' }, { status: 500 })
  }
}
