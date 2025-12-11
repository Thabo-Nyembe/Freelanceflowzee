// =====================================================
// KAZI Document Management API - Public Share Link Route
// Access documents via public share links
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/documents/document-service';

// =====================================================
// GET - Access document via public link
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ link: string }> }
) {
  try {
    const { link } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    const result = await documentService.getByPublicLink(link);

    if (!result) {
      return NextResponse.json(
        { error: 'Document not found or link expired' },
        { status: 404 }
      );
    }

    const { document, share } = result;

    // Check password if required
    if (share.link_password && share.link_password !== password) {
      return NextResponse.json(
        { error: 'Password required', requires_password: true },
        { status: 401 }
      );
    }

    // Return limited document info based on permissions
    const response: any = {
      document: {
        id: document.id,
        name: document.name,
        description: document.description,
        file_type: document.file_type,
        file_size: document.file_size,
        thumbnail_url: document.thumbnail_url,
        preview_url: document.preview_url,
        created_at: document.created_at,
      },
      share: {
        permission_level: share.permission_level,
        allow_download: share.allow_download,
        expires_at: share.expires_at,
      },
    };

    // Add download URL if allowed
    if (share.allow_download) {
      response.download_url = document.storage_path;
    }

    // Add comments if permission allows
    if (share.permission_level !== 'view') {
      const comments = await documentService.getComments(document.id);
      response.comments = comments;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Share link GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to access shared document' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Add comment via public link (if allowed)
// =====================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ link: string }> }
) {
  try {
    const { link } = await params;
    const body = await request.json();
    const { password, content, parent_id, position_data, guest_name, guest_email } = body;

    const result = await documentService.getByPublicLink(link);

    if (!result) {
      return NextResponse.json(
        { error: 'Document not found or link expired' },
        { status: 404 }
      );
    }

    const { document, share } = result;

    // Check password if required
    if (share.link_password && share.link_password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check permission level
    if (share.permission_level === 'view') {
      return NextResponse.json(
        { error: 'Comments not allowed on this share' },
        { status: 403 }
      );
    }

    // For guest comments, we use a special user ID format
    const guestUserId = `guest:${guest_email || 'anonymous'}`;

    // Note: In production, you'd want to store guest info separately
    // and associate comments properly
    const comment = await documentService.addComment(
      document.id,
      share.shared_by, // Use document owner as commenter for now
      `[${guest_name || 'Guest'}]: ${content}`,
      parent_id,
      {
        ...position_data,
        guest_name,
        guest_email,
        via_public_link: true,
      }
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Share link POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}
