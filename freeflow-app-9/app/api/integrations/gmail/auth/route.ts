import { NextRequest, NextResponse } from 'next/server';
import logger from '@/app/lib/logger';

/**
 * API Route: Gmail OAuth Authentication
 *
 * Handles Gmail OAuth flow for email integration
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      // Initiate OAuth flow
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/gmail/auth`;
      const scope = 'https://www.googleapis.com/auth/gmail.modify';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      logger.info('Initiating Gmail OAuth flow');
      return NextResponse.redirect(authUrl);
    }

    // Exchange code for tokens
    logger.info('Exchanging Gmail OAuth code for tokens');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/gmail/auth`,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to exchange code for tokens');
    }

    const tokens = await response.json();

    // Save tokens to database (should be done via /api/integrations/save)
    // For now, redirect back to setup page with success message

    logger.info('Gmail OAuth successful');

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/email-agent/setup?gmail=success`
    );
  } catch (error: any) {
    logger.error('Gmail OAuth failed', { error: error.message });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/email-agent/setup?gmail=error&message=${encodeURIComponent(error.message)}`
    );
  }
}
