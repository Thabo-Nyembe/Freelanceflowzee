/**
 * User Settings API Routes
 *
 * REST endpoints for User Settings Management:
 * GET - Profile, notification settings, security settings, appearance settings, all settings
 * POST - Create profile, notification settings, security settings, appearance settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('user-settings')
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
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  addSkill,
  removeSkill,
  getNotificationSettings,
  createNotificationSettings,
  updateNotificationSettings,
  toggleNotification,
  getSecuritySettings,
  createSecuritySettings,
  updateSecuritySettings,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  updatePasswordChanged,
  addActiveSession,
  removeActiveSession,
  getAppearanceSettings,
  createAppearanceSettings,
  updateAppearanceSettings,
  updateTheme,
  updateAccentColor,
  toggleCompactMode,
  toggleAnimations,
  pinItem,
  unpinItem,
  getAllUserSettings,
  resetAllSettings
} from '@/lib/user-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    switch (type) {
      case 'profile': {
        const result = await getUserProfile(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'notifications': {
        const result = await getNotificationSettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'security': {
        const result = await getSecuritySettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'appearance': {
        const result = await getAppearanceSettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'all': {
        const result = await getAllUserSettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch User Settings data' },
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
      case 'create-profile': {
        const result = await createUserProfile(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-profile': {
        const result = await updateUserProfile(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'add-skill': {
        const result = await addSkill(user.id, payload.skill)
        return NextResponse.json({ data: result.data })
      }

      case 'remove-skill': {
        const result = await removeSkill(user.id, payload.skill)
        return NextResponse.json({ data: result.data })
      }

      case 'create-notification-settings': {
        const result = await createNotificationSettings(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-notification-settings': {
        const result = await updateNotificationSettings(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'toggle-notification': {
        const result = await toggleNotification(user.id, payload.notification_type, payload.enabled)
        return NextResponse.json({ data: result.data })
      }

      case 'create-security-settings': {
        const result = await createSecuritySettings(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-security-settings': {
        const result = await updateSecuritySettings(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'enable-2fa': {
        const result = await enableTwoFactorAuth(user.id, payload.method)
        return NextResponse.json({ data: result.data })
      }

      case 'disable-2fa': {
        const result = await disableTwoFactorAuth(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'update-password-changed': {
        const result = await updatePasswordChanged(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'add-session': {
        const result = await addActiveSession(user.id, payload.session)
        return NextResponse.json({ data: result.data })
      }

      case 'remove-session': {
        const result = await removeActiveSession(user.id, payload.session_id)
        return NextResponse.json({ data: result.data })
      }

      case 'create-appearance-settings': {
        const result = await createAppearanceSettings(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-appearance-settings': {
        const result = await updateAppearanceSettings(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'update-theme': {
        const result = await updateTheme(user.id, payload.theme)
        return NextResponse.json({ data: result.data })
      }

      case 'update-accent-color': {
        const result = await updateAccentColor(user.id, payload.accent_color)
        return NextResponse.json({ data: result.data })
      }

      case 'toggle-compact-mode': {
        const result = await toggleCompactMode(user.id, payload.enabled)
        return NextResponse.json({ data: result.data })
      }

      case 'toggle-animations': {
        const result = await toggleAnimations(user.id, payload.enabled)
        return NextResponse.json({ data: result.data })
      }

      case 'pin-item': {
        const result = await pinItem(user.id, payload.item_id)
        return NextResponse.json({ data: result.data })
      }

      case 'unpin-item': {
        const result = await unpinItem(user.id, payload.item_id)
        return NextResponse.json({ data: result.data })
      }

      case 'reset-all': {
        const result = await resetAllSettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process User Settings request' },
      { status: 500 }
    )
  }
}
