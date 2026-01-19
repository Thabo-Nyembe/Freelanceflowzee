/**
 * Version Restore API - FreeFlow A+++ Implementation
 * Restore a document to a previous version
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RestorePayload {
  versionId: string;
  createCheckpoint?: boolean;
  checkpointLabel?: string;
}

// POST - Restore a document to a previous version
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: RestorePayload = await request.json();

    if (!body.versionId) {
      return NextResponse.json(
        { error: 'versionId is required' },
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

    // Fetch the version to restore
    const { data: targetVersion, error: fetchError } = await supabase
      .from('document_versions')
      .select(`
        id,
        document_id,
        version_number,
        content_snapshot,
        word_count
      `)
      .eq('id', body.versionId)
      .single();

    if (fetchError || !targetVersion) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Get current max version number
    const { data: maxVersionData } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', targetVersion.document_id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (maxVersionData?.version_number || 0) + 1;

    // Create a new version that restores the content (preserve history)
    const { data: restoredVersion, error: insertError } = await supabase
      .from('document_versions')
      .insert({
        document_id: targetVersion.document_id,
        version_number: nextVersionNumber,
        created_by: user.id,
        content_snapshot: targetVersion.content_snapshot,
        word_count: targetVersion.word_count,
        label: body.checkpointLabel || `Restored from v${targetVersion.version_number}`,
        description: `Content restored from version ${targetVersion.version_number}`,
        change_summary: `Restored to version ${targetVersion.version_number}`,
        is_auto_save: false,
        is_checkpoint: body.createCheckpoint !== false, // Default to creating checkpoint
        metadata: {
          restored_from_version_id: targetVersion.id,
          restored_from_version_number: targetVersion.version_number,
          restored_at: new Date().toISOString(),
          restored_by: user.id,
        },
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
      console.error('Error creating restored version:', insertError);
      return NextResponse.json(
        { error: 'Failed to restore version' },
        { status: 500 }
      );
    }

    // Optionally update the document's current content
    // This depends on your document structure - updating the main document table
    const { error: docUpdateError } = await supabase
      .from('documents')
      .update({
        content: targetVersion.content_snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetVersion.document_id);

    if (docUpdateError) {
      // Log but don't fail - the version was created successfully
      console.warn('Could not update document content:', docUpdateError);
    }

    // Transform to camelCase
    const transformedVersion = {
      id: restoredVersion.id,
      versionNumber: restoredVersion.version_number,
      documentId: restoredVersion.document_id,
      createdBy: restoredVersion.created_by,
      createdAt: restoredVersion.created_at,
      label: restoredVersion.label,
      description: restoredVersion.description,
      contentSnapshot: restoredVersion.content_snapshot,
      wordCount: restoredVersion.word_count,
      changeSummary: restoredVersion.change_summary,
      isAutoSave: restoredVersion.is_auto_save,
      isCheckpoint: restoredVersion.is_checkpoint,
      metadata: restoredVersion.metadata,
      author: restoredVersion.author ? {
        id: restoredVersion.author.id,
        name: restoredVersion.author.name,
        avatar: restoredVersion.author.avatar_url,
      } : null,
    };

    return NextResponse.json({
      success: true,
      message: `Document restored to version ${targetVersion.version_number}`,
      newVersion: transformedVersion,
    });
  } catch (error) {
    console.error('Error in POST /api/versions/restore:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
