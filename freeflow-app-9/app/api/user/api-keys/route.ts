import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * User API Keys Management
 *
 * Allows users to store and manage their own API keys (BYOK - Bring Your Own Key)
 */

// Demo mode constants
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url);
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  );
}

// Demo API keys for unauthenticated demo users
function getDemoUserApiKeys(): UserAPIKey[] {
  return [
    {
      id: 'demo-byok-1',
      userId: DEMO_USER_ID,
      configId: 'openai',
      keyValue: 'sk-...xxxx',
      nickname: 'OpenAI Production',
      environment: 'production',
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      usageCount: 1542,
      estimatedCost: 45.23,
      status: 'active'
    },
    {
      id: 'demo-byok-2',
      userId: DEMO_USER_ID,
      configId: 'stripe',
      keyValue: 'sk_live_...xxxx',
      nickname: 'Stripe Live Key',
      environment: 'production',
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 7200000).toISOString(),
      usageCount: 892,
      estimatedCost: 0,
      status: 'active'
    },
    {
      id: 'demo-byok-3',
      userId: DEMO_USER_ID,
      configId: 'anthropic',
      keyValue: 'sk-ant-...xxxx',
      nickname: 'Claude API',
      environment: 'production',
      isActive: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 86400000).toISOString(),
      usageCount: 256,
      estimatedCost: 12.87,
      status: 'active'
    }
  ];
}

interface UserAPIKey {
  id: string
  userId: string
  configId: string
  keyValue: string // Encrypted in production
  nickname?: string
  environment: 'production' | 'test'
  isActive: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
  estimatedCost: number
  status: 'active' | 'inactive' | 'expired' | 'invalid'
}

// In-memory storage (replace with database in production)
const userAPIKeys: UserAPIKey[] = []

