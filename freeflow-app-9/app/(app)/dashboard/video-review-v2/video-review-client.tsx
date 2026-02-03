/**
 * Video Review Client - FreeFlow A+++ Implementation
 * Comprehensive Frame.io-style video review interface
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Share2,
  Settings,
  MessageSquare,
  Clock,
  Pencil,
  Users,
  CheckCircle2,
  XCircle,
  FileVideo,
  Plus,
  Filter,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  Layers,
  Flag,
  Upload,
  MoreVertical,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';


import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  DrawingCanvas,
  VideoTimeline,
  ReviewWorkflow,
  FrameComment,
} from '@/components/video';


import {
  VideoComment,
  VideoMarker,
  VideoAsset,
  VideoReviewSession,
  msToSMPTE,
  formatDuration,
  CommentPriority,
} from '@/lib/video/frame-comments';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Demo video for development/preview
const DEMO_VIDEO: VideoAsset = {
  id: 'demo-video-1',
  userId: 'demo-user',
  title: 'Product Demo Video',
  description: 'A comprehensive product demonstration showcasing new features',
  fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  durationMs: 596000,
  frameRate: 24,
  width: 1920,
  height: 1080,
  fileSize: 158008374,
  mimeType: 'video/mp4',
  reviewStatus: 'in_progress',
  isPublic: true,
  allowComments: true,
  allowDownloads: true,
  version: 1,
  tags: ['demo', 'product', 'feature'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo comments for development
const DEMO_COMMENTS: VideoComment[] = [
  {
    id: 'comment-1',
    videoId: 'demo-video-1',
    userId: 'user-1',
    timestampMs: 15000,
    frameNumber: 360,
    content: 'The transition here could be smoother. Consider adding a fade effect.',
    commentType: 'point',
    status: 'active',
    mentionedUsers: [],
    priority: 1 as CommentPriority,
    tags: ['transition', 'feedback'],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    replies: [],
    reactionCounts: { '👍': 3, '🔥': 1 },
  },
  {
    id: 'comment-2',
    videoId: 'demo-video-1',
    userId: 'user-2',
    timestampMs: 45000,
    frameNumber: 1080,
    content: 'Love this shot! Great composition and lighting.',
    commentType: 'region',
    status: 'active',
    annotation: {
      type: 'region',
      region: { x: 0.2, y: 0.3, width: 0.4, height: 0.3 },
    },
    mentionedUsers: [],
    priority: 0 as CommentPriority,
    tags: ['positive', 'composition'],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: 'user-2',
      name: 'Mike Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    replies: [],
    reactionCounts: { '❤️': 5 },
  },
  {
    id: 'comment-3',
    videoId: 'demo-video-1',
    userId: 'user-3',
    timestampMs: 120000,
    frameNumber: 2880,
    content: 'Critical: The audio levels are too high here. Please reduce by 3dB.',
    commentType: 'text',
    status: 'active',
    mentionedUsers: ['user-1'],
    priority: 2 as CommentPriority,
    tags: ['audio', 'critical'],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    user: {
      id: 'user-3',
      name: 'Alex Rivera',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    replies: [
      {
        id: 'reply-1',
        videoId: 'demo-video-1',
        userId: 'user-1',
        parentId: 'comment-3',
        timestampMs: 120000,
        frameNumber: 2880,
        content: 'Good catch! I\'ll fix this in the next revision.',
        commentType: 'text',
        status: 'active',
        mentionedUsers: [],
        priority: 0 as CommentPriority,
        tags: [],
        createdAt: new Date(Date.now() - 1200000).toISOString(),
        updatedAt: new Date(Date.now() - 1200000).toISOString(),
        user: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
      },
    ],
    reactionCounts: { '✅': 2 },
  },
  {
    id: 'comment-4',
    videoId: 'demo-video-1',
    userId: 'user-2',
    timestampMs: 180000,
    frameNumber: 4320,
    content: 'This section is approved. Great work on the color grading.',
    commentType: 'point',
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 600000).toISOString(),
    resolvedBy: 'user-2',
    mentionedUsers: [],
    priority: 0 as CommentPriority,
    tags: ['approved', 'color'],
    createdAt: new Date(Date.now() - 3000000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    user: {
      id: 'user-2',
      name: 'Mike Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    replies: [],
    reactionCounts: { '🎉': 4 },
  },
];

// Demo markers
const DEMO_MARKERS: VideoMarker[] = [
  {
    id: 'marker-1',
    videoId: 'demo-video-1',
    userId: 'user-1',
    timestampMs: 0,
    title: 'Intro',
    description: 'Opening sequence',
    color: '#3b82f6',
    markerType: 'chapter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'marker-2',
    videoId: 'demo-video-1',
    userId: 'user-1',
    timestampMs: 60000,
    title: 'Feature Overview',
    description: 'Main features presentation',
    color: '#10b981',
    markerType: 'chapter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'marker-3',
    videoId: 'demo-video-1',
    userId: 'user-1',
    timestampMs: 180000,
    title: 'Demo Section',
    description: 'Live demonstration',
    color: '#f59e0b',
    markerType: 'chapter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'marker-4',
    videoId: 'demo-video-1',
    userId: 'user-2',
    timestampMs: 95000,
    title: 'Review this',
    description: 'Needs attention',
    color: '#ef4444',
    markerType: 'bookmark',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Demo review session
const DEMO_REVIEW_SESSION: VideoReviewSession = {
  id: 'session-1',
  videoId: 'demo-video-1',
  createdBy: 'user-1',
  title: 'Product Demo Review - Round 2',
  description: 'Final review before client presentation',
  status: 'in_progress',
  dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  requiredApprovers: 3,
  approvalCount: 1,
  isPublic: false,
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export function VideoReviewClient() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('id') || 'demo-video-1';

  // State
  const [video] = useState<VideoAsset>(DEMO_VIDEO);
  const [comments, setComments] = useState<VideoComment[]>(DEMO_COMMENTS);
  const [markers] = useState<VideoMarker[]>(DEMO_MARKERS);
  const [reviewSession] = useState<VideoReviewSession>(DEMO_REVIEW_SESSION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationMs);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedComment, setSelectedComment] = useState<VideoComment | null>(null);
  const [activeTab, setActiveTab] = useState('comments');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'created' | 'priority'>('timestamp');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentPriority, setNewCommentPriority] = useState<CommentPriority>(0);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    requiredApprovers: 2,
    isPublic: false
  });
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    notes: '',
    notifyReviewers: true
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and sort comments
  const filteredComments = comments
    .filter(comment => {
      if (filterStatus === 'active') return comment.status === 'active';
      if (filterStatus === 'resolved') return comment.status === 'resolved';
      return true;
    })
    .filter(comment => {
      if (!searchQuery) return true;
      return comment.content.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return a.timestampMs - b.timestampMs;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          return b.priority - a.priority;
        default:
          return 0;
      }
    });

  // Video controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seek = useCallback((timeMs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeMs / 1000;
      setCurrentTime(timeMs);
    }
  }, []);

  const seekFrame = useCallback((direction: 'forward' | 'backward') => {
    const frameDuration = 1000 / video.frameRate;
    const newTime = direction === 'forward'
      ? currentTime + frameDuration
      : currentTime - frameDuration;
    seek(Math.max(0, Math.min(duration, newTime)));
  }, [currentTime, duration, video.frameRate, seek]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  // Handle video time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime * 1000);
    }
  }, []);

  // Handle video loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration * 1000);
    }
  }, []);

  // Create new comment
  const handleCreateComment = useCallback(() => {
    if (!newCommentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    const newComment: VideoComment = {
      id: `comment-${Date.now()}`,
      videoId: video.id,
      userId: 'current-user',
      timestampMs: currentTime,
      frameNumber: Math.floor((currentTime / 1000) * video.frameRate),
      content: newCommentContent.trim(),
      commentType: 'point',
      status: 'active',
      mentionedUsers: [],
      priority: newCommentPriority,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'current-user',
        name: 'You',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      },
      replies: [],
      reactionCounts: {},
    };

    setComments(prev => [...prev, newComment]);
    setNewCommentContent('');
    setNewCommentPriority(0);
    toast.success('Comment added');
  }, [newCommentContent, newCommentPriority, currentTime, video]);

  // Resolve comment
  const handleResolve = useCallback((commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          status: c.status === 'resolved' ? 'active' : 'resolved',
          resolvedAt: c.status === 'resolved' ? undefined : new Date().toISOString(),
          resolvedBy: c.status === 'resolved' ? undefined : 'current-user',
        };
      }
      return c;
    }));
    toast.success('Comment status updated');
  }, []);

  // Delete comment
  const handleDelete = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.success('Comment deleted');
  }, []);

  // Toggle reaction
  const handleReaction = useCallback((commentId: string, emoji: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const counts = { ...c.reactionCounts };
        counts[emoji] = (counts[emoji] || 0) + 1;
        return { ...c, reactionCounts: counts };
      }
      return c;
    }));
  }, []);

  // Create review session
  const handleCreateSession = useCallback(async () => {
    if (!newSessionForm.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }

    toast.loading('Creating review session...', { id: 'create-session' });
    await new Promise(resolve => setTimeout(resolve, 1200));

    toast.success('Review session created!', {
      id: 'create-session',
      description: `"${newSessionForm.title}" is ready for reviewers`
    });
    setShowCreateSessionDialog(false);
    setNewSessionForm({
      title: '',
      description: '',
      dueDate: '',
      requiredApprovers: 2,
      isPublic: false
    });
  }, [newSessionForm]);

  // Upload new version
  const handleUploadVersion = useCallback(async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploadingVersion(true);
    toast.loading('Uploading new version...', { id: 'upload-version' });

    // Simulate file upload progress
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('New version uploaded!', {
      id: 'upload-version',
      description: `Version ${video.version + 1} is now available`
    });

    setUploadingVersion(false);
    setShowUploadDialog(false);
    setShowVersions(false);
    setUploadForm({ file: null, notes: '', notifyReviewers: true });
  }, [uploadForm, video.version]);

  // Compare versions
  const handleCompareVersions = useCallback(async () => {
    toast.loading('Loading version comparison...', { id: 'compare-versions' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowCompareDialog(true);
    toast.dismiss('compare-versions');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            seek(Math.max(0, currentTime - 10000));
          } else {
            seek(Math.max(0, currentTime - 5000));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            seek(Math.min(duration, currentTime + 10000));
          } else {
            seek(Math.min(duration, currentTime + 5000));
          }
          break;
        case ',':
          e.preventDefault();
          seekFrame('backward');
          break;
        case '.':
          e.preventDefault();
          seekFrame('forward');
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'a':
          setShowAnnotations(prev => !prev);
          break;
        case 'd':
          setIsDrawingMode(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, seekFrame, toggleMute, toggleFullscreen, currentTime, duration]);

  // Stats
  const activeCount = comments.filter(c => c.status === 'active').length;
  const resolvedCount = comments.filter(c => c.status === 'resolved').length;
  const criticalCount = comments.filter(c => c.priority === 2).length;

  return (
    <div className="flex flex-col h-screen bg-background" ref={containerRef}>
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{video.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <FileVideo className="h-3 w-3" />
                v{video.version}
              </Badge>
              <span>•</span>
              <span>{formatDuration(video.durationMs)}</span>
              <span>•</span>
              <span>{video.frameRate}fps</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={reviewSession.status === 'approved' ? 'default' : 'secondary'} className="gap-1">
            {reviewSession.status === 'approved' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : reviewSession.status === 'rejected' ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {reviewSession.status.replace('_', ' ')}
          </Badge>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Share link copied')}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            // Generate video review data for download
            const reviewData = JSON.stringify({
              type: 'video-review',
              title: 'Video Review Session',
              downloadedAt: new Date().toISOString(),
              format: 'mp4',
              comments: [],
              annotations: [],
              metadata: {
                source: 'FreeFlow Video Review',
                version: '2.0'
              }
            }, null, 2)
            const blob = new Blob([reviewData], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `video-review-${Date.now()}.json`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Video downloaded')
          }}>
            <Download className="h-4 w-4" />
            Download
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowVersions(true)}>
                <Layers className="h-4 w-4 mr-2" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Section */}
        <div className={cn('flex-1 flex flex-col', showSidebar ? 'mr-[400px]' : '')}>
          {/* Video Container */}
          <div className="relative flex-1 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={video.fileUrl}
              className="max-h-full max-w-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
            />

            {/* Annotation Overlay */}
            {showAnnotations && (
              <div className="absolute inset-0 pointer-events-none">
                {filteredComments
                  .filter(c => Math.abs(c.timestampMs - currentTime) < 1000)
                  .map(comment => (
                    comment.annotation?.region && (
                      <div
                        key={comment.id}
                        className="absolute border-2 border-primary rounded"
                        style={{
                          left: `${comment.annotation.region.x * 100}%`,
                          top: `${comment.annotation.region.y * 100}%`,
                          width: `${comment.annotation.region.width * 100}%`,
                          height: `${comment.annotation.region.height * 100}%`,
                        }}
                      />
                    )
                  ))}
              </div>
            )}

            {/* Drawing Canvas */}
            {isDrawingMode && (
              <DrawingCanvas
                width={video.width || 1920}
                height={video.height || 1080}
                onSave={(drawing) => {
                  logger.debug('Drawing saved', { drawing });
                  setIsDrawingMode(false);
                }}
                onCancel={() => setIsDrawingMode(false)}
              />
            )}

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 w-full h-full bg-black/20 hover:bg-black/30"
                onClick={togglePlay}
              >
                <Play className="h-16 w-16 text-white" />
              </Button>
            )}
          </div>

          {/* Video Controls */}
          <div className="border-t bg-card p-4 space-y-3">
            {/* Timeline */}
            <VideoTimeline
              video={video}
              currentTimeMs={currentTime}
              comments={filteredComments}
              markers={markers}
              onSeek={seek}
              onCommentClick={(comment) => {
                setSelectedComment(comment);
                seek(comment.timestampMs);
              }}
            />

            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => seek(0)}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => seekFrame('backward')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => seekFrame('forward')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => seek(duration)}>
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-2" />

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    className="w-24"
                    onValueChange={([v]) => {
                      setVolume(v / 100);
                      setIsMuted(v === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = v / 100;
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-primary">{msToSMPTE(currentTime, video.frameRate)}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{msToSMPTE(duration, video.frameRate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={showAnnotations ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                >
                  {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isDrawingMode ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn(
          'fixed right-0 top-[57px] bottom-0 w-[400px] border-l bg-card flex flex-col transition-transform',
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
            {/* Sidebar Header */}
            <div className="border-b p-4">
              <TabsList className="w-full">
                <TabsTrigger value="comments" className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                  <Badge variant="secondary" className="ml-1">{comments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex-1 gap-2">
                  <Users className="h-4 w-4" />
                  Review
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Sidebar Content */}
            <TabsContent value="comments" className="flex-1 flex flex-col m-0">
            {/* Stats Bar */}
            <div className="flex items-center gap-4 px-4 py-2 border-b text-sm">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{activeCount}</span> active
              </span>
              <span className="text-muted-foreground">
                <span className="font-medium text-green-600">{resolvedCount}</span> resolved
              </span>
              {criticalCount > 0 && (
                <span className="text-muted-foreground">
                  <span className="font-medium text-red-600">{criticalCount}</span> critical
                </span>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-4 border-b">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger className="w-28">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-28">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">Time</SelectItem>
                  <SelectItem value="created">Newest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredComments.map(comment => (
                  <FrameComment
                    key={comment.id}
                    comment={comment}
                    frameRate={video.frameRate}
                    isActive={Math.abs(comment.timestampMs - currentTime) < 1000}
                    isSelected={selectedComment?.id === comment.id}
                    onSelect={(c) => {
                      setSelectedComment(c);
                      seek(c.timestampMs);
                    }}
                    onSeek={seek}
                    onResolve={handleResolve}
                    onDelete={handleDelete}
                    onReaction={handleReaction}
                  />
                ))}

                {filteredComments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No comments yet</p>
                    <p className="text-sm">Click on the video to add a comment</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* New Comment */}
            <div className="border-t p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{msToSMPTE(currentTime, video.frameRate)}</span>
              </div>
              <Textarea
                placeholder="Add a comment at this timestamp..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <Select
                  value={String(newCommentPriority)}
                  onValueChange={(v) => setNewCommentPriority(Number(v) as CommentPriority)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">Important</SelectItem>
                    <SelectItem value="2">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateComment} disabled={!newCommentContent.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
            </TabsContent>

            <TabsContent value="workflow" className="flex-1 m-0 p-4 overflow-auto">
              <ReviewWorkflow
                session={reviewSession}
                onCreateSession={() => setShowCreateSessionDialog(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              Compare and manage different versions of this video
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>Current</Badge>
                    <CardTitle className="text-base">Version {video.version}</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(video.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Latest version with all feedback addressed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Version 0</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Original upload
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleCompareVersions}>
                    Compare
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success('Version restored')}>
                    Restore
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersions(false)}>
              Close
            </Button>
            <Button className="gap-2" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4" />
              Upload New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Review Session Dialog */}
      <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Review Session</DialogTitle>
            <DialogDescription>
              Set up a new review session for this video
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Title</label>
              <Input
                placeholder="e.g., Final Review - Round 3"
                value={newSessionForm.title}
                onChange={(e) => setNewSessionForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe the purpose of this review session..."
                value={newSessionForm.description}
                onChange={(e) => setNewSessionForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newSessionForm.dueDate}
                  onChange={(e) => setNewSessionForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Approvers</label>
                <Select
                  value={String(newSessionForm.requiredApprovers)}
                  onValueChange={(v) => setNewSessionForm(prev => ({ ...prev, requiredApprovers: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Approver</SelectItem>
                    <SelectItem value="2">2 Approvers</SelectItem>
                    <SelectItem value="3">3 Approvers</SelectItem>
                    <SelectItem value="4">4 Approvers</SelectItem>
                    <SelectItem value="5">5 Approvers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public-session"
                checked={newSessionForm.isPublic}
                onChange={(e) => setNewSessionForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="public-session" className="text-sm">
                Make this session public (accessible via link)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSessionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>
              Create Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload New Version Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Version</DialogTitle>
            <DialogDescription>
              Upload a new version of this video (Version {video.version + 1})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                {uploadForm.file ? uploadForm.file.name : 'Drag and drop or click to upload'}
              </p>
              <Input
                type="file"
                accept="video/*"
                className="hidden"
                id="version-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadForm(prev => ({ ...prev, file }));
                  }
                }}
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="version-upload" className="cursor-pointer">
                  Select File
                </label>
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Version Notes</label>
              <Textarea
                placeholder="Describe what changed in this version..."
                value={uploadForm.notes}
                onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notify-reviewers"
                checked={uploadForm.notifyReviewers}
                onChange={(e) => setUploadForm(prev => ({ ...prev, notifyReviewers: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="notify-reviewers" className="text-sm">
                Notify all reviewers about this new version
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadVersion} disabled={uploadingVersion || !uploadForm.file}>
              {uploadingVersion ? 'Uploading...' : 'Upload Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>
              Side-by-side comparison of video versions
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Version 0</Badge>
                  <span className="text-sm text-muted-foreground">Original</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(video.durationMs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span>{video.width}x{video.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frame Rate:</span>
                    <span>{video.frameRate} fps</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge>Version {video.version}</Badge>
                  <span className="text-sm text-muted-foreground">Current</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(video.durationMs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span>{video.width}x{video.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frame Rate:</span>
                    <span>{video.frameRate} fps</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Changes Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Audio levels adjusted (-3dB)</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Transition effects improved</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Color grading finalized</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>2 comments addressed, 1 pending</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Opening diff viewer', { description: 'Frame-by-frame comparison loading...' });
            }}>
              <Layers className="h-4 w-4 mr-2" />
              Open Diff Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VideoReviewClient;
