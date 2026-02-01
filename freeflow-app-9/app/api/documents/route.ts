// =====================================================
// KAZI Document Management API - Main Route
// World-class document handling, versioning & sharing
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { documentService } from '@/lib/documents/document-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('documents');

// =====================================================
// GET - List documents with filters
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Handle different actions
    switch (action) {
      case 'search': {
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '50');
        const documents = await documentService.searchDocuments(user.id, query, limit);
        return NextResponse.json({ documents });
      }

      case 'recent': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const documents = await documentService.getRecentDocuments(user.id, limit);
        return NextResponse.json({ documents });
      }

      case 'starred': {
        const documents = await documentService.getStarredDocuments(user.id);
        return NextResponse.json({ documents });
      }

      case 'shared-with-me': {
        const documents = await documentService.getSharedWithMe(user.id);
        return NextResponse.json({ documents });
      }

      case 'storage-stats': {
        const stats = await documentService.getStorageStats(user.id);
        return NextResponse.json({ stats });
      }

      case 'activity': {
        const documentId = searchParams.get('document_id') || undefined;
        const folderId = searchParams.get('folder_id') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const activity = await documentService.getActivity({
          documentId,
          folderId,
          userId: user.id,
          limit,
        });
        return NextResponse.json({ activity });
      }

      case 'templates': {
        const category = searchParams.get('category') || undefined;
        const templates = await documentService.getTemplates(user.id, category);
        return NextResponse.json({ templates });
      }

      case 'requests': {
        const status = searchParams.get('status') || undefined;
        const requests = await documentService.getRequests(user.id, status);
        return NextResponse.json({ requests });
      }

      default: {
        // List documents with filters
        const params = {
          folder_id: searchParams.get('folder_id') || undefined,
          file_types: searchParams.get('file_types')?.split(',') || undefined,
          tags: searchParams.get('tags')?.split(',') || undefined,
          is_starred: searchParams.get('is_starred') === 'true' ? true : undefined,
          is_archived: searchParams.get('is_archived') === 'true' ? true :
                       searchParams.get('is_archived') === 'false' ? false : undefined,
          is_shared: searchParams.get('is_shared') === 'true' ? true : undefined,
          client_id: searchParams.get('client_id') || undefined,
          project_id: searchParams.get('project_id') || undefined,
          date_from: searchParams.get('date_from') || undefined,
          date_to: searchParams.get('date_to') || undefined,
          query: searchParams.get('q') || undefined,
          sort_by: (searchParams.get('sort_by') as any) || 'created_at',
          sort_order: (searchParams.get('sort_order') as any) || 'desc',
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0'),
        };

        const result = await documentService.getDocuments(user.id, params);
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    logger.error('Documents GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create document or perform actions
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      // Document operations
      case 'create': {
        // Check storage quota first
        const quotaCheck = await documentService.checkStorageQuota(user.id, data.file_size || 0);
        if (!quotaCheck.allowed) {
          return NextResponse.json(
            { error: 'Storage quota exceeded', remaining: quotaCheck.remaining },
            { status: 400 }
          );
        }

        const document = await documentService.createDocument(user.id, {
          name: data.name,
          folder_id: data.folder_id,
          description: data.description,
          file_type: data.file_type,
          mime_type: data.mime_type,
          file_size: data.file_size,
          storage_path: data.storage_path,
          storage_provider: data.storage_provider,
          thumbnail_url: data.thumbnail_url,
          tags: data.tags,
          client_id: data.client_id,
          project_id: data.project_id,
          invoice_id: data.invoice_id,
          metadata: data.metadata,
        });
        return NextResponse.json({ document }, { status: 201 });
      }

      case 'upload-version': {
        const version = await documentService.createVersion(data.document_id, user.id, {
          file_size: data.file_size,
          storage_path: data.storage_path,
          change_summary: data.change_summary,
        });
        return NextResponse.json({ version }, { status: 201 });
      }

      case 'restore-version': {
        const document = await documentService.restoreVersion(
          data.document_id,
          data.version_id,
          user.id
        );
        return NextResponse.json({ document });
      }

      // Sharing
      case 'share': {
        const share = await documentService.shareDocument(user.id, {
          document_id: data.document_id,
          folder_id: data.folder_id,
          shared_with_user_id: data.shared_with_user_id,
          shared_with_email: data.shared_with_email,
          permission_level: data.permission_level,
          allow_download: data.allow_download,
          expires_at: data.expires_at,
          create_public_link: data.create_public_link,
          link_password: data.link_password,
        });
        return NextResponse.json({ share }, { status: 201 });
      }

      case 'revoke-share': {
        await documentService.revokeShare(data.share_id);
        return NextResponse.json({ success: true });
      }

      // Comments
      case 'add-comment': {
        const comment = await documentService.addComment(
          data.document_id,
          user.id,
          data.content,
          data.parent_id,
          data.position_data
        );
        return NextResponse.json({ comment }, { status: 201 });
      }

      case 'resolve-comment': {
        const comment = await documentService.resolveComment(data.comment_id, user.id);
        return NextResponse.json({ comment });
      }

      case 'delete-comment': {
        await documentService.deleteComment(data.comment_id);
        return NextResponse.json({ success: true });
      }

      // Templates
      case 'create-from-template': {
        const document = await documentService.createFromTemplate(
          data.template_id,
          user.id,
          data.name,
          data.variables,
          data.folder_id
        );
        return NextResponse.json({ document }, { status: 201 });
      }

      // Requests
      case 'create-request': {
        const requestDoc = await documentService.createRequest(user.id, {
          title: data.title,
          description: data.description,
          requested_documents: data.requested_documents,
          client_id: data.client_id,
          project_id: data.project_id,
          due_date: data.due_date,
          expires_at: data.expires_at,
        });
        return NextResponse.json({ request: requestDoc }, { status: 201 });
      }

      case 'fulfill-request': {
        const requestDoc = await documentService.fulfillRequest(
          data.request_id,
          data.document_ids
        );
        return NextResponse.json({ request: requestDoc });
      }

      // Bulk operations
      case 'bulk-move': {
        await documentService.bulkMove(data.document_ids, data.folder_id, user.id);
        return NextResponse.json({ success: true });
      }

      case 'bulk-delete': {
        await documentService.bulkDelete(data.document_ids, user.id);
        return NextResponse.json({ success: true });
      }

      case 'bulk-archive': {
        await documentService.bulkArchive(data.document_ids, user.id);
        return NextResponse.json({ success: true });
      }

      case 'bulk-tag': {
        await documentService.bulkTag(data.document_ids, data.tags, user.id);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Documents POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Bulk delete documents
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { document_ids } = body;

    if (!document_ids || !Array.isArray(document_ids)) {
      return NextResponse.json(
        { error: 'document_ids array required' },
        { status: 400 }
      );
    }

    await documentService.bulkDelete(document_ids, user.id);
    return NextResponse.json({ success: true, deleted: document_ids.length });
  } catch (error) {
    logger.error('Documents DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete documents' },
      { status: 500 }
    );
  }
}
