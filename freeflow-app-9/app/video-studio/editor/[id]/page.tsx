import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VideoEditor from '@/components/video/video-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share, Eye } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Video Editor | FreeFlow',
  description: 'Professional video editing with timeline, effects, and collaborative features',
};

interface VideoEditorPageProps {
  params: {
    id: string;
  };
}

export default async function VideoEditorPage({ params }: VideoEditorPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get video details
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      *,
      video_chapters (
        id,
        title,
        start_time,
        end_time,
        summary,
        thumbnail_url
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !video) {
    notFound();
  }

  // Map chapters to the expected format
  const videoWithChapters = {
    ...video,
    ai_chapters: video.video_chapters || []
  };

  const handleSave = async (edits: any[]) => {
    'use server';
    
    const supabase = await createClient();
    
    // Save edits to database
    const { error } = await supabase
      .from('video_edits')
      .insert({
        video_id: params.id,
        user_id: user.id,
        edits: edits,
        created_at: new Date().toISOString()
      });

    if (!error) {
      // Update video metadata if needed
      await supabase
        .from('videos')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
    }
  };

  const handleExport = async (format: any) => {
    'use server';
    
    // Trigger export process
    console.log('Exporting video with format:', format);
    // Implementation would trigger Mux or other video processing service
  };

  const handleShare = async (settings: any) => {
    'use server';
    
    const supabase = await createClient();
    
    // Update sharing settings
    const { error } = await supabase
      .from('videos')
      .update({
        is_public: settings.privacy === 'public',
        sharing_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (!error) {
      console.log('Video sharing settings updated');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/video-studio" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Studio
            </Link>
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div>
            <h1 className="text-lg font-semibold">Enhanced Video Editor</h1>
            <p className="text-sm text-muted-foreground">
              Professional editing with timeline controls, effects, and AI features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/video/${video.id}`} className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <VideoEditor
        video={videoWithChapters}
        onSave={handleSave}
        onExport={handleExport}
        onShare={handleShare}
      />
    </div>
  );
} 