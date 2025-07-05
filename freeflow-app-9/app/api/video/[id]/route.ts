import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { id } = params;

  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  // Set Cache-Control headers for performance
  // This will cache the response for 1 hour on the browser and CDN
  const headers = {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
  };

  return NextResponse.json(video, { headers });
} 