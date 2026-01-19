/**
 * Video Review Player - FreeFlow A+++ Implementation
 * Frame.io-style video player with comments overlay
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Pencil,
  MousePointer,
  Square,
  Circle,
  ArrowRight,
  Type,
  Settings,
  Download,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useVideoPlayerState,
  useDrawingTools,
  type DrawingTool,
} from '@/lib/hooks/use-video-comments';
import {
  formatDuration,
  msToSMPTE,
  type VideoComment,
  type VideoAsset,
} from '@/lib/video/frame-comments';
import { DrawingCanvas } from './drawing-canvas';

interface VideoReviewPlayerProps {
  video: VideoAsset;
  comments: VideoComment[];
  onTimeUpdate?: (timeMs: number, frame: number) => void;
  onCommentClick?: (comment: VideoComment) => void;
  onCreateComment?: (timeMs: number, annotation?: { x: number; y: number }) => void;
  onDrawingComplete?: (
    drawingData: { strokes: Array<{ points: Array<{ x: number; y: number }>; color: string; width: number }> }
  ) => void;
  activeCommentId?: string | null;
  showAnnotations?: boolean;
  showCommentIndicators?: boolean;
  className?: string;
}

export function VideoReviewPlayer({
  video,
  comments,
  onTimeUpdate,
  onCommentClick,
  onCreateComment,
  onDrawingComplete,
  activeCommentId,
  showAnnotations = true,
  showCommentIndicators = true,
  className,
}: VideoReviewPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    state: playerState,
    setVideoRef,
    togglePlay,
    seek,
    stepFrame,
    setPlaybackRate,
    setVolume,
    toggleMute,
    toggleFullscreen,
  } = useVideoPlayerState(video.frameRate);

  const drawingTools = useDrawingTools();

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (playerState.isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playerState.isPlaying]);

  // Notify parent of time updates
  useEffect(() => {
    onTimeUpdate?.(playerState.currentTime, playerState.currentFrame);
  }, [playerState.currentTime, playerState.currentFrame, onTimeUpdate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          seek(Math.max(0, playerState.currentTime - 5000));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(playerState.duration, playerState.currentTime + 5000));
          break;
        case ',':
          e.preventDefault();
          stepFrame(-1);
          break;
        case '.':
          e.preventDefault();
          stepFrame(1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
          if (!isAnnotating) {
            onCreateComment?.(playerState.currentTime);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, stepFrame, toggleFullscreen, toggleMute, playerState, isAnnotating, onCreateComment]);

  const handleVideoClick = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      if (isAnnotating && onCreateComment) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onCreateComment(playerState.currentTime, { x, y });
      } else {
        togglePlay();
      }
    },
    [isAnnotating, onCreateComment, playerState.currentTime, togglePlay]
  );

  const handleSeek = useCallback(
    (value: number[]) => {
      seek(value[0]);
    },
    [seek]
  );

  // Filter comments at current time (within 2 second window)
  const visibleComments = comments.filter(
    (c) =>
      c.timestampMs >= playerState.currentTime - 1000 &&
      c.timestampMs <= playerState.currentTime + 1000 &&
      c.annotation
  );

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  const toolButtons: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { tool: 'select', icon: <MousePointer className="h-4 w-4" />, label: 'Select' },
    { tool: 'pen', icon: <Pencil className="h-4 w-4" />, label: 'Pen' },
    { tool: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
    { tool: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
    { tool: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
    { tool: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  ];

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black rounded-lg overflow-hidden group',
          className
        )}
      >
        {/* Video Element */}
        <video
          ref={setVideoRef}
          src={video.fileUrl}
          className="w-full h-full object-contain"
          onClick={handleVideoClick}
          playsInline
          poster={video.thumbnailUrl}
        />

        {/* Annotation Overlay */}
        {showAnnotations && visibleComments.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {visibleComments.map((comment) =>
              comment.annotation?.point ? (
                <div
                  key={comment.id}
                  className={cn(
                    'absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 cursor-pointer pointer-events-auto',
                    'transition-all duration-200',
                    comment.id === activeCommentId
                      ? 'bg-primary border-primary scale-125'
                      : 'bg-red-500 border-white hover:scale-110'
                  )}
                  style={{
                    left: `${comment.annotation.point.x}%`,
                    top: `${comment.annotation.point.y}%`,
                  }}
                  onClick={() => onCommentClick?.(comment)}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black/75 px-1 rounded whitespace-nowrap">
                    {comment.user?.name?.split(' ')[0]}
                  </span>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Drawing Canvas */}
        {isAnnotating && (
          <DrawingCanvas
            tool={drawingTools.tool}
            color={drawingTools.color}
            strokeWidth={drawingTools.strokeWidth}
            onDrawingComplete={(drawing) => {
              onDrawingComplete?.(drawing);
              setIsAnnotating(false);
            }}
            width={video.width || 1920}
            height={video.height || 1080}
          />
        )}

        {/* Comment Indicators on Timeline */}
        {showCommentIndicators && playerState.duration > 0 && (
          <div className="absolute bottom-16 left-4 right-4 h-1">
            {comments.map((comment) => (
              <Tooltip key={comment.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'absolute w-2 h-2 -mt-0.5 rounded-full cursor-pointer',
                      comment.status === 'resolved'
                        ? 'bg-green-500'
                        : comment.priority === 2
                        ? 'bg-red-500'
                        : comment.priority === 1
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    )}
                    style={{
                      left: `${(comment.timestampMs / playerState.duration) * 100}%`,
                    }}
                    onClick={() => {
                      seek(comment.timestampMs);
                      onCommentClick?.(comment);
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">{comment.user?.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {comment.content}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent',
            'transition-opacity duration-300',
            showControls || !playerState.isPlaying ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <Slider
              value={[playerState.currentTime]}
              min={0}
              max={playerState.duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {playerState.isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {playerState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                </TooltipContent>
              </Tooltip>

              {/* Frame Navigation */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => stepFrame(-1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous Frame (,)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => stepFrame(1)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next Frame (.)</TooltipContent>
              </Tooltip>

              {/* Time Display */}
              <div className="text-white text-sm font-mono ml-2">
                <span>{formatDuration(playerState.currentTime)}</span>
                <span className="text-white/50"> / </span>
                <span>{formatDuration(playerState.duration)}</span>
              </div>

              {/* SMPTE Timecode */}
              <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {msToSMPTE(playerState.currentTime, video.frameRate)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Drawing Tools (when annotating) */}
              {isAnnotating && (
                <div className="flex items-center gap-1 mr-4 bg-black/50 rounded-lg p-1">
                  {toolButtons.map(({ tool, icon, label }) => (
                    <Tooltip key={tool}>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={drawingTools.tool === tool}
                          onPressedChange={() => drawingTools.setTool(tool)}
                          className="data-[state=on]:bg-primary"
                        >
                          {icon}
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                  ))}
                  <input
                    type="color"
                    value={drawingTools.color}
                    onChange={(e) => drawingTools.setColor(e.target.value)}
                    className="w-8 h-8 cursor-pointer rounded border-0"
                  />
                </div>
              )}

              {/* Annotation Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={isAnnotating}
                    onPressedChange={setIsAnnotating}
                    className="text-white hover:bg-white/20 data-[state=on]:bg-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  {isAnnotating ? 'Exit Annotation Mode' : 'Annotate'}
                </TooltipContent>
              </Tooltip>

              {/* Add Comment */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => onCreateComment?.(playerState.currentTime)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Comment (C)</TooltipContent>
              </Tooltip>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {playerState.isMuted || playerState.volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mute (M)</TooltipContent>
                </Tooltip>
                <Slider
                  value={[playerState.isMuted ? 0 : playerState.volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setVolume(v[0] / 100)}
                  className="w-20"
                />
              </div>

              {/* Playback Rate */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {playerState.playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {playbackRates.map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  {video.allowDownloads && (
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fullscreen (F)</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Big Play Button (when paused) */}
        {!playerState.isPlaying && !isAnnotating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={togglePlay}
            >
              <Play className="h-10 w-10 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