export async function GET(request: NextRequest) {
  try {
    // Check for demo mode
    const demoMode = isDemoMode(request);

    // In production, get userId from session/auth
    // For demo mode, use the demo user ID
    const userId = demoMode ? DEMO_USER_ID : 'user_123';

    logger.info('Fetching user API keys', { userId, demoMode })

    // Filter keys for this user
    let keys = userAPIKeys.filter(k => k.userId === userId)

    // If demo mode and no keys found, return demo data
    if (demoMode && keys.length === 0) {
      keys = getDemoUserApiKeys();
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: keys,
      count: keys.length
    })

  } catch (error: any) {
    logger.error('Failed to fetch API keys', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, keyId, configId, keyValue, nickname, environment = 'production', name, description, scopes, keyType, expiresAt } = body

    // In production, get userId from session/auth
    const userId = 'user_123'

    // Handle action-based requests (create, regenerate, revoke)
    if (action) {
      switch (action) {
        case 'create': {
          logger.info('Creating new API key', { userId, name, keyType, environment })

          // Generate a new API key
          const keyPrefix = environment === 'production' ? 'pk_live_' : 'pk_test_'
          const keyCode = Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 14)
          const fullKey = `${keyPrefix}${keyCode}`

          const newKey: UserAPIKey = {
            id: 'key_' + Math.random().toString(36).substr(2, 9),
            userId,
            configId: configId || 'custom',
            keyValue: fullKey,
            nickname: name || nickname,
            environment,
            isActive: true,
            createdAt: new Date().toISOString(),
            usageCount: 0,
            estimatedCost: 0,
            status: 'active'
          }

          userAPIKeys.push(newKey)

          logger.info('API key created successfully', { userId, keyId: newKey.id })

          return NextResponse.json({
            success: true,
            data: {
              ...newKey,
              fullKey // Only return full key on create - won't be shown again
            },
            message: 'API key created successfully'
          })
        }

        case 'regenerate': {
          if (!keyId) {
            return NextResponse.json({ error: 'keyId is required for regeneration' }, { status: 400 })
          }

          logger.info('Regenerating API key', { userId, keyId })

          const keyIndex = userAPIKeys.findIndex(k => k.id === keyId && k.userId === userId)

          if (keyIndex === -1) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 })
          }

          // Generate new key value
          const env = userAPIKeys[keyIndex].environment
          const newKeyPrefix = env === 'production' ? 'pk_live_' : 'pk_test_'
          const newKeyCode = Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 14)
          const newFullKey = `${newKeyPrefix}${newKeyCode}`

          userAPIKeys[keyIndex] = {
            ...userAPIKeys[keyIndex],
            keyValue: newFullKey,
            status: 'active'
          }

          logger.info('API key regenerated successfully', { userId, keyId })

          return NextResponse.json({
            success: true,
            data: {
              ...userAPIKeys[keyIndex],
              fullKey: newFullKey
            },
            message: 'API key regenerated successfully'
          })
        }

        case 'revoke': {
          if (!keyId) {
            return NextResponse.json({ error: 'keyId is required for revocation' }, { status: 400 })
          }

          logger.info('Revoking API key', { userId, keyId })

          const keyIndex = userAPIKeys.findIndex(k => k.id === keyId && k.userId === userId)

          if (keyIndex === -1) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 })
          }

          userAPIKeys[keyIndex] = {
            ...userAPIKeys[keyIndex],
            isActive: false,
            status: 'inactive'
          }

          logger.info('API key revoked successfully', { userId, keyId })

          return NextResponse.json({
            success: true,
            data: userAPIKeys[keyIndex],
            message: 'API key revoked successfully'
          })
        }

        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
      }
    }

    // Original flow: Adding external service API keys (BYOK)
    logger.info('Adding user API key', {
      userId,
      configId,
      environment,
      hasNickname: !!nickname
    })

    // Validate required fields
    if (!configId || !keyValue) {
      return NextResponse.json(
        { error: 'configId and keyValue are required' },
        { status: 400 }
      )
    }

    // Check if key already exists for this config
    const existingKey = userAPIKeys.find(
      k => k.userId === userId && k.configId === configId && k.isActive
    )

    if (existingKey) {
      return NextResponse.json(
        { error: 'You already have an active key for this service. Please delete it first.' },
        { status: 400 }
      )
    }

    // Create new key
    const newKey: UserAPIKey = {
      id: 'key_' + Math.random().toString(36).substr(2, 9),
      userId,
      configId,
      keyValue, // In production: encrypt this before storing
      nickname,
      environment,
      isActive: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      estimatedCost: 0,
      status: 'active'
    }

    userAPIKeys.push(newKey)

    logger.info('API key added successfully', {
      userId,
      configId,
      keyId: newKey.id
    })

    return NextResponse.json({
      success: true,
      data: newKey,
      message: 'API key added successfully'
    })

  } catch (error: any) {
    logger.error('Failed to process API key request', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to process API key request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyId, updates } = body

    const userId = 'user_123'

    logger.info('Updating API key', { userId, keyId, updates })

    const keyIndex = userAPIKeys.findIndex(
      k => k.id === keyId && k.userId === userId
    )

    if (keyIndex === -1) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Update key
    userAPIKeys[keyIndex] = {
      ...userAPIKeys[keyIndex],
      ...updates,
      id: userAPIKeys[keyIndex].id, // Don't allow ID changes
      userId: userAPIKeys[keyIndex].userId, // Don't allow user changes
      createdAt: userAPIKeys[keyIndex].createdAt // Don't allow date changes
    }

    return NextResponse.json({
      success: true,
      data: userAPIKeys[keyIndex],
      message: 'API key updated successfully'
    })

  } catch (error: any) {
    logger.error('Failed to update API key', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to update API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    // In production, get userId from session/auth
    const userId = 'user_123'

    logger.info('Deleting API key', { userId, keyId })

    if (!keyId) {
      return NextResponse.json(
        { error: 'keyId is required' },
        { status: 400 }
      )
    }

    const keyIndex = userAPIKeys.findIndex(
      k => k.id === keyId && k.userId === userId
    )

    if (keyIndex === -1) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Remove the key from the array
    const deletedKey = userAPIKeys.splice(keyIndex, 1)[0]

    logger.info('API key deleted successfully', { userId, keyId })

    return NextResponse.json({
      success: true,
      data: deletedKey,
      message: 'API key deleted successfully'
    })

  } catch (error: any) {
    logger.error('Failed to delete API key', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
