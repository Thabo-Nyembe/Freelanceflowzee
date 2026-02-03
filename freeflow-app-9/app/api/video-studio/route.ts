// =====================================================
// KAZI Video Studio API - Comprehensive Route
// Full video management with Mux integration
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { videoStudioService } from '@/lib/video/video-studio-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('video-studio');

// =====================================================
// GET - List videos, get video, or get analytics
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const videoId = searchParams.get('id');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(action, videoId);
    }

    switch (action) {
      case 'get': {
        if (!videoId) {
          return NextResponse.json(
            { success: false, error: 'Video ID required' },
            { status: 400 }
          );
        }
        const video = await videoStudioService.getVideo(videoId);
        if (!video) {
          return NextResponse.json(
            { success: false, error: 'Video not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, video });
      }

      case 'analytics': {
        if (!videoId) {
          return NextResponse.json(
            { success: false, error: 'Video ID required' },
            { status: 400 }
          );
        }
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const dateRange = startDate && endDate
          ? { start: new Date(startDate), end: new Date(endDate) }
          : undefined;

        const analytics = await videoStudioService.getAnalytics(videoId, dateRange);
        return NextResponse.json({ success: true, analytics });
      }

      case 'projects': {
        const projectId = searchParams.get('projectId');
        if (projectId) {
          const project = await videoStudioService.getProject(projectId);
          return NextResponse.json({ success: true, project });
        }
        const projects = await videoStudioService.listProjects(user.id);
        return NextResponse.json({ success: true, projects });
      }

      case 'render-status': {
        const jobId = searchParams.get('jobId');
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }
        const job = await videoStudioService.getRenderJob(jobId);
        return NextResponse.json({ success: true, job });
      }

      case 'share': {
        const shareId = searchParams.get('shareId');
        if (!shareId) {
          return NextResponse.json(
            { success: false, error: 'Share ID required' },
            { status: 400 }
          );
        }
        const share = await videoStudioService.getShareByShareId(shareId);
        return NextResponse.json({ success: true, share });
      }

      case 'comments': {
        if (!videoId) {
          return NextResponse.json(
            { success: false, error: 'Video ID required' },
            { status: 400 }
          );
        }
        const comments = await videoStudioService.getComments(videoId);
        return NextResponse.json({ success: true, comments });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Video Studio Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'video_upload',
            'mux_streaming',
            'ai_captions',
            'video_analytics',
            'project_management',
            'render_queue',
            'share_links',
            'timestamped_comments'
          ]
        });
      }

      default: {
        // List all videos
        const status = searchParams.get('status') as string | null;
        const visibility = searchParams.get('visibility') as string | null;
        const folderId = searchParams.get('folderId') || undefined;
        const search = searchParams.get('search') || undefined;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await videoStudioService.listVideos(
          user.id,
          { status, visibility, folderId, search },
          { page, limit }
        );

        return NextResponse.json({
          success: true,
          ...result,
          page,
          limit
        });
      }
    }
  } catch (error) {
    logger.error('Failed to fetch video data', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch video data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create videos, projects, uploads, renders
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'create-video': {
        const video = await videoStudioService.createVideo(user.id, {
          title: data.title,
          description: data.description,
          visibility: data.visibility,
          folderId: data.folderId,
          tags: data.tags,
          metadata: data.metadata,
        });
        return NextResponse.json({
          success: true,
          action: 'create-video',
          video,
          message: 'Video created successfully'
        }, { status: 201 });
      }

      case 'create-upload': {
        const upload = await videoStudioService.createDirectUpload(user.id, {
          corsOrigin: data.corsOrigin || '*',
          newAssetSettings: data.assetSettings,
        });
        return NextResponse.json({
          success: true,
          action: 'create-upload',
          ...upload,
          message: 'Upload URL created'
        });
      }

      case 'process-upload': {
        await videoStudioService.processUpload(
          user.id,
          data.videoId,
          data.uploadId,
          {
            generateCaptions: data.generateCaptions,
            captionLanguage: data.captionLanguage,
          }
        );
        return NextResponse.json({
          success: true,
          action: 'process-upload',
          message: 'Upload processing started'
        });
      }

      case 'create-project': {
        const project = await videoStudioService.createProject(user.id, {
          title: data.title,
          description: data.description,
          resolution: data.resolution,
          fps: data.fps,
          aspectRatio: data.aspectRatio,
          templateId: data.templateId,
        });
        return NextResponse.json({
          success: true,
          action: 'create-project',
          project,
          message: 'Project created successfully'
        }, { status: 201 });
      }

      case 'save-project': {
        const project = await videoStudioService.updateProject(data.projectId, {
          title: data.title,
          description: data.description,
          timelineData: data.timelineData,
          thumbnailUrl: data.thumbnailUrl,
        });
        return NextResponse.json({
          success: true,
          action: 'save-project',
          project,
          message: 'Project saved'
        });
      }

      case 'auto-save': {
        await videoStudioService.autoSaveProject(data.projectId, data.timelineData);
        return NextResponse.json({
          success: true,
          action: 'auto-save',
          message: 'Auto-saved'
        });
      }

      case 'start-render': {
        const job = await videoStudioService.startRender(
          data.projectId,
          user.id,
          {
            format: data.format,
            quality: data.quality,
            resolution: data.resolution,
            fps: data.fps,
            codec: data.codec,
            watermark: data.watermark,
          }
        );
        return NextResponse.json({
          success: true,
          action: 'start-render',
          job,
          message: 'Render job started'
        });
      }

      case 'generate-captions': {
        const captions = await videoStudioService.generateCaptions(
          data.videoId,
          user.id,
          {
            language: data.language,
            format: data.format,
            translate: data.translate,
            targetLanguage: data.targetLanguage,
          }
        );
        return NextResponse.json({
          success: true,
          action: 'generate-captions',
          captions,
          message: 'Captions generated'
        });
      }

      case 'create-share': {
        const share = await videoStudioService.createShareLink(
          data.videoId,
          user.id,
          {
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            password: data.password,
            allowDownload: data.allowDownload,
            allowComments: data.allowComments,
          }
        );
        return NextResponse.json({
          success: true,
          action: 'create-share',
          share,
          message: 'Share link created'
        });
      }

      case 'add-comment': {
        const comment = await videoStudioService.addComment(
          data.videoId,
          user.id,
          data.content,
          data.timestampSeconds,
          data.parentCommentId
        );
        return NextResponse.json({
          success: true,
          action: 'add-comment',
          comment,
          message: 'Comment added'
        });
      }

      case 'track-view': {
        await videoStudioService.trackView(data.videoId, {
          viewerId: user.id,
          sessionId: data.sessionId,
          userAgent: request.headers.get('user-agent') || undefined,
          referrer: data.referrer,
          shareId: data.shareId,
        });
        return NextResponse.json({
          success: true,
          action: 'track-view',
          message: 'View tracked'
        });
      }

      case 'mux-webhook': {
        // Handle Mux webhook events
        const eventType = data.type;
        const eventData = data.data;

        switch (eventType) {
          case 'video.asset.ready':
            await videoStudioService.handleVideoReady(eventData.id, eventData);
            break;
          case 'video.asset.errored':
            // Handle error
            logger.error('Mux asset error', { eventData });
            break;
          // Add more event handlers as needed
        }

        return NextResponse.json({ success: true, received: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('POST operation failed', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  // PATCH is an alias for PUT - both support partial updates
  return PUT(request)
}

// =====================================================
// PUT - Update video or project
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, projectId, ...updates } = body;

    if (videoId) {
      const video = await videoStudioService.updateVideo(videoId, updates);
      return NextResponse.json({
        success: true,
        video,
        message: 'Video updated successfully'
      });
    }

    if (projectId) {
      const project = await videoStudioService.updateProject(projectId, updates);
      return NextResponse.json({
        success: true,
        project,
        message: 'Project updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Video ID or Project ID required' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to update', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete video, project, or share
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const projectId = searchParams.get('projectId');
    const shareId = searchParams.get('shareId');

    if (videoId) {
      await videoStudioService.deleteVideo(videoId);
      return NextResponse.json({
        success: true,
        message: 'Video deleted successfully'
      });
    }

    if (projectId) {
      await videoStudioService.deleteProject(projectId);
      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully'
      });
    }

    if (shareId) {
      await videoStudioService.revokeShareLink(shareId);
      return NextResponse.json({
        success: true,
        message: 'Share link revoked'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to delete', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// DEMO MODE HANDLERS
// =====================================================
function handleDemoGet(action: string | null, videoId: string | null): NextResponse {
  const mockVideos = [
    {
      id: 'demo-video-1',
      title: 'Product Demo Video',
      description: 'A demo video showcasing product features',
      status: 'ready',
      visibility: 'public',
      duration: 120.5,
      thumbnailUrl: '/demo/video-thumb-1.jpg',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-video-2',
      title: 'Tutorial: Getting Started',
      description: 'Learn how to use our platform',
      status: 'ready',
      visibility: 'public',
      duration: 300.0,
      thumbnailUrl: '/demo/video-thumb-2.jpg',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  switch (action) {
    case 'get':
      return NextResponse.json({
        success: true,
        video: mockVideos[0],
        message: 'Demo video loaded'
      });
    case 'analytics':
      return NextResponse.json({
        success: true,
        analytics: {
          totalViews: 1250,
          uniqueViewers: 890,
          averageWatchTime: 145.5,
          completionRate: 0.72,
          engagement: { likes: 45, comments: 12, shares: 8 }
        },
        message: 'Demo analytics'
      });
    default:
      return NextResponse.json({
        success: true,
        videos: mockVideos,
        total: mockVideos.length,
        page: 1,
        limit: 20,
        message: 'Demo videos loaded'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'create-video':
      return NextResponse.json({
        success: true,
        action: 'create-video',
        video: {
          id: 'demo-new-video',
          title: data.title || 'New Video',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        message: 'Demo video created (demo mode)'
      });
    case 'create-upload':
      return NextResponse.json({
        success: true,
        action: 'create-upload',
        uploadId: 'demo-upload-id',
        uploadUrl: 'https://demo.example.com/upload',
        message: 'Demo upload URL (demo mode)'
      });
    case 'add-comment':
      return NextResponse.json({
        success: true,
        action: 'add-comment',
        comment: {
          id: 'demo-comment',
          content: data.content,
          timestampSeconds: data.timestampSeconds,
          createdAt: new Date().toISOString(),
        },
        message: 'Demo comment added (demo mode)'
      });
    default:
      return NextResponse.json({
        success: false,
        error: 'Please log in to use this feature'
      }, { status: 401 });
  }
}
