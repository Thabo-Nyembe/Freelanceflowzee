/**
 * Video Comments Hooks - FreeFlow A+++ Implementation
 * React Query hooks for frame-accurate video comments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  VideoComment,
  VideoAsset,
  VideoMarker,
  VideoReviewSession,
  ReviewParticipant,
  CommentFilters,
  CommentSortField,
  DrawingData,
  Annotation,
  CommentPriority,
} from '@/lib/video/frame-comments';

// =====================================================
// QUERY KEYS
// =====================================================

export const videoCommentsKeys = {
  all: ['video-comments'] as const,
  videos: () => [...videoCommentsKeys.all, 'videos'] as const,
  video: (id: string) => [...videoCommentsKeys.videos(), id] as const,
  comments: (videoId: string) => [...videoCommentsKeys.video(videoId), 'comments'] as const,
  commentsFiltered: (videoId: string, filters: CommentFilters) =>
    [...videoCommentsKeys.comments(videoId), filters] as const,
  markers: (videoId: string) => [...videoCommentsKeys.video(videoId), 'markers'] as const,
  sessions: () => [...videoCommentsKeys.all, 'sessions'] as const,
  session: (id: string) => [...videoCommentsKeys.sessions(), id] as const,
};

// =====================================================
// VIDEO COMMENTS HOOK
// =====================================================

interface UseVideoCommentsOptions {
  videoId: string;
  filters?: CommentFilters;
  sort?: CommentSortField;
  sortOrder?: 'asc' | 'desc';
  includeReplies?: boolean;
  enabled?: boolean;
}

export function useVideoComments({
  videoId,
  filters = {},
  sort = 'timestamp',
  sortOrder = 'asc',
  includeReplies = true,
  enabled = true,
}: UseVideoCommentsOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: videoCommentsKeys.commentsFiltered(videoId, filters),
    queryFn: async () => {
      const params = new URLSearchParams({
        video_id: videoId,
        parent_id: 'null', // Only root comments
        include_replies: String(includeReplies),
        sort,
        order: sortOrder,
      });

      // Add filters
      if (filters.status?.length) {
        params.set('status', filters.status[0]);
      }
      if (filters.priority?.length) {
        params.set('priority', String(filters.priority[0]));
      }
      if (filters.userId) {
        params.set('user_id', filters.userId);
      }
      if (filters.timeRange) {
        params.set('time_start', String(filters.timeRange.start));
        params.set('time_end', String(filters.timeRange.end));
      }

      const response = await fetch(`/api/video-comments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: enabled && !!videoId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!videoId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`video-comments:${videoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_comments',
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: videoCommentsKeys.comments(videoId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  return {
    comments: (query.data?.comments as VideoComment[]) || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =====================================================
// CREATE COMMENT MUTATION
// =====================================================

interface CreateCommentInput {
  videoId: string;
  parentId?: string;
  timestampMs: number;
  endTimestampMs?: number;
  content: string;
  commentType?: 'point' | 'region' | 'drawing' | 'text' | 'arrow' | 'audio';
  annotation?: Annotation;
  drawingData?: DrawingData;
  audioUrl?: string;
  audioDurationMs?: number;
  mentionedUsers?: string[];
  assignedTo?: string;
  priority?: CommentPriority;
  category?: string;
  tags?: string[];
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const response = await fetch('/api/video-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: input.videoId,
          parent_id: input.parentId,
          timestamp_ms: input.timestampMs,
          end_timestamp_ms: input.endTimestampMs,
          content: input.content,
          comment_type: input.commentType || 'point',
          annotation: input.annotation,
          drawing_data: input.drawingData,
          audio_url: input.audioUrl,
          audio_duration_ms: input.audioDurationMs,
          mentioned_users: input.mentionedUsers || [],
          assigned_to: input.assignedTo,
          priority: input.priority || 0,
          category: input.category,
          tags: input.tags || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.comments(variables.videoId),
      });
    },
  });
}

// =====================================================
// UPDATE COMMENT MUTATION
// =====================================================

interface UpdateCommentInput {
  id: string;
  videoId: string;
  content?: string;
  annotation?: Annotation;
  drawingData?: DrawingData;
  status?: 'active' | 'resolved' | 'archived';
  resolutionNotes?: string;
  priority?: CommentPriority;
  category?: string;
  tags?: string[];
  assignedTo?: string | null;
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCommentInput) => {
      const response = await fetch('/api/video-comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: input.id,
          content: input.content,
          annotation: input.annotation,
          drawing_data: input.drawingData,
          status: input.status,
          resolution_notes: input.resolutionNotes,
          priority: input.priority,
          category: input.category,
          tags: input.tags,
          assigned_to: input.assignedTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.comments(variables.videoId),
      });
    },
  });
}

// =====================================================
// DELETE COMMENT MUTATION
// =====================================================

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, videoId }: { id: string; videoId: string }) => {
      const response = await fetch(`/api/video-comments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.comments(variables.videoId),
      });
    },
  });
}

// =====================================================
// COMMENT REACTIONS
// =====================================================

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      emoji,
      videoId,
    }: {
      commentId: string;
      emoji: string;
      videoId: string;
    }) => {
      const response = await fetch(`/api/video-comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle reaction');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.comments(variables.videoId),
      });
    },
  });
}

// =====================================================
// VIDEO MARKERS HOOK
// =====================================================

export function useVideoMarkers(videoId: string, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: videoCommentsKeys.markers(videoId),
    queryFn: async () => {
      const response = await fetch(`/api/video-markers?video_id=${videoId}`);
      if (!response.ok) throw new Error('Failed to fetch markers');
      return response.json();
    },
    enabled: enabled && !!videoId,
  });

  return {
    markers: (query.data?.markers as VideoMarker[]) || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateMarker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      videoId: string;
      timestampMs: number;
      durationMs?: number;
      title: string;
      description?: string;
      color?: string;
      icon?: string;
      markerType?: 'bookmark' | 'chapter' | 'note' | 'todo';
    }) => {
      const response = await fetch('/api/video-markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: input.videoId,
          timestamp_ms: input.timestampMs,
          duration_ms: input.durationMs,
          title: input.title,
          description: input.description,
          color: input.color || '#3B82F6',
          icon: input.icon,
          marker_type: input.markerType || 'bookmark',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create marker');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.markers(variables.videoId),
      });
    },
  });
}

// =====================================================
// REVIEW SESSIONS HOOKS
// =====================================================

interface UseReviewSessionsOptions {
  videoId?: string;
  status?: string;
  role?: 'creator' | 'participant';
}

export function useReviewSessions(options: UseReviewSessionsOptions = {}) {
  const query = useQuery({
    queryKey: [videoCommentsKeys.sessions(), options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.videoId) params.set('video_id', options.videoId);
      if (options.status) params.set('status', options.status);
      if (options.role) params.set('role', options.role);

      const response = await fetch(`/api/video-reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch review sessions');
      return response.json();
    },
  });

  return {
    sessions: (query.data?.sessions as VideoReviewSession[]) || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateReviewSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      videoId: string;
      title?: string;
      description?: string;
      dueDate?: string;
      requiredApprovers?: number;
      isPublic?: boolean;
      password?: string;
      participants?: Array<{
        userId?: string;
        email?: string;
        role?: 'reviewer' | 'approver' | 'viewer';
      }>;
    }) => {
      const response = await fetch('/api/video-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: input.videoId,
          title: input.title,
          description: input.description,
          due_date: input.dueDate,
          required_approvers: input.requiredApprovers || 1,
          is_public: input.isPublic || false,
          password: input.password,
          participants: input.participants || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review session');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.sessions(),
      });
    },
  });
}

export function useUpdateReviewSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      title?: string;
      description?: string;
      status?: string;
      dueDate?: string;
      requiredApprovers?: number;
      isPublic?: boolean;
    }) => {
      const response = await fetch('/api/video-reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: input.id,
          title: input.title,
          description: input.description,
          status: input.status,
          due_date: input.dueDate,
          required_approvers: input.requiredApprovers,
          is_public: input.isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review session');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: videoCommentsKeys.sessions(),
      });
    },
  });
}

// =====================================================
// VIDEO PLAYER STATE HOOK
// =====================================================

interface VideoPlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  currentFrame: number;
}

export function useVideoPlayerState(frameRate: number = 24) {
  const [state, setState] = useState<VideoPlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    currentFrame: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoRef = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;

    if (video) {
      const updateState = () => {
        setState((prev) => ({
          ...prev,
          currentTime: video.currentTime * 1000,
          duration: video.duration * 1000,
          isPlaying: !video.paused,
          playbackRate: video.playbackRate,
          volume: video.volume,
          isMuted: video.muted,
          currentFrame: Math.floor(video.currentTime * frameRate),
        }));
      };

      video.addEventListener('timeupdate', updateState);
      video.addEventListener('play', updateState);
      video.addEventListener('pause', updateState);
      video.addEventListener('volumechange', updateState);
      video.addEventListener('loadedmetadata', updateState);

      return () => {
        video.removeEventListener('timeupdate', updateState);
        video.removeEventListener('play', updateState);
        video.removeEventListener('pause', updateState);
        video.removeEventListener('volumechange', updateState);
        video.removeEventListener('loadedmetadata', updateState);
      };
    }
  }, [frameRate]);

  const play = useCallback(() => {
    videoRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const seek = useCallback((timeMs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeMs / 1000;
    }
  }, []);

  const seekToFrame = useCallback(
    (frame: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = frame / frameRate;
      }
    },
    [frameRate]
  );

  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      if (videoRef.current) {
        const newFrame = state.currentFrame + direction;
        videoRef.current.currentTime = newFrame / frameRate;
      }
    },
    [frameRate, state.currentFrame]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  return {
    state,
    setVideoRef,
    play,
    pause,
    togglePlay,
    seek,
    seekToFrame,
    stepFrame,
    setPlaybackRate,
    setVolume,
    toggleMute,
    toggleFullscreen,
  };
}

// =====================================================
// DRAWING TOOL STATE
// =====================================================

export type DrawingTool = 'select' | 'pen' | 'arrow' | 'rectangle' | 'circle' | 'text';

interface DrawingToolState {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  isDrawing: boolean;
}

export function useDrawingTools() {
  const [state, setState] = useState<DrawingToolState>({
    tool: 'select',
    color: '#FF0000',
    strokeWidth: 3,
    isDrawing: false,
  });

  const setTool = useCallback((tool: DrawingTool) => {
    setState((prev) => ({ ...prev, tool }));
  }, []);

  const setColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, color }));
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, strokeWidth: width }));
  }, []);

  const setIsDrawing = useCallback((isDrawing: boolean) => {
    setState((prev) => ({ ...prev, isDrawing }));
  }, []);

  return {
    ...state,
    setTool,
    setColor,
    setStrokeWidth,
    setIsDrawing,
  };
}

// =====================================================
// COMMENT NAVIGATION
// =====================================================

export function useCommentNavigation(comments: VideoComment[], seek: (ms: number) => void) {
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const sortedComments = [...comments].sort((a, b) => a.timestampMs - b.timestampMs);

  const goToNextComment = useCallback(() => {
    if (sortedComments.length === 0) return;

    const currentIndex = activeCommentId
      ? sortedComments.findIndex((c) => c.id === activeCommentId)
      : -1;

    const nextIndex = (currentIndex + 1) % sortedComments.length;
    const nextComment = sortedComments[nextIndex];

    setActiveCommentId(nextComment.id);
    seek(nextComment.timestampMs);
  }, [sortedComments, activeCommentId, seek]);

  const goToPreviousComment = useCallback(() => {
    if (sortedComments.length === 0) return;

    const currentIndex = activeCommentId
      ? sortedComments.findIndex((c) => c.id === activeCommentId)
      : 0;

    const prevIndex = (currentIndex - 1 + sortedComments.length) % sortedComments.length;
    const prevComment = sortedComments[prevIndex];

    setActiveCommentId(prevComment.id);
    seek(prevComment.timestampMs);
  }, [sortedComments, activeCommentId, seek]);

  const goToComment = useCallback(
    (commentId: string) => {
      const comment = sortedComments.find((c) => c.id === commentId);
      if (comment) {
        setActiveCommentId(commentId);
        seek(comment.timestampMs);
      }
    },
    [sortedComments, seek]
  );

  return {
    activeCommentId,
    setActiveCommentId,
    goToNextComment,
    goToPreviousComment,
    goToComment,
    sortedComments,
  };
}
