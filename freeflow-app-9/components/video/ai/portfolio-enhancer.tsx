'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoInsights } from './video-insights';
import { SmartChapters } from './smart-chapters';
import { VideoTranscription } from './video-transcription';
import { useSupabase } from '@/components/providers/index';

interface PortfolioVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  insights: unknown;
  chapters: unknown[];
  transcription: string;
  category: string;
  skills: string[];
  clientTestimonial?: string;
}

export const PortfolioEnhancer = () => {
  const [videos, setVideos] = useState<PortfolioVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PortfolioVideo | null>(null);
  const supabase = useSupabase();

  const handleVideoUpload = async (file: File) => {
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('portfolio-videos')
      .upload(`${Date.now()}-${file.name}`, file);

    if (error) {
      console.error('Error uploading video:', error);
      return;
    }

    // Create portfolio video entry
    const videoUrl = data.path;
    const newVideo: Partial<PortfolioVideo> = {
      title: file.name,
      description: '',
      url: videoUrl,
      category: 'work-sample',
      skills: [],
    };

    const { data: videoData, error: insertError } = await supabase
      .from('portfolio_videos')
      .insert(newVideo)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating video entry:', insertError);
      return;
    }

    // Refresh videos list
    loadPortfolioVideos();
  };

  const loadPortfolioVideos = async () => {
    const { data, error } = await supabase
      .from('portfolio_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading videos:', error);
      return;
    }

    setVideos(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio Video Manager</h2>
        <Button variant="outline" onClick={() => document.getElementById('video-upload')?.click()}>
          Upload New Video
        </Button>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video List */}
        <div className="space-y-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={video.thumbnailUrl || '/placeholder-thumbnail.jpg'}
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="text-sm text-gray-500">{video.category}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Video Editor */}
        {selectedVideo && (
          <div className="space-y-4">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="chapters">Smart Chapters</TabsTrigger>
                <TabsTrigger value="transcription">Transcription</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={selectedVideo.title}
                      onChange={(e) => {
                        setSelectedVideo({ ...selectedVideo, title: e.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-[100px] p-2 border rounded"
                      value={selectedVideo.description}
                      onChange={(e) => {
                        setSelectedVideo({ ...selectedVideo, description: e.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills Demonstrated</Label>
                    <Input
                      id="skills"
                      placeholder="Add skills (comma-separated)"
                      value={selectedVideo.skills.join(', ')}
                      onChange={(e) => {
                        setSelectedVideo({
                          ...selectedVideo,
                          skills: e.target.value.split(',').map((s) => s.trim()),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testimonial">Client Testimonial</Label>
                    <textarea
                      id="testimonial"
                      className="w-full min-h-[100px] p-2 border rounded"
                      value={selectedVideo.clientTestimonial || ''}
                      onChange={(e) => {
                        setSelectedVideo({
                          ...selectedVideo,
                          clientTestimonial: e.target.value,
                        });
                      }}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      const { error } = await supabase
                        .from('portfolio_videos')
                        .update(selectedVideo)
                        .eq('id', selectedVideo.id);

                      if (error) {
                        console.error('Error updating video:', error);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <VideoInsights videoId={selectedVideo.id} />
              </TabsContent>

              <TabsContent value="chapters">
                <SmartChapters videoId={selectedVideo.id} />
              </TabsContent>

              <TabsContent value="transcription">
                <VideoTranscription videoId={selectedVideo.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}; 