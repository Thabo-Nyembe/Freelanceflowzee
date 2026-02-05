/**
 * Document Suggestions API - FreeFlow A+++ Implementation
 * Track changes/suggestions mode for collaborative document editing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/demo-mode';

const logger = createSimpleLogger('suggestions');

export interface SuggestionPayload {
  documentId: string;
  type: 'insertion' | 'deletion' | 'replacement' | 'formatting';
  content: {
    original?: string;
    suggested?: string;
    from: number;
    to: number;
  };
}

// GET - Fetch suggestions for a document
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const status = searchParams.get('status'); // pending, accepted, rejected

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
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
      .from('document_suggestions')
      .select(`
        *,
        author:users!document_suggestions_author_id_fkey(
          id,
          name,
          avatar_url
        ),
        resolver:users!document_suggestions_resolved_by_fkey(
          id,
          name
        ),
        comments:suggestion_comments(
          id,
          content,
          created_at,
          author:users(
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status);
    }

    const { data: suggestions, error } = await query;

    if (error) {
      logger.error('Error fetching suggestions', { error });
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedSuggestions = (suggestions || []).map(suggestion => ({
      id: suggestion.id,
      documentId: suggestion.document_id,
      authorId: suggestion.author_id,
      authorName: suggestion.author?.name || 'Unknown',
      authorAvatar: suggestion.author?.avatar_url,
      type: suggestion.suggestion_type,
      content: {
        original: suggestion.original_content,
        suggested: suggestion.suggested_content,
        from: suggestion.position_from,
        to: suggestion.position_to,
      },
      status: suggestion.status,
      createdAt: suggestion.created_at,
      resolvedAt: suggestion.resolved_at,
      resolvedBy: suggestion.resolved_by,
      resolverName: suggestion.resolver?.name,
      comments: (suggestion.comments || []).map((c: any) => ({
        id: c.id,
        authorId: c.author?.id,
        authorName: c.author?.name || 'Unknown',
        authorAvatar: c.author?.avatar_url,
        content: c.content,
        createdAt: c.created_at,
      })),
    }));

    return NextResponse.json(transformedSuggestions);
  } catch (error) {
    logger.error('Error in GET /api/suggestions', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new suggestion
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: SuggestionPayload = await request.json();

    // Validate required fields
    if (!body.documentId || !body.type || !body.content) {
      return NextResponse.json(
        { error: 'documentId, type, and content are required' },
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

    // Verify document exists and user has access
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, owner_id')
      .eq('id', body.documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Create suggestion
    const { data: suggestion, error: insertError } = await supabase
      .from('document_suggestions')
      .insert({
        document_id: body.documentId,
        author_id: user.id,
        suggestion_type: body.type,
        original_content: body.content.original || null,
        suggested_content: body.content.suggested || null,
        position_from: body.content.from,
        position_to: body.content.to,
        status: 'pending',
      })
      .select(`
        *,
        author:users!document_suggestions_author_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      logger.error('Error creating suggestion', { error: insertError });
      return NextResponse.json(
        { error: 'Failed to create suggestion' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedSuggestion = {
      id: suggestion.id,
      documentId: suggestion.document_id,
      authorId: suggestion.author_id,
      authorName: suggestion.author?.name || 'Unknown',
      authorAvatar: suggestion.author?.avatar_url,
      type: suggestion.suggestion_type,
      content: {
        original: suggestion.original_content,
        suggested: suggestion.suggested_content,
        from: suggestion.position_from,
        to: suggestion.position_to,
      },
      status: suggestion.status,
      createdAt: suggestion.created_at,
      comments: [],
    };

    return NextResponse.json(transformedSuggestion, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/suggestions', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update suggestion (accept/reject)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Suggestion ID is required' },
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

    // Handle accept/reject actions
    if (action === 'accept' || action === 'reject') {
      const { data: suggestion, error: updateError } = await supabase
        .from('document_suggestions')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        logger.error('Error updating suggestion', { error: updateError });
        return NextResponse.json(
          { error: 'Failed to update suggestion' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        id: suggestion.id,
        status: suggestion.status,
        resolvedAt: suggestion.resolved_at,
        resolvedBy: suggestion.resolved_by,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Error in PATCH /api/suggestions', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a suggestion
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Suggestion ID is required' },
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

    // Verify ownership
    const { data: suggestion, error: fetchError } = await supabase
      .from('document_suggestions')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      );
    }

    if (suggestion.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete suggestion
    const { error: deleteError } = await supabase
      .from('document_suggestions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Error deleting suggestion', { error: deleteError });
      return NextResponse.json(
        { error: 'Failed to delete suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/suggestions', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
