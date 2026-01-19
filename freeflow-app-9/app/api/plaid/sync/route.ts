/**
 * Plaid Sync API - FreeFlow A+++ Implementation
 * Manual trigger for transaction sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performFullSync } from '@/lib/plaid/service';

// POST - Trigger sync for a connection
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

    const body = await request.json();
    const { connectionId, syncAll } = body;

    if (syncAll) {
      // Sync all connections for user
      const { data: connections, error: connError } = await supabase
        .from('bank_connections')
        .select('id, plaid_access_token, plaid_cursor')
        .eq('user_id', user.id)
        .eq('status', 'connected');

      if (connError) {
        return NextResponse.json(
          { error: 'Failed to fetch connections' },
          { status: 500 }
        );
      }

      const results = await Promise.all(
        (connections || []).map(async (conn) => {
          try {
            return await performFullSync(conn.id, conn.plaid_access_token, conn.plaid_cursor);
          } catch (err) {
            console.error(`Sync failed for connection ${conn.id}:`, err);
            return {
              connectionId: conn.id,
              errors: [err instanceof Error ? err.message : 'Unknown error'],
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          results,
          summary: {
            connectionsProcessed: results.length,
            totalTransactionsAdded: results.reduce((sum, r) => sum + (r.transactionsAdded || 0), 0),
            totalTransactionsUpdated: results.reduce((sum, r) => sum + (r.transactionsUpdated || 0), 0),
            totalAccountsUpdated: results.reduce((sum, r) => sum + (r.accountsUpdated || 0), 0),
          },
        },
      });
    }

    // Sync single connection
    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('bank_connections')
      .select('id, plaid_access_token, plaid_cursor, status')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (connection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Connection is not active' },
        { status: 400 }
      );
    }

    // Perform sync
    const result = await performFullSync(
      connection.id,
      connection.plaid_access_token,
      connection.plaid_cursor
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}

// GET - Get sync status/history
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
    const connectionId = searchParams.get('connectionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get sync logs
    let query = supabase
      .from('bank_sync_log')
      .select(`
        id,
        connection_id,
        sync_type,
        started_at,
        completed_at,
        status,
        transactions_added,
        transactions_updated,
        transactions_removed,
        accounts_synced,
        error_message,
        connection:bank_connections(
          id,
          institution_name
        )
      `)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (connectionId) {
      query = query.eq('connection_id', connectionId);
    } else {
      // Filter by user's connections
      const { data: userConnections } = await supabase
        .from('bank_connections')
        .select('id')
        .eq('user_id', user.id);

      if (userConnections && userConnections.length > 0) {
        query = query.in('connection_id', userConnections.map(c => c.id));
      }
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sync history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logs || [],
    });
  } catch (error) {
    console.error('Failed to fetch sync history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync history' },
      { status: 500 }
    );
  }
}
