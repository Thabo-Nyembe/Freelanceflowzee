import React from 'react';
import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import MuxVideoPlayer from '@/components/video/mux-video-player';
import ClientReviewPanel from '@/components/video/client-review-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Share, 
  Download, 
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { 
  ClientReview
} from '@/components/video/client-review-panel';

interface VideoReviewPageProps {
  params: { id: string };
  searchParams: { review?: string; token?: string };
}

export async function generateMetadata({ params }: VideoReviewPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: video } = await supabase
    .from('videos')
    .select('title, description')
    .eq('id', params.id)
    .single();

  return {
    title: video ? `Review: ${video.title} | FreeFlow` : 'Video Review | FreeFlow',
    description: video?.description || 'Review and approve video content',
  };
}

type Collaborator = {
  user_id: string;
  role: 'client' | 'collaborator';
}

type Review = {
  status: 'approved' | 'rejected' | 'changes_requested' | 'in_review' | 'draft';
  settings?: {
    allow_comments?: boolean;
  }
}

async function getVideoReviewData(videoId: string, reviewId?: string, userId?: string) {
  const supabase = createServerComponentClient({ cookies });

  try {
    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select(`
        *,
        project:projects(id, name),
        user:profiles(id, display_name, avatar_url)
      `)
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return { video: null, review: null, userRole: null };
    }

    // Get review data if reviewId is provided
    let review: ClientReview | null = null;
    let userRole: 'client' | 'freelancer' | 'collaborator' | null = null;

    if (reviewId) {
      const { data: reviewData, error: reviewError } = await supabase
        .from('client_reviews')
        .select(`
          *,
          stages:review_stages(*),
          approvals:review_approvals(
            *,
            user:profiles(id, display_name, avatar_url)
          ),
          collaborators:review_collaborators(
            *,
            user:profiles(id, display_name, avatar_url)
          )
        `)
        .eq('id', reviewId)
        .eq('video_id', videoId)
        .single();

      if (!reviewError && reviewData) {
        review = reviewData;

        // Determine user role
        if (userId) {
          if (reviewData.created_by === userId) {
            userRole = 'freelancer';
          } else {
            const collaboration = reviewData.collaborators?.find(
              (c: Collaborator) => c.user_id === userId
            );
            if (collaboration) {
              userRole = collaboration.role === 'client' ? 'client' : 'collaborator';
            }
          }
        }
      }
    } else {
      // Get active review for this video
      const { data: activeReview } = await supabase
        .from('client_reviews')
        .select(`
          *,
          stages:review_stages(*),
          approvals:review_approvals(
            *,
            user:profiles(id, display_name, avatar_url)
          ),
          collaborators:review_collaborators(
            *,
            user:profiles(id, display_name, avatar_url)
          )
        `)
        .eq('video_id', videoId)
        .eq('status', 'in_review')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeReview) {
        review = activeReview;
        
        if (userId) {
          if (activeReview.created_by === userId) {
            userRole = 'freelancer';
          } else {
            const collaboration = activeReview.collaborators?.find(
              (c: Collaborator) => c.user_id === userId
            );
            if (collaboration) {
              userRole = collaboration.role === 'client' ? 'client' : 'collaborator';
            }
          }
        }
      }
    }

    return { video, review, userRole };
  } catch (error) {
    console.error('Error fetching video review data:', error);
    return { video: null, review: null, userRole: null };
  }
}

function VideoPlayerSkeleton() {
  return (
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

function ReviewPanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default async function VideoReviewPage({ params, searchParams }: VideoReviewPageProps) {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  // Allow access for non-authenticated users with tokens (for client review links)
  const hasValidToken = searchParams.token && searchParams.token.length > 10;
  
  if (authError || (!user && !hasValidToken)) {
    redirect('/auth/signin');
  }

  const { video, review, userRole } = await getVideoReviewData(
    params.id, 
    searchParams.review,
    user?.id
  );

  if (!video) {
    notFound();
  }

  // Check access permissions
  const hasAccess = user && (
    video.user_id === user.id || 
    userRole === 'client' || 
    userRole === 'collaborator' ||
    hasValidToken
  );

  if (!hasAccess) {
    redirect('/unauthorized');
  }

  const getVideoStatusBadge = () => {
    if (review) {
      switch (review.status) {
        case 'approved':
          return (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          );
        case 'rejected':
          return (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          );
        case 'changes_requested':
          return (
            <Badge className="bg-yellow-500 text-white">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Changes Requested
            </Badge>
          );
        case 'in_review':
          return (
            <Badge className="bg-blue-500 text-white">
              <Clock className="w-3 h-3 mr-1" />
              In Review
            </Badge>
          );
        default:
          return (
            <Badge variant="outline">
              <Eye className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/reviews">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Reviews
                </Button>
              </Link>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold">{video.title}</h1>
                  {getVideoStatusBadge()}
                </div>
                {video.description && (
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Suspense fallback={<VideoPlayerSkeleton />}>
                  {video.mux_asset_id ? (
                    <MuxVideoPlayer
                      videoId={video.id}
                      playbackId={video.mux_playback_id!}
                      title={video.title}
                      poster={video.thumbnail_url}
                      aspectRatio="16:9"
                      showControls={true}
                    />
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Video is still processing</p>
                        <p className="text-sm text-muted-foreground">Please check back in a few minutes</p>
                      </div>
                    </div>
                  )}
                </Suspense>
              </CardContent>
            </Card>

            {/* Video Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Video Information</h3>
                    <Badge variant="outline">
                      {video.duration ? `${Math.round(video.duration)}s` : 'Unknown duration'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created by:</span>
                      <p className="text-muted-foreground">{video.user?.display_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {video.project && (
                      <div>
                        <span className="font-medium">Project:</span>
                        <p className="text-muted-foreground">{video.project.name}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className="text-muted-foreground capitalize">{video.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {review ? (
              <Suspense fallback={<ReviewPanelSkeleton />}>
                <ClientReviewPanel
                  review={review}
                  userRole={userRole || 'client'}
                  onApprove={async (stageId, feedback) => {
                    // This would be handled by client-side logic
                    console.log('Approve:', stageId, feedback);
                  }}
                  onReject={async (stageId, feedback) => {
                    // This would be handled by client-side logic
                    console.log('Reject:', stageId, feedback);
                  }}
                  onRequestChanges={async (stageId, feedback) => {
                    // This would be handled by client-side logic
                    console.log('Request changes:', stageId, feedback);
                  }}
                  onAddReviewer={async (email, role) => {
                    // This would be handled by client-side logic
                    console.log('Add reviewer:', email, role);
                  }}
                  onUpdateDeadline={async (deadline) => {
                    // This would be handled by client-side logic
                    console.log('Update deadline:', deadline);
                  }}
                />
              </Suspense>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Active Review</h3>
                  <p className="text-muted-foreground mb-4">
                    This video doesn't have an active review workflow.
                  </p>
                  {user && video.user_id === user.id && (
                    <Link href={`/reviews?create=true&video=${video.id}`}>
                      <Button>
                        Create Review Workflow
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 