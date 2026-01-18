import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * API Route: Outlook OAuth Authentication
 *
 * Handles Microsoft/Outlook OAuth flow for email integration
 */

// Force dynamic rendering for OAuth routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth error from Microsoft
    if (error) {
      const errorDescription = searchParams.get('error_description') || error;
      logger.warn('Outlook OAuth error from provider', { error, errorDescription });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/dashboard/email-agent/setup?outlook=error&message=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code) {
      // Validate required environment variables
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

      if (!clientId || clientId === 'your-microsoft-oauth-client-id') {
        logger.error('Outlook OAuth not configured - missing MICROSOFT_CLIENT_ID');
        const fallbackUrl = baseUrl || 'http://localhost:3000';
        return NextResponse.redirect(
          `${fallbackUrl}/dashboard/email-agent/setup?outlook=error&message=${encodeURIComponent('Outlook integration not configured. Please set MICROSOFT_CLIENT_ID in environment variables.')}`
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
      const redirectUri = `${baseUrl}/api/integrations/outlook/auth`;
      const scope = 'https://graph.microsoft.com/Mail.ReadWrite offline_access';

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_mode=query`;

      logger.info('Initiating Outlook OAuth flow', { redirectUri });
      return NextResponse.redirect(authUrl);
    }

    // Exchange code for tokens
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!clientSecret || clientSecret === 'your-microsoft-oauth-client-secret') {
      logger.error('Outlook OAuth not configured - missing MICROSOFT_CLIENT_SECRET');
      return NextResponse.redirect(
        `${baseUrl}/dashboard/email-agent/setup?outlook=error&message=${encodeURIComponent('Outlook integration not fully configured. Please set MICROSOFT_CLIENT_SECRET.')}`
      );
    }

    logger.info('Exchanging Outlook OAuth code for tokens');

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/integrations/outlook/auth`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error_description || errorData.error || 'Failed to exchange code for tokens';
      logger.error('Outlook token exchange failed', { error: errorData });
      throw new Error(errorMessage);
    }

    const tokens = await tokenResponse.json();

    logger.info('Outlook OAuth successful, saving tokens', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    // Get user email from Microsoft Graph
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    const userInfo = userInfoResponse.ok ? await userInfoResponse.json() : { mail: 'unknown' };
    const userEmail = userInfo.mail || userInfo.userPrincipalName || 'unknown';

    // Save tokens to database via internal API call
    const saveResponse = await fetch(`${baseUrl}/api/integrations/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email',
        config: {
          provider: 'outlook',
          email: userEmail,
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
      logger.error('Failed to save Outlook credentials', { error: saveError });
      // Continue anyway - tokens are valid, just not persisted
    } else {
      logger.info('Outlook credentials saved successfully');
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/email-agent/setup?outlook=success&email=${encodeURIComponent(userEmail)}`
    );
  } catch (error: any) {
    logger.error('Outlook OAuth failed', {
      error: error.message,
      stack: error.stack
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/dashboard/email-agent/setup?outlook=error&message=${encodeURIComponent(error.message)}`
    );
  }
}
