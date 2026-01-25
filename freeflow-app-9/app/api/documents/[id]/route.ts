// =====================================================
// KAZI Document Management API - Single Document Route
// Individual document operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { documentService } from '@/lib/documents/document-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('documents');

// =====================================================
// GET - Get single document with details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'versions': {
        const versions = await documentService.getVersions(id);
        return NextResponse.json({ versions });
      }

      case 'shares': {
        const shares = await documentService.getShares(id);
        return NextResponse.json({ shares });
      }

      case 'comments': {
        const comments = await documentService.getComments(id);
        return NextResponse.json({ comments });
      }

      case 'activity': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const activity = await documentService.getActivity({ documentId: id, limit });
        return NextResponse.json({ activity });
      }

      default: {
        const document = await documentService.getDocument(id);
        if (!document) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Verify ownership or shared access
        if (document.user_id !== user.id) {
          // Check if shared with user
          const sharedDocs = await documentService.getSharedWithMe(user.id);
          const hasAccess = sharedDocs.some(d => d.id === id);
          if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }
        }

        // Get additional details if requested
        const includeVersions = searchParams.get('include_versions') === 'true';
        const includeComments = searchParams.get('include_comments') === 'true';
        const includeActivity = searchParams.get('include_activity') === 'true';

        const response: any = { document };

        if (includeVersions) {
          response.versions = await documentService.getVersions(id);
        }

        if (includeComments) {
          response.comments = await documentService.getComments(id);
        }

        if (includeActivity) {
          response.activity = await documentService.getActivity({ documentId: id, limit: 20 });
        }

        return NextResponse.json(response);
      }
    }
  } catch (error: any) {
    logger.error('Document GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update document
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...updates } = body;

    // Get document to verify ownership
    const existingDoc = await documentService.getDocument(id);
    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (existingDoc.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if document is locked by another user
    if (existingDoc.is_locked && existingDoc.locked_by !== user.id) {
      return NextResponse.json(
        { error: 'Document is locked by another user' },
        { status: 423 }
      );
    }

    switch (action) {
      case 'move': {
        const document = await documentService.moveDocument(id, updates.folder_id, user.id);
        return NextResponse.json({ document });
      }

      case 'toggle-star': {
        const document = await documentService.toggleStar(id, user.id);
        return NextResponse.json({ document });
      }

      case 'archive': {
        const document = await documentService.archiveDocument(id, user.id);
        return NextResponse.json({ document });
      }

      case 'restore': {
        const document = await documentService.restoreDocument(id, user.id);
        return NextResponse.json({ document });
      }

      case 'lock': {
        const document = await documentService.lockDocument(id, user.id);
        return NextResponse.json({ document });
      }

      case 'unlock': {
        const document = await documentService.unlockDocument(id, user.id);
        return NextResponse.json({ document });
      }

      default: {
        // General update
        const allowedFields = [
          'name',
          'description',
          'tags',
          'folder_id',
          'client_id',
          'project_id',
          'invoice_id',
          'metadata',
          'expires_at',
        ];

        const filteredUpdates: Record<string, any> = {};
        for (const field of allowedFields) {
          if (updates[field] !== undefined) {
            filteredUpdates[field] = updates[field];
          }
        }

        const document = await documentService.updateDocument(id, user.id, filteredUpdates);
        return NextResponse.json({ document });
      }
    }
  } catch (error: any) {
    logger.error('Document PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete document
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get document to verify ownership
    const existingDoc = await documentService.getDocument(id);
    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (existingDoc.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await documentService.deleteDocument(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Document DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Partial update (for quick actions)
// =====================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Quick toggle actions
    if (body.toggle === 'star') {
      const document = await documentService.toggleStar(id, user.id);
      return NextResponse.json({ document });
    }

    if (body.toggle === 'archive') {
      const existingDoc = await documentService.getDocument(id);
      if (existingDoc?.is_archived) {
        const document = await documentService.restoreDocument(id, user.id);
        return NextResponse.json({ document });
      } else {
        const document = await documentService.archiveDocument(id, user.id);
        return NextResponse.json({ document });
      }
    }

    if (body.toggle === 'lock') {
      const existingDoc = await documentService.getDocument(id);
      if (existingDoc?.is_locked) {
        const document = await documentService.unlockDocument(id, user.id);
        return NextResponse.json({ document });
      } else {
        const document = await documentService.lockDocument(id, user.id);
        return NextResponse.json({ document });
      }
    }

    // Partial update
    const document = await documentService.updateDocument(id, user.id, body);
    return NextResponse.json({ document });
  } catch (error: any) {
    logger.error('Document PATCH error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}
