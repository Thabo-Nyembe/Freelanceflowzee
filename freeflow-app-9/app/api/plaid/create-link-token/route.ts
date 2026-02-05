/**
 * Plaid Create Link Token API - FreeFlow A+++ Implementation
 * Generates a Plaid Link token for initiating bank connection flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { createLinkToken } from '@/lib/plaid/service';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('plaid-api');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if this is an update mode request (re-linking an existing connection)
    const body = await request.json().catch(() => ({}));
    const { connectionId } = body;

    let accessToken: string | undefined;

    if (connectionId) {
      // Get existing connection for update mode
      const { data: connection, error: connError } = await supabase
        .from('bank_connections')
        .select('plaid_access_token')
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .single();

      if (connError || !connection) {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }

      accessToken = connection.plaid_access_token;
    }

    // Create link token
    const linkToken = await createLinkToken(user.id, accessToken);

    return NextResponse.json({
      success: true,
      data: {
        linkToken: linkToken.linkToken,
        expiration: linkToken.expiration,
      },
    });
  } catch (error) {
    logger.error('Failed to create link token', { error });
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
