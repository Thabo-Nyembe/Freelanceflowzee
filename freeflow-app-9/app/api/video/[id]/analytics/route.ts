import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { 
  VideoViewSchema, 
  VideoWatchTimeSchema, 
  VideoEngagementEventSchema,
  VideoAnalyticsSummarySchema 
} from '@/lib/types/video';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value ?? '';
          },
          set(name: string, value: string) {
            cookieStore.set(name, value);
          },
          remove(name: string) {
            cookieStore.delete(name);
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    const body = await request.json();
    const videoId = params.id;
    const userId = session?.user?.id;

    // Validate request type
    const eventType = body.type;
    switch (eventType) {
      case 'view': {
        const viewData = VideoViewSchema.parse({
          ...body.data,
          videoId,
          userId,
        });
        await supabase.rpc('track_video_view', {
          _video_id: viewData.videoId,
          _user_id: viewData.userId,
          _duration: viewData.duration,
          _quality: viewData.quality,
          _platform: viewData.platform,
        });
        break;
      }
      case 'watch_time': {
        const watchData = VideoWatchTimeSchema.parse({
          ...body.data,
          videoId,
          userId,
        });
        await supabase.rpc('record_watch_time', {
          _video_id: watchData.videoId,
          _user_id: watchData.userId,
          _start_time: watchData.startTime,
          _end_time: watchData.endTime,
          _duration: watchData.duration,
          _progress: watchData.progress,
        });
        break;
      }
      case 'engagement': {
        const engagementData = VideoEngagementEventSchema.parse({
          ...body.data,
          videoId,
          userId,
        });
        await supabase.from('video_engagement_events').insert({
          video_id: engagementData.videoId,
          user_id: engagementData.userId,
          event_type: engagementData.eventType,
          data: engagementData.data,
        });
        break;
      }
      default:
        throw new Error(`Invalid event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value ?? '';
          },
          set(name: string, value: string) {
            cookieStore.set(name, value);
          },
          remove(name: string) {
            cookieStore.delete(name);
          },
        },
      }
    );
    const videoId = params.id;

    // Get video details to check permissions
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('user_id, visibility')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Get analytics data
    const { data: dailyStats } = await supabase
      .from('video_daily_analytics')
      .select('*')
      .eq('video_id', videoId)
      .order('date', { ascending: false })
      .limit(30);

    // Get engagement stats
    const { data: rawEngagementStats } = await supabase
      .from('video_engagement_events')
      .select('event_type');

    // Process engagement stats manually
    const engagementStats = rawEngagementStats?.reduce((acc: Record<string, number>, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    // Calculate summary metrics
    const summary = {
      totalViews: dailyStats?.reduce((sum, day) => sum + day.total_views, 0) || 0,
      uniqueViewers: dailyStats?.reduce((sum, day) => sum + day.unique_viewers, 0) || 0,
      averageWatchTime: dailyStats?.[0]?.average_watch_time || 0,
      completionRate: dailyStats?.[0]?.completion_rate || 0,
      engagementScore: dailyStats?.[0]?.engagement_score || 0,
      viewsByDay: dailyStats?.map(day => ({
        date: day.date,
        views: day.total_views,
      })) || [],
      engagementByType: engagementStats || {},
    };

    // Validate summary before sending
    const validatedSummary = VideoAnalyticsSummarySchema.parse(summary);

    return NextResponse.json(validatedSummary);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
