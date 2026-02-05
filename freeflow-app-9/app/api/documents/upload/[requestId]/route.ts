// =====================================================
// KAZI Document Management API - Upload Request Route
// Handle document uploads via request links
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/documents/document-service';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('documents-upload');

// =====================================================
// GET - Get upload request details (for clients)
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    // Try to find by ID first, then by upload_link
    let docRequest = await documentService.getRequest(requestId);

    if (!docRequest) {
      docRequest = await documentService.getRequestByUploadLink(requestId);
    }

    if (!docRequest) {
      return NextResponse.json(
        { error: 'Upload request not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (docRequest.expires_at && new Date(docRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Upload request has expired', status: 'expired' },
        { status: 410 }
      );
    }

    // Check if already completed
    if (docRequest.status === 'completed') {
      return NextResponse.json({
        request: {
          id: docRequest.id,
          title: docRequest.title,
          status: 'completed',
        },
        message: 'All requested documents have been uploaded',
      });
    }

    // Return request details (without sensitive info)
    return NextResponse.json({
      request: {
        id: docRequest.id,
        title: docRequest.title,
        description: docRequest.description,
        requested_documents: docRequest.requested_documents,
        uploaded_documents: docRequest.uploaded_documents,
        status: docRequest.status,
        due_date: docRequest.due_date,
      },
    });
  } catch (error) {
    logger.error('Upload request GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch upload request' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Upload documents to fulfill request
// =====================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { password, documents } = body;

    // documents should be array of: { name, file_type, mime_type, file_size, storage_path }

    // Try to find by ID first, then by upload_link
    let docRequest = await documentService.getRequest(requestId);

    if (!docRequest) {
      docRequest = await documentService.getRequestByUploadLink(requestId);
    }

    if (!docRequest) {
      return NextResponse.json(
        { error: 'Upload request not found' },
        { status: 404 }
      );
    }

    // Check password if set
    if (docRequest.upload_password && docRequest.upload_password !== password) {
      return NextResponse.json(
        { error: 'Invalid password', requires_password: true },
        { status: 401 }
      );
    }

    // Check if expired
    if (docRequest.expires_at && new Date(docRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Upload request has expired' },
        { status: 410 }
      );
    }

    // Check if already completed
    if (docRequest.status === 'completed') {
      return NextResponse.json(
        { error: 'Request already completed' },
        { status: 400 }
      );
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    // Create documents (uploaded by the request owner, associated with request)
    const createdDocuments = [];
    for (const doc of documents) {
      const created = await documentService.createDocument(docRequest.user_id, {
        name: doc.name,
        file_type: doc.file_type,
        mime_type: doc.mime_type,
        file_size: doc.file_size,
        storage_path: doc.storage_path,
        client_id: docRequest.client_id || undefined,
        project_id: docRequest.project_id || undefined,
        metadata: {
          uploaded_via_request: docRequest.id,
          uploaded_by_client: true,
        },
      });
      createdDocuments.push(created);
    }

    // Update request with uploaded documents
    const documentIds = createdDocuments.map(d => d.id);
    const updatedRequest = await documentService.fulfillRequest(docRequest.id, documentIds);

    return NextResponse.json({
      success: true,
      documents: createdDocuments.map(d => ({
        id: d.id,
        name: d.name,
      })),
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        uploaded_count: updatedRequest.uploaded_documents.length,
        requested_count: updatedRequest.requested_documents.length,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('Upload request POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to upload documents' },
      { status: 500 }
    );
  }
}
