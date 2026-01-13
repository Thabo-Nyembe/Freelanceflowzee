import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'history': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('translations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'sessions': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('translation_sessions')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('translation_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          data: data || {
            defaultSourceLang: 'en',
            defaultTargetLang: 'es',
            autoDetect: true,
            saveHistory: true
          }
        })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('translations')
          .select('*')
          .eq('user_id', user?.id)

        if (error) throw error

        if (format === 'csv') {
          const csvRows = ['Source,Target,Source Language,Target Language,Created At']
          data?.forEach(t => {
            csvRows.push(`"${t.source_text}","${t.translated_text}","${t.source_lang}","${t.target_lang}","${t.created_at}"`)
          })
          return new NextResponse(csvRows.join('\n'), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="translations-${Date.now()}.csv"`
            }
          })
        }

        return NextResponse.json({ data })
      }

      default: {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('translations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error: any) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch translation data' },
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
        const { name, sourceText, sourceLang, targetLang } = body
        const { data: { user } } = await supabase.auth.getUser()

        // In production: call translation API (DeepL, Google Translate, etc.)
        const translatedText = `[Translated] ${sourceText}` // Placeholder

        const { data, error } = await supabase
          .from('translations')
          .insert({
            user_id: user?.id,
            name,
            source_text: sourceText,
            translated_text: translatedText,
            source_lang: sourceLang || 'en',
            target_lang: targetLang || 'es',
            status: 'completed'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'create_session': {
        const { name, participants, sourceLang, targetLang } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('translation_sessions')
          .insert({
            user_id: user?.id,
            name,
            participants: participants?.split(',').map((p: string) => p.trim()) || [],
            source_lang: sourceLang || 'en',
            target_lang: targetLang || 'es',
            status: 'active'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'pause_session': {
        const { sessionId } = body

        const { data, error } = await supabase
          .from('translation_sessions')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export_session': {
        const { sessionId } = body

        const { data: session, error } = await supabase
          .from('translation_sessions')
          .select('*, translation_messages(*)')
          .eq('id', sessionId)
          .single()

        if (error) throw error
        return NextResponse.json({ data: session })
      }

      case 'save_translation': {
        const { translationId, name, folder } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('saved_translations')
          .insert({
            user_id: user?.id,
            translation_id: translationId,
            name,
            folder: folder || 'default'
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
          .from('translation_settings')
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

      case 'translate': {
        const { text, sourceLang, targetLang } = body

        // In production: call real translation API
        // This is a placeholder response
        const translatedText = `[${targetLang}] ${text}`

        return NextResponse.json({
          data: {
            source: text,
            translated: translatedText,
            sourceLang,
            targetLang
          }
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
