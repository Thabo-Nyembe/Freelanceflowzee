import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { MuxClient } from '@/lib/mux';
import { Database } from '@/lib/database.types';
import { 
  CreateExportRequest, 
  VideoExport, 
  VideoExportStatus 
} from '@/lib/types/video-export';

const muxClient = new MuxClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { format, quality, settings = {} } = await request.json();

    // Get video asset ID
    const { data: video } = await supabase
      .from('videos')
      .select('mux_asset_id')
      .eq('id', params.id)
      .single();

    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    // Create export in Mux
    const exportData = await muxClient.requestExport({
      assetId: video.mux_asset_id,
      format,
      quality,
      ...settings
    });

    // Create export record in database
    const { data: videoExport, error } = await supabase
      .from('video_exports')
      .insert({
        video_id: params.id,
        user_id: user.id,
        format,
        quality,
        status: 'pending',
        export_settings: settings
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(videoExport);
  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: exports, error } = await supabase
      .from('video_exports')
      .select('*')
      .eq('video_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(exports);
  } catch (error) {
    console.error('Get exports error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 