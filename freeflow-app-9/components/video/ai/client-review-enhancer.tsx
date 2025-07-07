'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoInsights } from './video-insights';
import { SmartChapters } from './smart-chapters';
import { RealTimeAnalysis } from './real-time-analysis';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface ReviewSession {
  id: string;
  projectId: string;
  videoUrl: string;
  status: 'pending' | 'in_review' | 'approved' | 'needs_changes';
  clientFeedback: string[];
  aiInsights: any;
  chapters: any[];
  created_at: string;
}

export const ClientReviewEnhancer = ({ projectId }: { projectId: string }) => {
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<ReviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    loadReviewSessions();
  }, [projectId]);

  const loadReviewSessions = async () => {
    const { data, error } = await supabase
      .from('review_sessions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading review sessions:', error);
      return;
    }

    setSessions(data);
  };

  const startNewReviewSession = () => {
    setIsRecording(true);
    // Initialize new session
  };

  const handleRecordingComplete = async (videoUrl: string) => {
    setIsRecording(false);

    const newSession: Partial<ReviewSession> = {
      projectId,
      videoUrl,
      status: 'pending',
      clientFeedback: [],
    };

    const { data, error } = await supabase
      .from('review_sessions')
      .insert(newSession)
      .select()
      .single();

    if (error) {
      console.error('Error creating review session:', error);
      return;
    }

    loadReviewSessions();
  };

  const getStatusBadge = (status: ReviewSession['status']) => {
    const variants = {
      pending: 'default',
      in_review: 'secondary',
      approved: 'success',
      needs_changes: 'destructive',
    };

    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Review Sessions</h2>
        <Button onClick={startNewReviewSession} disabled={isRecording}>
          Start New Review Session
        </Button>
      </div>

      {isRecording && (
        <Card className="p-4">
          <RealTimeAnalysis
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => setIsRecording(false)}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setActiveSession(session)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-2">{getStatusBadge(session.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {session.clientFeedback.length} comments
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Session Details */}
        {activeSession && (
          <div className="space-y-4">
            <Tabs defaultValue="video">
              <TabsList>
                <TabsTrigger value="video">Video Review</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="chapters">Smart Chapters</TabsTrigger>
                <TabsTrigger value="feedback">Client Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="video">
                <div className="space-y-4">
                  <video
                    src={activeSession.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const { error } = await supabase
                          .from('review_sessions')
                          .update({ status: 'approved' })
                          .eq('id', activeSession.id);

                        if (error) {
                          console.error('Error updating status:', error);
                          return;
                        }
                        loadReviewSessions();
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const { error } = await supabase
                          .from('review_sessions')
                          .update({ status: 'needs_changes' })
                          .eq('id', activeSession.id);

                        if (error) {
                          console.error('Error updating status:', error);
                          return;
                        }
                        loadReviewSessions();
                      }}
                    >
                      Request Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <VideoInsights videoId={activeSession.id} />
              </TabsContent>

              <TabsContent value="chapters">
                <SmartChapters videoId={activeSession.id} />
              </TabsContent>

              <TabsContent value="feedback">
                <div className="space-y-4">
                  {activeSession.clientFeedback.map((feedback, index) => (
                    <Card key={index} className="p-4">
                      <p>{feedback}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}; 