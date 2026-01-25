/**
 * Appearance Settings API - Single Resource Routes
 *
 * GET - Get single customization, preset, CSS snippet, color scheme, font preference
 * PUT - Update customization, preset, CSS snippet, color scheme, font preference
 * DELETE - Delete customization, preset, CSS snippet, color scheme, font preference
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('appearance-settings')
import {
  getThemeCustomization,
  updateThemeCustomization,
  activateThemeCustomization,
  deleteThemeCustomization,
  getThemePreset,
  updateThemePreset,
  deleteThemePreset,
  getCustomCSSSnippet,
  updateCustomCSSSnippet,
  toggleCustomCSSSnippet,
  reorderCustomCSSSnippets,
  deleteCustomCSSSnippet,
  getColorScheme,
  updateColorScheme,
  activateColorScheme,
  toggleColorSchemeFavorite,
  deleteColorScheme,
  getFontPreference,
  updateFontPreference,
  activateFontPreference,
  deleteFontPreference
} from '@/lib/appearance-settings-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'customization'

    switch (type) {
      case 'customization': {
        const result = await getThemeCustomization(id)
        return NextResponse.json({ data: result.data })
      }

      case 'preset': {
        const result = await getThemePreset(id)
        return NextResponse.json({ data: result.data })
      }

      case 'css-snippet': {
        const result = await getCustomCSSSnippet(id)
        return NextResponse.json({ data: result.data })
      }

      case 'color-scheme': {
        const result = await getColorScheme(id)
        return NextResponse.json({ data: result.data })
      }

      case 'font-preference': {
        const result = await getFontPreference(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Appearance Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'customization': {
        if (action === 'activate') {
          const result = await activateThemeCustomization(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateThemeCustomization(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'preset': {
        const result = await updateThemePreset(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'css-snippet': {
        if (action === 'toggle') {
          const result = await toggleCustomCSSSnippet(id, updates.enabled)
          return NextResponse.json({ data: result.data })
        } else if (action === 'reorder') {
          const result = await reorderCustomCSSSnippets(user.id, updates.snippet_ids)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateCustomCSSSnippet(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'color-scheme': {
        if (action === 'activate') {
          const result = await activateColorScheme(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-favorite') {
          const result = await toggleColorSchemeFavorite(id, updates.favorite)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateColorScheme(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'font-preference': {
        if (action === 'activate') {
          const result = await activateFontPreference(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateFontPreference(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Appearance Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'customization'

    switch (type) {
      case 'customization': {
        await deleteThemeCustomization(id)
        return NextResponse.json({ success: true })
      }

      case 'preset': {
        await deleteThemePreset(id)
        return NextResponse.json({ success: true })
      }

      case 'css-snippet': {
        await deleteCustomCSSSnippet(id)
        return NextResponse.json({ success: true })
      }

      case 'color-scheme': {
        await deleteColorScheme(id)
        return NextResponse.json({ success: true })
      }

      case 'font-preference': {
        await deleteFontPreference(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Appearance Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
