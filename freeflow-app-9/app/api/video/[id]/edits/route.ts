import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this video
    const { data: video } = await supabase
      .from('videos')
      .select('id, owner_id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const body = await request.json();
    const { edits, metadata } = body;

    // Save the edits
    const { data, error } = await supabase
      .from('video_edits')
      .insert({
        video_id: params.id,
        user_id: user.id,
        edits: edits,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving video edits:', error);
      return NextResponse.json({ error: 'Failed to save edits' }, { status: 500 });
    }

    // Update video's updated_at timestamp
    await supabase
      .from('videos')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Video edits saved successfully'
    });

  } catch (error) {
    console.error('Error in video edits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this video
    const { data: video } = await supabase
      .from('videos')
      .select('id, owner_id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Get all edits for this video
    const { data: edits, error } = await supabase
      .from('video_edits')
      .select('*')
      .eq('video_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching video edits:', error);
      return NextResponse.json({ error: 'Failed to fetch edits' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: edits,
      message: 'Video edits retrieved successfully'
    });

  } catch (error) {
    console.error('Error in video edits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const editId = searchParams.get('editId');

    if (!editId) {
      return NextResponse.json({ error: 'Edit ID required' }, { status: 400 });
    }

    // Verify user owns this video edit
    const { data: edit } = await supabase
      .from('video_edits')
      .select('id, video_id, user_id')
      .eq('id', editId)
      .eq('user_id', user.id)
      .single();

    if (!edit) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    // Delete the edit
    const { error } = await supabase
      .from('video_edits')
      .delete()
      .eq('id', editId);

    if (error) {
      console.error('Error deleting video edit:', error);
      return NextResponse.json({ error: 'Failed to delete edit' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Video edit deleted successfully'
    });

  } catch (error) {
    console.error('Error in video edits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 