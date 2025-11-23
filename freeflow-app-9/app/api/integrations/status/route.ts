import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * Integration Status Check API
 *
 * Returns the connection status of a specific integration
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('id');

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    logger.info('Checking integration status', { integrationId });

    // In production, check database for actual connection status
    // For now, return mock data
    const mockStatuses: Record<string, boolean> = {
      gmail: false,
      outlook: false,
      openai: false,
      anthropic: false,
      'google-calendar': false,
      stripe: false,
      twilio: false,
      hubspot: false
    };

    const isConnected = mockStatuses[integrationId] || false;

    return NextResponse.json({
      success: true,
      integrationId,
      connected: isConnected,
      lastChecked: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Integration status check error', { error: error.message });

    return NextResponse.json(
      { error: error.message || 'Failed to check integration status' },
      { status: 500 }
    );
  }
}
