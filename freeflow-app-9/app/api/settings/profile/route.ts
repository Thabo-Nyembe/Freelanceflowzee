import { NextRequest, NextResponse } from 'next/server'

// User Settings & Profile Management API
// Supports: Profile, Notifications, Security, Appearance, Preferences

interface SettingsRequest {
  category: 'profile' | 'notifications' | 'security' | 'appearance' | 'preferences' | 'export' | 'import'
  action: 'get' | 'update' | 'reset'
  data?: any
}

// Get settings by category
async function handleGetSettings(category: string): Promise<NextResponse> {
  try {
    const settings: Record<string, any> = {
      profile: {
        firstName: 'Alexandra',
        lastName: 'Quantum',
        email: 'alexandra.quantum@kazi.app',
        phone: '+1 (555) 789-0123',
        bio: 'Quantum Creative Director revolutionizing visual storytelling',
        location: 'Silicon Valley, CA',
        website: 'https://alexandraquantum.kazi.app',
        company: 'KAZI Quantum Studios',
        position: 'Chief Creative Architect',
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
        twoFactorAuth: true,
        loginAlerts: true,
        sessionTimeout: '24h',
        passwordRequired: true,
        biometricAuth: false,
        trustedDevices: 3,
        lastPasswordChange: '2024-12-15',
        activeSessionsCount: 2,
        loginHistory: [
          { device: 'MacBook Pro', location: 'San Francisco, CA', time: '2025-01-10 14:32', success: true },
          { device: 'iPhone 15 Pro', location: 'San Francisco, CA', time: '2025-01-10 09:15', success: true },
          { device: 'Unknown Device', location: 'Tokyo, JP', time: '2025-01-09 03:22', success: false }
        ]
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
      message: `${category} settings retrieved successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get settings'
    }, { status: 500 })
  }
}

// Update settings
async function handleUpdateSettings(category: string, data: any): Promise<NextResponse> {
  try {
    // In production: Validate and save to database
    // await db.userSettings.update({ userId, category, data })

    // Validate specific fields based on category
    if (category === 'profile' && data.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email format'
        }, { status: 400 })
      }
    }

    if (category === 'security' && data.twoFactorAuth) {
      // Generate 2FA setup data
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/KAZI:user@example.com?secret=BASE32SECRET`
      return NextResponse.json({
        success: true,
        category,
        action: 'update',
        data,
        twoFactorSetup: {
          qrCode,
          secret: 'BASE32SECRET',
          backupCodes: [
            'ABCD-EFGH-IJKL',
            'MNOP-QRST-UVWX',
            'YZAB-CDEF-GHIJ'
          ]
        },
        message: `${category} settings updated successfully`
      })
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

// Reset settings to defaults
async function handleResetSettings(category: string): Promise<NextResponse> {
  try {
    const defaults: Record<string, any> = {
      profile: {},
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        projectUpdates: true,
        clientMessages: true,
        paymentAlerts: true
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
        compactMode: false,
        animations: true
      },
      preferences: {
        autoSave: true,
        aiAssistance: true,
        smartSuggestions: true,
        keyboardShortcuts: true
      }
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
async function handleExportSettings(): Promise<NextResponse> {
  try {
    const allSettings = {
      profile: await handleGetSettings('profile').then(r => r.json()),
      notifications: await handleGetSettings('notifications').then(r => r.json()),
      security: await handleGetSettings('security').then(r => r.json()),
      appearance: await handleGetSettings('appearance').then(r => r.json()),
      preferences: await handleGetSettings('preferences').then(r => r.json()),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
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
async function handleImportSettings(data: any): Promise<NextResponse> {
  try {
    // Validate imported data
    if (!data || typeof data !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid settings data'
      }, { status: 400 })
    }

    // In production: Validate and save each category
    const imported = {
      profile: data.profile?.data || {},
      notifications: data.notifications?.data || {},
      security: data.security?.data || {},
      appearance: data.appearance?.data || {},
      preferences: data.preferences?.data || {}
    }

    return NextResponse.json({
      success: true,
      action: 'import',
      imported,
      categoriesImported: Object.keys(imported).length,
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
    const body: SettingsRequest = await request.json()

    if (body.category === 'export') {
      return handleExportSettings()
    }

    if (body.category === 'import') {
      return handleImportSettings(body.data)
    }

    switch (body.action) {
      case 'get':
        return handleGetSettings(body.category)

      case 'update':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Update data required'
          }, { status: 400 })
        }
        return handleUpdateSettings(body.category, body.data)

      case 'reset':
        return handleResetSettings(body.category)

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
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'profile'
    const action = searchParams.get('action')

    if (action === 'export') {
      return handleExportSettings()
    }

    return handleGetSettings(category)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch settings'
    }, { status: 500 })
  }
}
