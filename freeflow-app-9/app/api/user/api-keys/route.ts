import { NextRequest, NextResponse } from 'next/server';
import logger from '@/app/lib/logger';

/**
 * User API Keys Management
 *
 * Allows users to store and manage their own API keys (BYOK - Bring Your Own Key)
 */

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
    // In production, get userId from session/auth
    const userId = 'user_123'

    logger.info('Fetching user API keys', { userId })

    // Filter keys for this user
    const keys = userAPIKeys.filter(k => k.userId === userId)

    return NextResponse.json({
      success: true,
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
    const { configId, keyValue, nickname, environment = 'production' } = body

    // In production, get userId from session/auth
    const userId = 'user_123'

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
    logger.error('Failed to add API key', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to add API key' },
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
