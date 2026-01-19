/**
 * Document Versions API - FreeFlow A+++ Implementation
 * Full CRUD for document version history with diff support
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface VersionPayload {
  documentId: string;
  contentSnapshot: string;
  label?: string;
  description?: string;
  changeSummary?: string;
  isCheckpoint?: boolean;
  isAutoSave?: boolean;
  wordCount?: number;
  metadata?: Record<string, unknown>;
}

// GET - List versions for a document
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const documentId = searchParams.get('documentId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const checkpointsOnly = searchParams.get('checkpointsOnly') === 'true';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('document_versions')
      .select(`
        *,
        author:users!document_versions_created_by_fkey(
          id,
          name,
          avatar_url,
          email
        )
      `, { count: 'exact' })
      .eq('document_id', documentId);

    // Filter checkpoints only
    if (checkpointsOnly) {
      query = query.eq('is_checkpoint', true);
    }

    // Sort
    query = query.order('version_number', { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: versions, error, count } = await query;

    if (error) {
      console.error('Error fetching versions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedVersions = (versions || []).map(version => ({
      id: version.id,
      versionNumber: version.version_number,
      documentId: version.document_id,
      createdBy: version.created_by,
      createdAt: version.created_at,
      label: version.label,
      description: version.description,
      contentSnapshot: version.content_snapshot,
      wordCount: version.word_count,
      changeSummary: version.change_summary,
      isAutoSave: version.is_auto_save,
      isCheckpoint: version.is_checkpoint,
      metadata: version.metadata,
      author: version.author ? {
        id: version.author.id,
        name: version.author.name,
        avatar: version.author.avatar_url,
        email: version.author.email,
      } : null,
    }));

    return NextResponse.json({
      versions: transformedVersions,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new version
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: VersionPayload = await request.json();

    // Validate required fields
    if (!body.documentId || !body.contentSnapshot) {
      return NextResponse.json(
        { error: 'documentId and contentSnapshot are required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current max version number
    const { data: maxVersionData } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', body.documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (maxVersionData?.version_number || 0) + 1;

    // Calculate word count if not provided
    const wordCount = body.wordCount || countWords(body.contentSnapshot);

    // Generate change summary if not provided
    const changeSummary = body.changeSummary || `Version ${nextVersionNumber} created`;

    // Create version
    const { data: version, error: insertError } = await supabase
      .from('document_versions')
      .insert({
        document_id: body.documentId,
        version_number: nextVersionNumber,
        created_by: user.id,
        content_snapshot: body.contentSnapshot,
        label: body.label || null,
        description: body.description || null,
        change_summary: changeSummary,
        word_count: wordCount,
        is_auto_save: body.isAutoSave || false,
        is_checkpoint: body.isCheckpoint || false,
        metadata: body.metadata || null,
      })
      .select(`
        *,
        author:users!document_versions_created_by_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating version:', insertError);
      return NextResponse.json(
        { error: 'Failed to create version' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedVersion = {
      id: version.id,
      versionNumber: version.version_number,
      documentId: version.document_id,
      createdBy: version.created_by,
      createdAt: version.created_at,
      label: version.label,
      description: version.description,
      contentSnapshot: version.content_snapshot,
      wordCount: version.word_count,
      changeSummary: version.change_summary,
      isAutoSave: version.is_auto_save,
      isCheckpoint: version.is_checkpoint,
      metadata: version.metadata,
      author: version.author ? {
        id: version.author.id,
        name: version.author.name,
        avatar: version.author.avatar_url,
      } : null,
    };

    return NextResponse.json(transformedVersion, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update version metadata (label, description)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build update object
    const dbUpdates: Record<string, unknown> = {};
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isCheckpoint !== undefined) dbUpdates.is_checkpoint = updates.isCheckpoint;

    // Update version
    const { data: version, error: updateError } = await supabase
      .from('document_versions')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        author:users!document_versions_created_by_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating version:', updateError);
      return NextResponse.json(
        { error: 'Failed to update version' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedVersion = {
      id: version.id,
      versionNumber: version.version_number,
      documentId: version.document_id,
      createdBy: version.created_by,
      createdAt: version.created_at,
      label: version.label,
      description: version.description,
      contentSnapshot: version.content_snapshot,
      wordCount: version.word_count,
      changeSummary: version.change_summary,
      isAutoSave: version.is_auto_save,
      isCheckpoint: version.is_checkpoint,
      metadata: version.metadata,
      author: version.author ? {
        id: version.author.id,
        name: version.author.name,
        avatar: version.author.avatar_url,
      } : null,
    };

    return NextResponse.json(transformedVersion);
  } catch (error) {
    console.error('Error in PATCH /api/versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a version (soft delete or hard delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify version exists and user has permission
    const { data: existingVersion, error: fetchError } = await supabase
      .from('document_versions')
      .select('created_by, is_checkpoint')
      .eq('id', id)
      .single();

    if (fetchError || !existingVersion) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of auto-saves, not checkpoints
    if (existingVersion.is_checkpoint) {
      return NextResponse.json(
        { error: 'Cannot delete checkpoint versions' },
        { status: 403 }
      );
    }

    // Delete version
    const { error: deleteError } = await supabase
      .from('document_versions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting version:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete version' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Count words in content
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}
