/**
 * Bank Connections API - FreeFlow A+++ Implementation
 * Manage bank connections - list, update, delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';
import { removeItem } from '@/lib/plaid/service';

const logger = createFeatureLogger('plaid-api');

// GET - List all bank connections for user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const includeAccounts = searchParams.get('includeAccounts') === 'true';

    // Base query
    let query = supabase
      .from('bank_connections')
      .select(`
        id,
        institution_name,
        status,
        last_sync_at,
        next_sync_at,
        error_code,
        error_message,
        accounts_synced_count,
        transactions_synced_count,
        created_at,
        updated_at,
        institution:bank_institutions(
          id,
          name,
          logo_url,
          primary_color,
          website_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: connections, error } = await query;

    if (error) {
      logger.error('Failed to fetch connections', { error });
      return NextResponse.json(
        { error: 'Failed to fetch connections' },
        { status: 500 }
      );
    }

    // If includeAccounts, fetch accounts for each connection
    let result = connections || [];

    if (includeAccounts && result.length > 0) {
      const connectionIds = result.map(c => c.id);
      const { data: accounts } = await supabase
        .from('bank_accounts')
        .select(`
          id,
          connection_id,
          name,
          official_name,
          mask,
          type,
          subtype,
          current_balance,
          available_balance,
          credit_limit,
          currency,
          is_active,
          is_hidden,
          balance_last_updated
        `)
        .in('connection_id', connectionIds)
        .eq('is_active', true);

      // Group accounts by connection
      const accountsByConnection = (accounts || []).reduce((acc, account) => {
        if (!acc[account.connection_id]) {
          acc[account.connection_id] = [];
        }
        acc[account.connection_id].push(account);
        return acc;
      }, {} as Record<string, typeof accounts>);

      result = result.map(conn => ({
        ...conn,
        accounts: accountsByConnection[conn.id] || [],
      }));
    }

    // Calculate summary stats
    const totalBalance = await getTotalBalance(supabase, user.id);

    return NextResponse.json({
      success: true,
      data: {
        connections: result,
        summary: {
          totalConnections: result.length,
          activeConnections: result.filter(c => c.status === 'connected').length,
          totalBalance,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch connections', { error });
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a bank connection
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Get connection
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

    // Remove item from Plaid
    if (connection.plaid_access_token) {
      await removeItem(connection.plaid_access_token);
    }

    // Soft delete - mark accounts as inactive
    await supabase
      .from('bank_accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('connection_id', connectionId);

    // Update connection status
    await supabase
      .from('bank_connections')
      .update({
        status: 'disconnected',
        plaid_access_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    return NextResponse.json({
      success: true,
      message: 'Bank connection removed',
    });
  } catch (error) {
    logger.error('Failed to remove connection', { error });
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}

// Helper function to get total balance across all accounts
async function getTotalBalance(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const { data: accounts } = await supabase
    .from('bank_accounts')
    .select('current_balance, type')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!accounts) return 0;

  return accounts.reduce((total, account) => {
    const balance = account.current_balance || 0;
    // For credit accounts, subtract the balance (it's money owed)
    if (account.type === 'credit') {
      return total - Math.abs(balance);
    }
    return total + balance;
  }, 0);
}
