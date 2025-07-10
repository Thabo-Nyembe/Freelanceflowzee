import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

import { ShareHeader } from '@/components/video/share-header';
import { VideoMetadata } from '@/components/video/video-metadata';
import { TranscriptSearch } from '@/components/video/transcript-search';
import { VideoPageSkeleton } from '@/components/video/video-page-skeleton';
import LazyVideoPlayer from '@/components/video/lazy-video-player';
import { AiInsights } from '@/components/video/ai-insights';

interface VideoPageProps {
  params: { id: string };
  searchParams: { t?: string };
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: video } = await supabase
    .from('videos')
    .select('title, description, thumbnail_url')
    .eq('id', params.id)
    .single();

  if (!video) {
    return { title: 'Video Not Found', description: 'This video may have been moved or deleted.' };
  }

  return {
    title: `${video.title} | FreeFlow`,
    description: video.description || 'Watch this video on FreeFlow',
    openGraph: {
      title: video.title,
      description: video.description || '',
      images: [
        {
          url: video.thumbnail_url || '/default-thumbnail.png',
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
  };
}

 function VideoPage({ params }: VideoPageProps) {
  const supabase = createServerComponentClient({ cookies });

  // RLS will enforce security, ensuring only authorized users can fetch the video.
  const { data: video } = await supabase
    .from('videos')
    .select('*, author:users(*)')
    .eq('id', params.id)
    .single();

  if (!video || !video.author) {
    notFound();
  }

  return (
    <Suspense fallback={<VideoPageSkeleton />}>
      <div className="container mx-auto p-4 space-y-6">
        <ShareHeader video={video} author={video.author} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video w-full">
              <LazyVideoPlayer
                playbackId={video.mux_playback_id || ''}
                title={video.title}
              />
            </div>
            <VideoMetadata video={video} />
          </div>

          <div className="space-y-6">
            <AiInsights video={video} />
            {video.transcript && (
              <div className="rounded-lg border bg-card p-4">
                <h2 className="mb-4 text-lg font-semibold">Search in Video</h2>
                <TranscriptSearch
                  videoId={video.id}
                  onTimestampClick={() => {
                    // Logic to seek player
                  }}
                />
              </div>
            )}
            {/* Comments section would go here */}
          </div>
        </div>
      </div>
    </Suspense>
  );
} 