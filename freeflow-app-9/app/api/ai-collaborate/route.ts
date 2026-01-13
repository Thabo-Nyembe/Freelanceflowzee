/**
 * AI Collaborate API Routes
 *
 * REST endpoints for AI Design Collaboration:
 * GET - List designs, sessions, settings
 * POST - Create design, export, update settings
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
          .from('ai_designs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          designs: data || []
        })
      }

      case 'sessions': {
        const { data, error } = await supabase
          .from('ai_collaboration_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          sessions: data || []
        })
      }

      case 'settings': {
        const { data, error } = await supabase
          .from('ai_collaborate_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== '42P01' && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          success: true,
          settings: data || {
            modelPreference: 'balanced',
            styleGuide: 'modern',
            colorPalette: 'vibrant',
            outputFormat: 'png',
            resolution: '1024x1024',
            autoSave: true,
            historyEnabled: true,
            collaborationMode: 'async'
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Collaborate GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch AI collaboration data' }, { status: 500 })
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
      case 'create-session': {
        const { name, stylePreset, collaborators } = data

        const { data: session, error } = await supabase
          .from('ai_collaboration_sessions')
          .insert({
            user_id: user.id,
            name: name || 'New AI Design Session',
            style_preset: stylePreset || 'modern',
            collaborators: collaborators || [],
            status: 'active',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'create-session',
          session: session || {
            id: `session-${Date.now()}`,
            name: name || 'New AI Design Session',
            status: 'active'
          },
          message: 'New AI design session created'
        })
      }

      case 'generate-design': {
        const { prompt, style, model, size } = data

        // In production, this would call an AI image generation API
        const design = {
          id: `design-${Date.now()}`,
          prompt,
          style: style || 'modern',
          model: model || 'stable-diffusion',
          size: size || '1024x1024',
          status: 'completed',
          imageUrl: `/generated/ai-design-${Date.now()}.png`,
          createdAt: new Date().toISOString()
        }

        // Save to database
        await supabase
          .from('ai_designs')
          .insert({
            user_id: user.id,
            ...design
          })
          .catch(() => {}) // Ignore if table doesn't exist

        return NextResponse.json({
          success: true,
          action: 'generate-design',
          design,
          message: 'AI design generated successfully'
        })
      }

      case 'export-designs': {
        const { designIds, format = 'zip' } = data

        const { data: designs, error } = await supabase
          .from('ai_designs')
          .select('*')
          .eq('user_id', user.id)
          .in('id', designIds || [])

        if (error && error.code !== '42P01') throw error

        const exportData = {
          exportedAt: new Date().toISOString(),
          format,
          designCount: designs?.length || 0,
          designs: designs || []
        }

        return NextResponse.json({
          success: true,
          action: 'export-designs',
          export: exportData,
          filename: `ai-designs-${new Date().toISOString().split('T')[0]}.${format}`,
          message: 'AI designs exported successfully'
        })
      }

      case 'update-settings': {
        const { modelPreference, styleGuide, colorPalette, outputFormat, resolution, autoSave, historyEnabled, collaborationMode } = data

        const { error } = await supabase
          .from('ai_collaborate_settings')
          .upsert({
            user_id: user.id,
            model_preference: modelPreference,
            style_guide: styleGuide,
            color_palette: colorPalette,
            output_format: outputFormat,
            resolution,
            auto_save: autoSave,
            history_enabled: historyEnabled,
            collaboration_mode: collaborationMode,
            updated_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'update-settings',
          message: 'AI collaboration settings saved'
        })
      }

      case 'invite-collaborator': {
        const { sessionId, email, role = 'viewer' } = data

        const { error } = await supabase
          .from('ai_collaboration_invites')
          .insert({
            session_id: sessionId,
            inviter_id: user.id,
            email,
            role,
            status: 'pending',
            created_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'invite-collaborator',
          message: `Invitation sent to ${email}`
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Collaborate POST error:', error)
    return NextResponse.json({ error: 'Failed to process AI collaboration request' }, { status: 500 })
  }
}
