/**
 * Appearance Settings API Routes
 *
 * REST endpoints for Appearance Settings:
 * GET - Theme customizations, presets, CSS snippets, color schemes, font preferences, history, stats
 * POST - Create customizations, presets, CSS snippets, color schemes, fonts, history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('appearance-settings')
import {

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
  getThemeCustomizations,
  getActiveThemeCustomization,
  createThemeCustomization,
  getThemePresets,
  getUserThemePresets,
  createThemePreset,
  getPopularThemePresets,
  getCustomCSSSnippets,
  createCustomCSSSnippet,
  getColorSchemes,
  getActiveColorScheme,
  createColorScheme,
  getFontPreferences,
  getActiveFontPreference,
  createFontPreference,
  getCustomizationHistory,
  createCustomizationHistory,
  getRecentCustomizations,
  getAppearanceStats,
  getAppearanceDashboard
} from '@/lib/appearance-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'customizations'
    const customizationType = searchParams.get('customization_type') as string | null
    const presetCategory = searchParams.get('preset_category') as string | null
    const schemeType = searchParams.get('scheme_type') as string | null
    const isActive = searchParams.get('is_active')
    const isEnabled = searchParams.get('is_enabled')
    const isPublic = searchParams.get('is_public')
    const isSystem = searchParams.get('is_system')
    const isFavorite = searchParams.get('is_favorite')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'customizations': {
        const filters: any = {}
        if (customizationType) filters.customization_type = customizationType
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getThemeCustomizations(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-customization': {
        const result = await getActiveThemeCustomization(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'presets': {
        const filters: any = {}
        if (presetCategory) filters.preset_category = presetCategory
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        if (isSystem !== null) filters.is_system = isSystem === 'true'
        const result = await getThemePresets(filters)
        return NextResponse.json({ data: result.data })
      }

      case 'user-presets': {
        const result = await getUserThemePresets(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'popular-presets': {
        const result = await getPopularThemePresets(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'css-snippets': {
        const filters: any = {}
        if (isEnabled !== null) filters.is_enabled = isEnabled === 'true'
        const result = await getCustomCSSSnippets(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'color-schemes': {
        const filters: any = {}
        if (schemeType) filters.scheme_type = schemeType
        if (isActive !== null) filters.is_active = isActive === 'true'
        if (isFavorite !== null) filters.is_favorite = isFavorite === 'true'
        const result = await getColorSchemes(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-color-scheme': {
        const result = await getActiveColorScheme(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'font-preferences': {
        const filters: any = {}
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getFontPreferences(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-font-preference': {
        const result = await getActiveFontPreference(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'history': {
        const filters: any = { limit }
        if (customizationType) filters.customization_type = customizationType
        const result = await getCustomizationHistory(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'recent-customizations': {
        const result = await getRecentCustomizations(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getAppearanceStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await getAppearanceDashboard(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Appearance Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Appearance Settings data' },
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
    const { action, ...payload } = body

    switch (action) {
      case 'create-customization': {
        const result = await createThemeCustomization(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-preset': {
        const result = await createThemePreset(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-css-snippet': {
        const result = await createCustomCSSSnippet(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-color-scheme': {
        const result = await createColorScheme(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-font-preference': {
        const result = await createFontPreference(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-history': {
        const result = await createCustomizationHistory(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Appearance Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Appearance Settings request' },
      { status: 500 }
    )
  }
}
