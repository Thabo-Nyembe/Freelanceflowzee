import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('music')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'tracks': {
        // PERFORMANCE FIX: Select only needed fields
        const { data, error } = await supabase
          .from('music_tracks')
          .select('id, title, artist, album, duration, genre, bpm, file_url, cover_url, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const trackId = searchParams.get('trackId')

        if (trackId) {
          // PERFORMANCE FIX: Select only needed fields for single track export
          const { data, error } = await supabase
            .from('music_tracks')
            .select('id, title, artist, album, duration, file_url, name, format, size')
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
        // PERFORMANCE FIX: Select only needed fields for batch export
        const { data, error } = await supabase
          .from('music_tracks')
          .select('id, title, artist, album, duration, genre, bpm, created_at')

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        // PERFORMANCE FIX: Select only needed settings fields
        const { data, error } = await supabase
          .from('music_studio_settings')
          .select('id, user_id, defaultGenre, defaultTempo, outputFormat, quality, autoSave, updated_at')
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
        // PERFORMANCE FIX: Select only needed fields for default track list
        const { data, error } = await supabase
          .from('music_tracks')
          .select('id, title, artist, album, duration, genre, cover_url, created_at')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('Music API error', { error })
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
  } catch (error) {
    logger.error('Music API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { trackId, ...updates } = body

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('music_tracks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', trackId)
      .select()
      .single()

    if (error) throw error

    logger.info('Music track updated', { trackId })
    return NextResponse.json({ data })

  } catch (error) {
    logger.error('Music PATCH error', { error })
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('trackId')

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('music_tracks')
      .delete()
      .eq('id', trackId)

    if (error) throw error

    logger.info('Music track deleted', { trackId })
    return NextResponse.json({ success: true, message: 'Track deleted successfully' })

  } catch (error) {
    logger.error('Music DELETE error', { error })
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 })
  }
}
