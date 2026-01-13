import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          data: data || {
            animationsEnabled: true,
            animationSpeed: 'normal',
            tooltipDelay: 200,
            autoSave: true,
            theme: 'system'
          }
        })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const includeAnimations = searchParams.get('includeAnimations') === 'true'
        const includeTooltips = searchParams.get('includeTooltips') === 'true'
        const includeButtons = searchParams.get('includeButtons') === 'true'

        const exportData = {
          exportedAt: new Date().toISOString(),
          format,
          features: {
            animations: includeAnimations ? { enabled: true, types: ['fade', 'slide', 'scale', 'rotate', 'bounce', 'shake'] } : null,
            tooltips: includeTooltips ? { enabled: true, positions: ['top', 'bottom', 'left', 'right'] } : null,
            buttons: includeButtons ? { enabled: true, styles: ['magnetic', 'ripple', 'neon', 'slide-fill', 'glassmorphism'] } : null
          }
        }

        if (format === 'csv') {
          const csvRows = ['Feature,Enabled,Types']
          if (includeAnimations) csvRows.push('Animations,true,"fade,slide,scale,rotate"')
          if (includeTooltips) csvRows.push('Tooltips,true,"top,bottom,left,right"')
          if (includeButtons) csvRows.push('Buttons,true,"magnetic,ripple,neon"')

          return new NextResponse(csvRows.join('\n'), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="micro-features-${Date.now()}.csv"`
            }
          })
        }

        return NextResponse.json({ data: exportData })
      }

      case 'configurations': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_configurations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      default: {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_items')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error: any) {
    console.error('Micro Features API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch micro features data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create_item': {
        const { name, type, description, priority } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_items')
          .insert({
            user_id: user?.id,
            name,
            type: type || 'component',
            description,
            priority: priority || 'medium',
            status: 'active'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save_settings': {
        const { settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_settings')
          .upsert({
            user_id: user?.id,
            ...settings,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save_configuration': {
        const { name, description, globalAnimations, reducedMotion, hapticFeedback } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_configurations')
          .insert({
            user_id: user?.id,
            name,
            description,
            config: {
              globalAnimations,
              reducedMotion,
              hapticFeedback
            }
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save_feature_toggles': {
        const { toggles } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('micro_feature_settings')
          .upsert({
            user_id: user?.id,
            feature_toggles: toggles,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'run_demo': {
        const { demoType, config } = body

        // Log demo execution for analytics
        return NextResponse.json({
          success: true,
          demoType,
          config,
          executedAt: new Date().toISOString()
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Micro Features API error:', error)
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
