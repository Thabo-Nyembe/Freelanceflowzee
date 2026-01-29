import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// User Settings & Profile Management API
// Supports: Profile, Notifications, Security, Appearance, Preferences

interface SettingsRequest {
  category: 'profile' | 'notifications' | 'security' | 'appearance' | 'preferences' | 'export' | 'import'
  action: 'get' | 'update' | 'reset'
  data?: any
}

// Get settings by category with real database queries
async function handleGetSettings(category: string, userId?: string, supabase?: any): Promise<NextResponse> {
  try {
    // If we have a user and supabase client, fetch from database
    if (userId && supabase) {
      switch (category) {
        case 'profile': {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (profile) {
            return NextResponse.json({
              success: true,
              category,
              action: 'get',
              data: {
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || '',
                company: profile.company || '',
                position: profile.position || profile.title || '',
                avatar: profile.avatar_url || '',
                timezone: profile.timezone || 'UTC',
                language: profile.language || 'en'
              },
              message: 'Profile settings retrieved successfully'
            })
          }
          break
        }
        case 'notifications': {
          const { data: notifSettings } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (notifSettings) {
            return NextResponse.json({
              success: true,
              category,
              action: 'get',
              data: {
                emailNotifications: notifSettings.email_notifications ?? true,
                pushNotifications: notifSettings.push_notifications ?? true,
                smsNotifications: notifSettings.sms_notifications ?? false,
                projectUpdates: notifSettings.project_updates ?? true,
                clientMessages: notifSettings.client_messages ?? true,
                paymentAlerts: notifSettings.payment_alerts ?? true,
                marketingEmails: notifSettings.marketing_emails ?? false,
                weeklyDigest: notifSettings.weekly_digest ?? true,
                desktopNotifications: notifSettings.desktop_notifications ?? true,
                mobileNotifications: notifSettings.mobile_notifications ?? true,
                soundEnabled: notifSettings.sound_enabled ?? true,
                vibrationEnabled: notifSettings.vibration_enabled ?? false
              },
              message: 'Notification settings retrieved successfully'
            })
          }
          break
        }
        case 'security': {
          const { data: securitySettings } = await supabase
            .from('security_settings')
            .select('*')
            .eq('user_id', userId)
            .single()

          // Get active sessions count
          const { count: sessionsCount } = await supabase
            .from('user_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)

          // Get login history
          const { data: loginHistory } = await supabase
            .from('security_events')
            .select('*')
            .eq('user_id', userId)
            .in('event_type', ['login_success', 'login_failure'])
            .order('timestamp', { ascending: false })
            .limit(5)

          return NextResponse.json({
            success: true,
            category,
            action: 'get',
            data: {
              twoFactorAuth: securitySettings?.two_factor_auth ?? false,
              loginAlerts: securitySettings?.login_alerts ?? true,
              sessionTimeout: securitySettings?.session_timeout || '24h',
              passwordRequired: true,
              biometricAuth: securitySettings?.biometric_auth ?? false,
              trustedDevices: securitySettings?.trusted_devices_count ?? 0,
              lastPasswordChange: securitySettings?.password_last_changed || null,
              activeSessionsCount: sessionsCount || 0,
              loginHistory: (loginHistory || []).map((event: any) => ({
                device: event.user_agent || 'Unknown Device',
                location: event.location?.city ? `${event.location.city}, ${event.location.country_code}` : 'Unknown',
                time: event.timestamp,
                success: event.event_type === 'login_success'
              }))
            },
            message: 'Security settings retrieved successfully'
          })
        }
        case 'appearance': {
          const { data: appearanceSettings } = await supabase
            .from('appearance_settings')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (appearanceSettings) {
            return NextResponse.json({
              success: true,
              category,
              action: 'get',
              data: {
                theme: appearanceSettings.theme || 'system',
                language: appearanceSettings.language || 'en',
                timezone: appearanceSettings.timezone || 'UTC',
                dateFormat: appearanceSettings.date_format || 'MM/DD/YYYY',
                timeFormat: appearanceSettings.time_format || '12h',
                currency: appearanceSettings.currency || 'USD',
                compactMode: appearanceSettings.compact_mode ?? false,
                animations: appearanceSettings.animations ?? true,
                reducedMotion: appearanceSettings.reduced_motion ?? false,
                highContrast: appearanceSettings.high_contrast ?? false,
                fontSize: appearanceSettings.font_size || 'medium',
                colorScheme: appearanceSettings.color_scheme || 'professional'
              },
              message: 'Appearance settings retrieved successfully'
            })
          }
          break
        }
        case 'preferences': {
          const { data: prefSettings } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (prefSettings) {
            return NextResponse.json({
              success: true,
              category,
              action: 'get',
              data: {
                dashboardLayout: prefSettings.dashboard_layout || 'grid',
                defaultView: prefSettings.default_view || 'dashboard',
                itemsPerPage: prefSettings.items_per_page || 20,
                autoSave: prefSettings.auto_save ?? true,
                collaborationMode: prefSettings.collaboration_mode || 'real-time',
                aiAssistance: prefSettings.ai_assistance ?? true,
                smartSuggestions: prefSettings.smart_suggestions ?? true,
                keyboardShortcuts: prefSettings.keyboard_shortcuts ?? true,
                advancedFeatures: prefSettings.advanced_features ?? true,
                betaFeatures: prefSettings.beta_features ?? false,
                analyticsTracking: prefSettings.analytics_tracking ?? true,
                dataCollection: prefSettings.data_collection || 'minimal'
              },
              message: 'Preferences retrieved successfully'
            })
          }
          break
        }
      }
    }

    // Fallback to demo data for unauthenticated users
    const settings: Record<string, any> = {
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@kazi.app',
        phone: '+1 (555) 000-0000',
        bio: 'Welcome to KAZI - Your creative platform',
        location: 'San Francisco, CA',
        website: 'https://kazi.app',
        company: 'KAZI',
        position: 'Creative Professional',
        avatar: '',
        timezone: 'America/Los_Angeles',
        language: 'en'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        projectUpdates: true,
        clientMessages: true,
        paymentAlerts: true,
        marketingEmails: false,
        weeklyDigest: true,
        desktopNotifications: true,
        mobileNotifications: true,
        soundEnabled: true,
        vibrationEnabled: false
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: true,
        sessionTimeout: '24h',
        passwordRequired: true,
        biometricAuth: false,
        trustedDevices: 0,
        lastPasswordChange: null,
        activeSessionsCount: 1,
        loginHistory: []
      },
      appearance: {
        theme: 'system',
        language: 'en',
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        compactMode: false,
        animations: true,
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        colorScheme: 'professional'
      },
      preferences: {
        dashboardLayout: 'grid',
        defaultView: 'dashboard',
        itemsPerPage: 20,
        autoSave: true,
        collaborationMode: 'real-time',
        aiAssistance: true,
        smartSuggestions: true,
        keyboardShortcuts: true,
        advancedFeatures: true,
        betaFeatures: false,
        analyticsTracking: true,
        dataCollection: 'minimal'
      }
    }

    const categoryData = settings[category] || {}

    return NextResponse.json({
      success: true,
      category,
      action: 'get',
      data: categoryData,
      demo: !userId,
      message: `${category} settings retrieved successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get settings'
    }, { status: 500 })
  }
}

// Update settings with real database persistence
async function handleUpdateSettings(category: string, data: any, userId?: string, supabase?: any): Promise<NextResponse> {
  try {
    // Validate specific fields based on category
    if (category === 'profile' && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email format'
        }, { status: 400 })
      }
    }

    // Save to database if authenticated
    if (userId && supabase) {
      switch (category) {
        case 'profile': {
          const { error } = await supabase
            .from('profiles')
            .update({
              first_name: data.firstName,
              last_name: data.lastName,
              phone: data.phone,
              bio: data.bio,
              location: data.location,
              website: data.website,
              company: data.company,
              title: data.position,
              timezone: data.timezone,
              language: data.language,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) throw error
          break
        }
        case 'notifications': {
          const { error } = await supabase
            .from('notification_settings')
            .upsert({
              user_id: userId,
              email_notifications: data.emailNotifications,
              push_notifications: data.pushNotifications,
              sms_notifications: data.smsNotifications,
              project_updates: data.projectUpdates,
              client_messages: data.clientMessages,
              payment_alerts: data.paymentAlerts,
              marketing_emails: data.marketingEmails,
              weekly_digest: data.weeklyDigest,
              desktop_notifications: data.desktopNotifications,
              mobile_notifications: data.mobileNotifications,
              sound_enabled: data.soundEnabled,
              vibration_enabled: data.vibrationEnabled,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

          if (error) throw error
          break
        }
        case 'security': {
          if (data.twoFactorAuth !== undefined) {
            // Generate 2FA setup data
            const secretBytes = new Uint8Array(20)
            crypto.getRandomValues(secretBytes)
            const secret = Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16).toUpperCase()
            const qrCode = `otpauth://totp/KAZI:${userId}?secret=${secret}&issuer=KAZI`

            await supabase
              .from('security_settings')
              .upsert({
                user_id: userId,
                two_factor_auth: data.twoFactorAuth,
                login_alerts: data.loginAlerts,
                session_timeout: data.sessionTimeout,
                biometric_auth: data.biometricAuth,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' })

            if (data.twoFactorAuth) {
              return NextResponse.json({
                success: true,
                category,
                action: 'update',
                data,
                twoFactorSetup: {
                  qrCode,
                  secret,
                  backupCodes: [
                    generateBackupCode(),
                    generateBackupCode(),
                    generateBackupCode()
                  ]
                },
                message: `${category} settings updated successfully`
              })
            }
          }

          const { error } = await supabase
            .from('security_settings')
            .upsert({
              user_id: userId,
              login_alerts: data.loginAlerts,
              session_timeout: data.sessionTimeout,
              biometric_auth: data.biometricAuth,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

          if (error) throw error
          break
        }
        case 'appearance': {
          const { error } = await supabase
            .from('appearance_settings')
            .upsert({
              user_id: userId,
              theme: data.theme,
              language: data.language,
              timezone: data.timezone,
              date_format: data.dateFormat,
              time_format: data.timeFormat,
              currency: data.currency,
              compact_mode: data.compactMode,
              animations: data.animations,
              reduced_motion: data.reducedMotion,
              high_contrast: data.highContrast,
              font_size: data.fontSize,
              color_scheme: data.colorScheme,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

          if (error) throw error
          break
        }
        case 'preferences': {
          const { error } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: userId,
              dashboard_layout: data.dashboardLayout,
              default_view: data.defaultView,
              items_per_page: data.itemsPerPage,
              auto_save: data.autoSave,
              collaboration_mode: data.collaborationMode,
              ai_assistance: data.aiAssistance,
              smart_suggestions: data.smartSuggestions,
              keyboard_shortcuts: data.keyboardShortcuts,
              advanced_features: data.advancedFeatures,
              beta_features: data.betaFeatures,
              analytics_tracking: data.analyticsTracking,
              data_collection: data.dataCollection,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

          if (error) throw error
          break
        }
      }
    }

    return NextResponse.json({
      success: true,
      category,
      action: 'update',
      data,
      updatedAt: new Date().toISOString(),
      message: `${category} settings updated successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update settings'
    }, { status: 500 })
  }
}

// Generate backup code for 2FA
function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Reset settings to defaults
async function handleResetSettings(category: string, userId?: string, supabase?: any): Promise<NextResponse> {
  try {
    const defaults: Record<string, any> = {
      profile: {},
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        projectUpdates: true,
        clientMessages: true,
        paymentAlerts: true,
        marketingEmails: false,
        weeklyDigest: true,
        desktopNotifications: true,
        mobileNotifications: true,
        soundEnabled: true,
        vibrationEnabled: false
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: true,
        sessionTimeout: '24h',
        passwordRequired: true,
        biometricAuth: false
      },
      appearance: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        compactMode: false,
        animations: true,
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        colorScheme: 'professional'
      },
      preferences: {
        dashboardLayout: 'grid',
        defaultView: 'dashboard',
        itemsPerPage: 20,
        autoSave: true,
        collaborationMode: 'real-time',
        aiAssistance: true,
        smartSuggestions: true,
        keyboardShortcuts: true,
        advancedFeatures: true,
        betaFeatures: false,
        analyticsTracking: true,
        dataCollection: 'minimal'
      }
    }

    // Save defaults to database if authenticated
    if (userId && supabase && defaults[category] && Object.keys(defaults[category]).length > 0) {
      await handleUpdateSettings(category, defaults[category], userId, supabase)
    }

    return NextResponse.json({
      success: true,
      category,
      action: 'reset',
      data: defaults[category] || {},
      message: `${category} settings reset to defaults`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to reset settings'
    }, { status: 500 })
  }
}

// Export all settings
async function handleExportSettings(userId?: string, supabase?: any): Promise<NextResponse> {
  try {
    const categories = ['profile', 'notifications', 'security', 'appearance', 'preferences']
    const allSettings: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }

    for (const category of categories) {
      const response = await handleGetSettings(category, userId, supabase)
      const json = await response.json()
      allSettings[category] = json
    }

    const jsonData = JSON.stringify(allSettings, null, 2)

    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="kazi-settings-${Date.now()}.json"`
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to export settings'
    }, { status: 500 })
  }
}

// Import settings
async function handleImportSettings(data: any, userId?: string, supabase?: any): Promise<NextResponse> {
  try {
    // Validate imported data
    if (!data || typeof data !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid settings data'
      }, { status: 400 })
    }

    const categories = ['profile', 'notifications', 'security', 'appearance', 'preferences']
    const imported: Record<string, any> = {}
    let importedCount = 0

    for (const category of categories) {
      const categoryData = data[category]?.data || data[category]
      if (categoryData && Object.keys(categoryData).length > 0) {
        // Save each category to database
        await handleUpdateSettings(category, categoryData, userId, supabase)
        imported[category] = categoryData
        importedCount++
      }
    }

    return NextResponse.json({
      success: true,
      action: 'import',
      imported,
      categoriesImported: importedCount,
      message: 'Settings imported successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to import settings'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const body: SettingsRequest = await request.json()

    if (body.category === 'export') {
      return handleExportSettings(userId, supabase)
    }

    if (body.category === 'import') {
      return handleImportSettings(body.data, userId, supabase)
    }

    switch (body.action) {
      case 'get':
        return handleGetSettings(body.category, userId, supabase)

      case 'update':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Update data required'
          }, { status: 400 })
        }
        return handleUpdateSettings(body.category, body.data, userId, supabase)

      case 'reset':
        return handleResetSettings(body.category, userId, supabase)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'profile'
    const action = searchParams.get('action')

    if (action === 'export') {
      return handleExportSettings(userId, supabase)
    }

    return handleGetSettings(category, userId, supabase)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch settings'
    }, { status: 500 })
  }
}
