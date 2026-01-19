/**
 * Sync API Route - FreeFlow A+++ Implementation
 * Handles sync operations from offline clients
 * Features: Conflict detection, batch operations, version tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============ Types ============

interface SyncRequest {
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  entityId?: string;
  version?: number;
}

interface SyncResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  conflict?: boolean;
  serverData?: Record<string, unknown>;
}

// ============ Allowed Tables ============

const ALLOWED_TABLES = [
  'projects',
  'tasks',
  'invoices',
  'clients',
  'files',
  'messages',
  'calendar_events',
  'time_entries',
  'transactions',
  'notes',
];

// ============ POST Handler ============

export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SyncRequest = await request.json();
    const { type, table, data, entityId, version } = body;

    // Validate table
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { success: false, error: `Table '${table}' is not allowed for sync` },
        { status: 400 }
      );
    }

    // Handle different sync types
    switch (type) {
      case 'create':
        return handleCreate(supabase, table, data, user.id);

      case 'update':
        return handleUpdate(supabase, table, data, entityId, version, user.id);

      case 'delete':
        return handleDelete(supabase, table, entityId, user.id);

      default:
        return NextResponse.json(
          { success: false, error: `Unknown sync type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============ Create Handler ============

async function handleCreate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  data: Record<string, unknown>,
  userId: string
): Promise<NextResponse<SyncResponse>> {
  // Remove temp ID if present
  const cleanData = { ...data };
  if (typeof cleanData.id === 'string' && cleanData.id.startsWith('temp_')) {
    delete cleanData.id;
  }

  // Add user_id if not present
  if (!cleanData.user_id) {
    cleanData.user_id = userId;
  }

  // Add timestamps
  cleanData.created_at = new Date().toISOString();
  cleanData.updated_at = new Date().toISOString();
  cleanData.version = 1;

  const { data: created, error } = await supabase
    .from(table)
    .insert(cleanData)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: created,
  });
}

// ============ Update Handler ============

async function handleUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  data: Record<string, unknown>,
  entityId: string | undefined,
  clientVersion: number | undefined,
  userId: string
): Promise<NextResponse<SyncResponse>> {
  if (!entityId) {
    return NextResponse.json(
      { success: false, error: 'Entity ID is required for updates' },
      { status: 400 }
    );
  }

  // Get current server version
  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('id', entityId)
    .single();

  if (fetchError) {
    return NextResponse.json(
      { success: false, error: fetchError.message },
      { status: 404 }
    );
  }

  // Check ownership
  if (current.user_id && current.user_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  // Check for conflicts (if version is provided)
  const serverVersion = current.version || 0;
  const forceOverwrite = data._forceOverwrite === true;
  delete data._forceOverwrite;

  if (clientVersion !== undefined && clientVersion < serverVersion && !forceOverwrite) {
    return NextResponse.json(
      {
        success: false,
        error: 'Conflict detected',
        conflict: true,
        serverData: current,
      },
      { status: 409 }
    );
  }

  // Prepare update data
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
    version: serverVersion + 1,
  };

  // Don't update certain fields
  delete updateData.id;
  delete updateData.created_at;
  delete updateData.user_id;

  const { data: updated, error: updateError } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', entityId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: updated,
  });
}

// ============ Delete Handler ============

async function handleDelete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  entityId: string | undefined,
  userId: string
): Promise<NextResponse<SyncResponse>> {
  if (!entityId) {
    return NextResponse.json(
      { success: false, error: 'Entity ID is required for deletions' },
      { status: 400 }
    );
  }

  // Check ownership first
  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select('user_id')
    .eq('id', entityId)
    .single();

  if (fetchError) {
    // Already deleted - return success
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, error: fetchError.message },
      { status: 404 }
    );
  }

  if (current.user_id && current.user_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq('id', entityId);

  if (deleteError) {
    return NextResponse.json(
      { success: false, error: deleteError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

// ============ GET Handler - Batch Sync ============

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const since = searchParams.get('since'); // ISO timestamp
    const limit = parseInt(searchParams.get('limit') || '100');
    const cursor = searchParams.get('cursor');

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { success: false, error: `Invalid table: ${table}` },
        { status: 400 }
      );
    }

    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })
      .limit(limit);

    // Incremental sync - only get records updated since timestamp
    if (since) {
      query = query.gt('updated_at', since);
    }

    // Cursor-based pagination
    if (cursor) {
      query = query.gt('id', cursor);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        count: data.length,
        hasMore: data.length === limit,
        cursor: data.length > 0 ? data[data.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error('Sync fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
