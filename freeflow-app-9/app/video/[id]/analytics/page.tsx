import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoAnalyticsSummary } from '@/lib/types/video';
import ClientCharts from './ClientCharts';

async function getVideoAnalytics(videoId: string): Promise<{
  video: { id: string; title: string; user_id: string };
  analytics: VideoAnalyticsSummary;
}> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value ?? '';
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

  // First check if video exists and user has access
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id, title, user_id')
    .eq('id', videoId)
    .single();

  if (videoError || !video) {
    return notFound();
  }

  // Fetch analytics data
  const response = await fetch(`/api/video/${videoId}/analytics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }

  const analytics: VideoAnalyticsSummary = await response.json();
  return { video, analytics };
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle><Skeleton className="h-4 w-[100px]" /></CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle><Skeleton className="h-4 w-[150px]" /></CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnalyticsContent({ 
  data 
}: { 
  data: Awaited<ReturnType<typeof getVideoAnalytics>>
}) {
  const { video, analytics } = data;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics for {video.title}</h1>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>All-time video views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Unique Viewers</CardTitle>
            <CardDescription>Distinct viewers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueViewers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg. Watch Time</CardTitle>
            <CardDescription>Minutes per view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.averageWatchTime / 60)}m
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>Viewers who finish</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.completionRate)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ClientCharts
        viewsByDay={analytics.viewsByDay}
        engagementByType={analytics.engagementByType}
      />
    </div>
  );
}

 export default async function VideoAnalyticsPage({
 params, }: {
 params: { id: string };
}) {
  const data = await getVideoAnalytics(params.id);
  
  return (
    <div className="container py-6">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent data={data} />
      </Suspense>
    </div>
  );
}
