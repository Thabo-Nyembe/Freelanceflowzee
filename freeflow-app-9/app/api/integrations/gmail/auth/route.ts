import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';
import logger from '@/lib/logger';


/**
 * API Route: Gmail OAuth Authentication
 *
 * Handles Gmail OAuth flow for email integration
 */

// Force dynamic rendering for OAuth routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth error from Google
    if (error) {
      const errorDescription = searchParams.get('error_description') || error;
      logger.warn('Gmail OAuth error from provider', { error, errorDescription });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/dashboard/email-agent/setup?gmail=error&message=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code) {
      // Validate required environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

      if (!clientId || clientId === 'your-google-oauth-client-id') {
        logger.error('Gmail OAuth not configured - missing GOOGLE_CLIENT_ID');
        const fallbackUrl = baseUrl || 'http://localhost:3000';
        return NextResponse.redirect(
          `${fallbackUrl}/dashboard/email-agent/setup?gmail=error&message=${encodeURIComponent('Gmail integration not configured. Please set GOOGLE_CLIENT_ID in environment variables.')}`
        );
      }

      if (!baseUrl) {
        logger.error('Missing NEXT_PUBLIC_APP_URL environment variable');
        return NextResponse.json(
          { error: 'Server configuration error: NEXT_PUBLIC_APP_URL not set' },
          { status: 500 }
        );
      }

      // Initiate OAuth flow
      const redirectUri = `${baseUrl}/api/integrations/gmail/auth`;
      const scope = 'https://www.googleapis.com/auth/gmail.modify';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      logger.info('Initiating Gmail OAuth flow', { redirectUri });
      return NextResponse.redirect(authUrl);
    }

    // Exchange code for tokens
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!clientSecret || clientSecret === 'your-google-oauth-client-secret') {
      logger.error('Gmail OAuth not configured - missing GOOGLE_CLIENT_SECRET');
      return NextResponse.redirect(
        `${baseUrl}/dashboard/email-agent/setup?gmail=error&message=${encodeURIComponent('Gmail integration not fully configured. Please set GOOGLE_CLIENT_SECRET.')}`
      );
    }

    logger.info('Exchanging Gmail OAuth code for tokens');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/integrations/gmail/auth`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error_description || errorData.error || 'Failed to exchange code for tokens';
      logger.error('Gmail token exchange failed', { error: errorData });
      throw new Error(errorMessage);
    }

    const tokens = await tokenResponse.json();

    logger.info('Gmail OAuth successful, saving tokens', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    // Get user email from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    const userInfo = userInfoResponse.ok ? await userInfoResponse.json() : { email: 'unknown' };

    // Save tokens to database via internal API call
    const saveResponse = await fetch(`${baseUrl}/api/integrations/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email',
        config: {
          provider: 'gmail',
          email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          connected_at: new Date().toISOString(),
        },
      }),
    });

    if (!saveResponse.ok) {
      const saveError = await saveResponse.json().catch(() => ({ error: 'Failed to save credentials' }));
      logger.error('Failed to save Gmail credentials', { error: saveError });
      // Continue anyway - tokens are valid, just not persisted
    } else {
      logger.info('Gmail credentials saved successfully');
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/email-agent/setup?gmail=success&email=${encodeURIComponent(userInfo.email || '')}`
    );
  } catch (error) {
    logger.error('Gmail OAuth failed', {
      error: error.message,
      stack: error.stack
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/dashboard/email-agent/setup?gmail=error&message=${encodeURIComponent(error.message)}`
    );
  }
}
