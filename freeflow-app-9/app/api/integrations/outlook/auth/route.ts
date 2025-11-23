import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * API Route: Outlook OAuth Authentication
 *
 * Handles Microsoft/Outlook OAuth flow for email integration
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      // Initiate OAuth flow
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/outlook/auth`;
      const scope = 'https://graph.microsoft.com/Mail.ReadWrite offline_access';

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_mode=query`;

      logger.info('Initiating Outlook OAuth flow');
      return NextResponse.redirect(authUrl);
    }

    // Exchange code for tokens
    logger.info('Exchanging Outlook OAuth code for tokens');

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/outlook/auth`,
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

    logger.info('Outlook OAuth successful');

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/email-agent/setup?outlook=success`
    );
  } catch (error: any) {
    logger.error('Outlook OAuth failed', { error: error.message });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/email-agent/setup?outlook=error&message=${encodeURIComponent(error.message)}`
    );
  }
}
