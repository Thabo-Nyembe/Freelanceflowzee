import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'tracks': {
        const { data, error } = await supabase
          .from('music_tracks')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const trackId = searchParams.get('trackId')

        if (trackId) {
          const { data, error } = await supabase
            .from('music_tracks')
            .select('*')
            .eq('id', trackId)
            .single()

          if (error) throw error

          if (format === 'mp3') {
            // Return audio file URL for download
            return NextResponse.json({
              downloadUrl: data?.file_url,
              name: data?.name
            })
          }
          return NextResponse.json({ data })
        }

        // Export all tracks metadata
        const { data, error } = await supabase
          .from('music_tracks')
          .select('*')

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('music_studio_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          data: data || {
            defaultGenre: 'electronic',
            defaultTempo: 120,
            outputFormat: 'mp3',
            quality: 'high'
          }
        })
      }

      default: {
        const { data, error } = await supabase
          .from('music_tracks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error: any) {
    console.error('Music API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch music data' },
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
      case 'create': {
        const { name, genre, tempo, duration, prompt } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('music_tracks')
          .insert({
            user_id: user?.id,
            name: name || 'Untitled Track',
            genre,
            tempo,
            duration,
            prompt,
            status: 'generating',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'update_settings': {
        const { settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('music_studio_settings')
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

      case 'delete': {
        const { trackId } = body

        const { error } = await supabase
          .from('music_tracks')
          .delete()
          .eq('id', trackId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Music API error:', error)
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
