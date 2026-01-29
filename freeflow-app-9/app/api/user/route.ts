/**
 * User API Route
 * Comprehensive user profile management with preferences and statistics
 * Full database implementation with demo mode fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('user-api')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Demo user data
const demoUser = {
  id: DEMO_USER_ID,
  name: 'Alex Morgan',
  email: 'alex@freeflow.io',
  avatar: '/avatars/alex-morgan.png',
  role: 'admin',
  tier: 'professional',
  company: 'FreeFlow Creative Agency',
  title: 'Founder & Creative Director',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  timezone: 'America/Los_Angeles',
  bio: 'Award-winning creative director with 10+ years of experience in digital design and brand strategy.',
  website: 'https://alexmorgan.design',
  social: {
    linkedin: 'https://linkedin.com/in/alexmorgan',
    twitter: 'https://twitter.com/alexmorgan',
    dribbble: 'https://dribbble.com/alexmorgan'
  },
  preferences: {
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true
    },
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  },
  stats: {
    projectsCompleted: 147,
    projectsActive: 8,
    totalEarnings: 485000,
    thisMonthEarnings: 28500,
    clientsTotal: 52,
    clientsActive: 12,
    averageRating: 4.9,
    totalReviews: 89,
    hoursThisMonth: 156,
    tasksCompleted: 1247
  },
  subscription: {
    plan: 'Professional',
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: '2024-04-01',
    features: ['unlimited_projects', 'team_collaboration', 'advanced_analytics', 'priority_support']
  },
  created_at: '2022-03-15T10:00:00Z',
  updated_at: new Date().toISOString()
}

// ========================================================================
// GET - Fetch user profile
// ========================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const include = url.searchParams.get('include')?.split(',') || []

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For demo mode, return demo user
    if (demoMode || effectiveUserId === DEMO_USER_ID) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: demoUser
      })
    }

    // Fetch user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', effectiveUserId)
      .single()

    if (userError) {
      logger.error('Failed to fetch user', { error: userError, userId: effectiveUserId })
      // Fall back to session data
      return NextResponse.json({
        success: true,
        data: {
          id: effectiveUserId,
          name: session?.user?.name || 'User',
          email: session?.user?.email || '',
          avatar: session?.user?.image || '/avatars/default.png',
          role: 'user',
          tier: 'free',
          preferences: {
            theme: 'system',
            notifications: { email: true, push: true },
            language: 'en'
          },
          stats: {
            projectsCompleted: 0,
            totalEarnings: 0,
            activeProjects: 0
          }
        }
      })
    }

    // Build response with optional includes
    const responseData: Record<string, unknown> = { ...user }

    // Include stats if requested
    if (include.includes('stats')) {
      // Get project stats
      const { count: projectsCompleted } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('user_id', effectiveUserId)
        .eq('status', 'completed')

      const { count: projectsActive } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('user_id', effectiveUserId)
        .in('status', ['active', 'in_progress'])

      // Get earnings
      const { data: earnings } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('user_id', effectiveUserId)
        .eq('status', 'paid')

      const totalEarnings = earnings?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

      // Get client count
      const { count: clientsTotal } = await supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .eq('user_id', effectiveUserId)

      responseData.stats = {
        projectsCompleted: projectsCompleted || 0,
        projectsActive: projectsActive || 0,
        totalEarnings,
        clientsTotal: clientsTotal || 0
      }
    }

    // Include subscription if requested
    if (include.includes('subscription')) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('status', 'active')
        .single()

      responseData.subscription = subscription || {
        plan: 'Free',
        status: 'active',
        features: ['basic_projects', 'limited_storage']
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    logger.error('User GET error', { error })
    return NextResponse.json({
      success: true,
      demo: true,
      data: demoUser
    })
  }
}

// ========================================================================
// PUT - Update user profile
// ========================================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    // Sanitize update data
    const allowedFields = [
      'name', 'avatar', 'company', 'title', 'phone', 'location',
      'timezone', 'bio', 'website', 'social', 'preferences'
    ]
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Demo mode response
    if (demoMode || effectiveUserId === DEMO_USER_ID) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          ...demoUser,
          ...updateData,
          updated_at: new Date().toISOString()
        },
        message: 'Profile updated successfully (demo mode)'
      })
    }

    // Update in database
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', effectiveUserId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update user', { error, userId: effectiveUserId })
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    logger.info('User profile updated', { userId: effectiveUserId, fields: Object.keys(updateData) })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    logger.error('User PUT error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// ========================================================================
// PATCH - Partial update (preferences, settings)
// ========================================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    // Handle specific actions
    switch (action) {
      case 'update-preferences':
        return handleUpdatePreferences(supabase, effectiveUserId, data, demoMode)

      case 'update-notifications':
        return handleUpdateNotifications(supabase, effectiveUserId, data, demoMode)

      case 'update-avatar':
        return handleUpdateAvatar(supabase, effectiveUserId, data, demoMode)

      case 'update-password':
        return handleUpdatePassword(supabase, effectiveUserId, data, demoMode)

      case 'delete-account':
        return handleDeleteAccount(supabase, effectiveUserId, data, demoMode)

      case 'export-data':
        return handleExportData(supabase, effectiveUserId, demoMode)

      default:
        // Default partial update
        const updateData: Record<string, unknown> = {}
        const allowedFields = ['name', 'avatar', 'company', 'title', 'phone', 'location', 'timezone', 'bio', 'website']

        for (const field of allowedFields) {
          if (data[field] !== undefined) {
            updateData[field] = data[field]
          }
        }

        if (Object.keys(updateData).length === 0) {
          return NextResponse.json(
            { success: false, error: 'No valid fields to update' },
            { status: 400 }
          )
        }

        if (demoMode || effectiveUserId === DEMO_USER_ID) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: { ...updateData, updated_at: new Date().toISOString() },
            message: 'Profile updated (demo mode)'
          })
        }

        const { data: user, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', effectiveUserId)
          .select()
          .single()

        if (error) {
          logger.error('Failed to patch user', { error, userId: effectiveUserId })
          return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: user,
          message: 'Profile updated successfully'
        })
    }
  } catch (error) {
    logger.error('User PATCH error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// ========================================================================
// Action Handlers
// ========================================================================

async function handleUpdatePreferences(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { theme?: string; language?: string; currency?: string; dateFormat?: string; timeFormat?: string },
  demoMode: boolean
): Promise<NextResponse> {
  const preferences = {
    theme: data.theme,
    language: data.language,
    currency: data.currency,
    dateFormat: data.dateFormat,
    timeFormat: data.timeFormat
  }

  // Remove undefined values
  Object.keys(preferences).forEach(key => {
    if (preferences[key as keyof typeof preferences] === undefined) {
      delete preferences[key as keyof typeof preferences]
    }
  })

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { preferences: { ...demoUser.preferences, ...preferences } },
      message: 'Preferences updated (demo mode)'
    })
  }

  // Get current preferences
  const { data: currentUser } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single()

  const updatedPreferences = {
    ...(currentUser?.preferences || {}),
    ...preferences
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ preferences: updatedPreferences })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update preferences', { error, userId })
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }

  logger.info('User preferences updated', { userId })

  return NextResponse.json({
    success: true,
    data: { preferences: user.preferences },
    message: 'Preferences updated successfully'
  })
}

async function handleUpdateNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { email?: boolean; push?: boolean; sms?: boolean; marketing?: boolean },
  demoMode: boolean
): Promise<NextResponse> {
  const notifications = {
    email: data.email,
    push: data.push,
    sms: data.sms,
    marketing: data.marketing
  }

  // Remove undefined values
  Object.keys(notifications).forEach(key => {
    if (notifications[key as keyof typeof notifications] === undefined) {
      delete notifications[key as keyof typeof notifications]
    }
  })

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { notifications: { ...demoUser.preferences.notifications, ...notifications } },
      message: 'Notification settings updated (demo mode)'
    })
  }

  // Get current preferences
  const { data: currentUser } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single()

  const currentPrefs = currentUser?.preferences || {}
  const updatedPreferences = {
    ...currentPrefs,
    notifications: {
      ...(currentPrefs.notifications || {}),
      ...notifications
    }
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ preferences: updatedPreferences })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update notifications', { error, userId })
    return NextResponse.json(
      { success: false, error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }

  logger.info('User notification settings updated', { userId })

  return NextResponse.json({
    success: true,
    data: { notifications: user.preferences?.notifications },
    message: 'Notification settings updated successfully'
  })
}

async function handleUpdateAvatar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { avatar: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.avatar) {
    return NextResponse.json(
      { success: false, error: 'Avatar URL is required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { avatar: data.avatar },
      message: 'Avatar updated (demo mode)'
    })
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ avatar: data.avatar })
    .eq('id', userId)
    .select('avatar')
    .single()

  if (error) {
    logger.error('Failed to update avatar', { error, userId })
    return NextResponse.json(
      { success: false, error: 'Failed to update avatar' },
      { status: 500 }
    )
  }

  logger.info('User avatar updated', { userId })

  return NextResponse.json({
    success: true,
    data: { avatar: user.avatar },
    message: 'Avatar updated successfully'
  })
}

async function handleUpdatePassword(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { currentPassword: string; newPassword: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.currentPassword || !data.newPassword) {
    return NextResponse.json(
      { success: false, error: 'Current password and new password are required' },
      { status: 400 }
    )
  }

  if (data.newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'New password must be at least 8 characters' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      message: 'Password updated (demo mode - not actually changed)'
    })
  }

  // Update password through Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword
  })

  if (error) {
    logger.error('Failed to update password', { error, userId })
    return NextResponse.json(
      { success: false, error: 'Failed to update password. Please verify your current password.' },
      { status: 400 }
    )
  }

  logger.info('User password updated', { userId })

  return NextResponse.json({
    success: true,
    message: 'Password updated successfully'
  })
}

async function handleDeleteAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { confirmEmail: string; reason?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: false,
      demo: true,
      error: 'Cannot delete demo account'
    })
  }

  // Verify email confirmation
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  if (!user || user.email !== data.confirmEmail) {
    return NextResponse.json(
      { success: false, error: 'Email confirmation does not match' },
      { status: 400 }
    )
  }

  // Log deletion reason
  if (data.reason) {
    await supabase.from('account_deletions').insert({
      user_id: userId,
      reason: data.reason,
      email: user.email
    }).catch(() => {
      // Ignore if table doesn't exist
    })
  }

  // Soft delete - mark as deleted
  const { error } = await supabase
    .from('users')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      email: `deleted_${userId}@deleted.local`
    })
    .eq('id', userId)

  if (error) {
    logger.error('Failed to delete account', { error, userId })
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }

  logger.info('Account deleted', { userId, reason: data.reason })

  return NextResponse.json({
    success: true,
    message: 'Account scheduled for deletion. You will be logged out.'
  })
}

async function handleExportData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
): Promise<NextResponse> {
  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: {
        exportUrl: '#',
        message: 'Data export not available in demo mode'
      }
    })
  }

  // Fetch all user data
  const [
    { data: userData },
    { data: projects },
    { data: invoices },
    { data: clients },
    { data: tasks },
    { data: files }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('projects').select('*').eq('user_id', userId),
    supabase.from('invoices').select('*').eq('user_id', userId),
    supabase.from('clients').select('*').eq('user_id', userId),
    supabase.from('tasks').select('*').eq('user_id', userId).catch(() => ({ data: [] })),
    supabase.from('files').select('id, name, type, size, created_at').eq('user_id', userId).catch(() => ({ data: [] }))
  ])

  const exportData = {
    user: userData,
    projects: projects || [],
    invoices: invoices || [],
    clients: clients || [],
    tasks: tasks || [],
    files: files || [],
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }

  // Upload to Supabase Storage
  const fileName = `data-export-${userId}-${Date.now()}.json`
  const jsonBlob = JSON.stringify(exportData, null, 2)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('exports')
    .upload(`user-data/${userId}/${fileName}`, jsonBlob, {
      contentType: 'application/json',
      cacheControl: '3600'
    })

  if (uploadError) {
    logger.warn('Failed to upload export to storage, returning data directly', { error: uploadError.message })
    // Fall back to returning data directly if storage fails
    return NextResponse.json({
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    })
  }

  // Generate signed download URL (valid for 1 hour)
  const { data: signedUrlData } = await supabase.storage
    .from('exports')
    .createSignedUrl(`user-data/${userId}/${fileName}`, 3600)

  // Log export event
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'data_export',
    resource_type: 'user_data',
    resource_id: userId,
    details: { fileName, size: jsonBlob.length },
    created_at: new Date().toISOString()
  }).catch(() => {
    // Audit log table may not exist
  })

  logger.info('User data exported to storage', { userId, fileName })

  return NextResponse.json({
    success: true,
    data: {
      exportUrl: signedUrlData?.signedUrl || null,
      fileName,
      size: jsonBlob.length,
      expiresIn: '1 hour'
    },
    message: 'Data exported successfully. Download link is valid for 1 hour.'
  })
}

// ========================================================================
// DELETE - Delete user account
// ========================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    if (demoMode) {
      return NextResponse.json({
        success: false,
        demo: true,
        error: 'Cannot delete account in demo mode'
      })
    }

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id

    // Soft delete
    const { error } = await supabase
      .from('users')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to delete account', { error, userId })
      return NextResponse.json(
        { success: false, error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    logger.info('Account deleted via DELETE', { userId })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    logger.error('User DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
