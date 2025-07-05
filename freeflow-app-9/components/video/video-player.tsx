"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  SkipBack, 
  SkipForward,
  RotateCcw,
  Share,
  Download,
  Bookmark,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  description?: string;
  thumbnail?: string;
}

export interface VideoPlayerProps {
  playbackId: string;
  title?: string;
  poster?: string;
  chapters?: VideoChapter[];
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  showControls?: boolean;
  showChapters?: boolean;
  showSettings?: boolean;
  allowDownload?: boolean;
  allowSharing?: boolean;
  watermark?: string;
  startTime?: number;
  endTime?: number;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: string;
  isLoading: boolean;
  buffered: number;
}

export default function VideoPlayer({
  playbackId,
  title,
  poster,
  chapters = [],
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  width = '100%',
  height = 'auto',
  aspectRatio = '16/9',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onDurationChange,
  showControls = true,
  showChapters = true,
  showSettings = true,
  allowDownload = false,
  allowSharing = true,
  watermark,
  startTime,
  endTime
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
    isFullscreen: false,
    playbackRate: 1,
    quality: 'auto',
    isLoading: false,
    buffered: 0
  });

  // UI state
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [currentChapter, setCurrentChapter] = useState<VideoChapter | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Control visibility timer
  const controlsTimerRef = useRef<NodeJS.Timeout>();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');

  // Update current chapter based on time
  useEffect(() => {
    if (chapters.length === 0) return;

    const chapter = chapters.find(chapter => 
      state.currentTime >= chapter.startTime && 
      (!chapter.endTime || state.currentTime < chapter.endTime)
    );
    
    if (chapter && chapter.id !== currentChapter?.id) {
      setCurrentChapter(chapter);
    }
  }, [state.currentTime, chapters, currentChapter]);

  // Handle controls visibility
  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    if (state.isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [state.isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying) {
      setControlsVisible(false);
    }
  }, [state.isPlaying]);

  // Playback controls
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    
    if (state.isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [state.isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    
    const newMuted = !state.isMuted;
    playerRef.current.muted = newMuted;
    setState(prev => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!playerRef.current) return;
    
    const volume = value[0];
    playerRef.current.volume = volume;
    setState(prev => ({ 
      ...prev, 
      volume, 
      isMuted: volume === 0 
    }));
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!playerRef.current) return;
    
    const seekTime = value[0];
    playerRef.current.currentTime = seekTime;
    setState(prev => ({ ...prev, currentTime: seekTime }));
  }, []);

  const skipBackward = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.currentTime = Math.max(0, state.currentTime - 10);
  }, [state.currentTime]);

  const skipForward = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.currentTime = Math.min(state.duration, state.currentTime + 10);
  }, [state.currentTime, state.duration]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!state.isFullscreen) {
        await containerRef.current.requestFullscreen();
        setState(prev => ({ ...prev, isFullscreen: true }));
      } else {
        await document.exitFullscreen();
        setState(prev => ({ ...prev, isFullscreen: false }));
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    if (!playerRef.current) return;
    
    playerRef.current.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
    setSettingsOpen(false);
    toast.success(`Playback speed: ${rate}x`);
  }, []);

  const jumpToChapter = useCallback((chapter: VideoChapter) => {
    if (!playerRef.current) return;
    
    playerRef.current.currentTime = chapter.startTime;
    setCurrentChapter(chapter);
    toast.success(`Jumped to: ${chapter.title}`);
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/video/${playbackId}?t=${Math.floor(state.currentTime)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Video',
          url
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  }, [playbackId, title, state.currentTime]);

  const handleDownload = useCallback(() => {
    // This would typically trigger a download API endpoint
    toast.info('Download feature coming soon');
  }, []);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Player event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (!playerRef.current) return;
    
    const duration = playerRef.current.duration;
    setState(prev => ({ ...prev, duration, isLoading: false }));
    onDurationChange?.(duration);

    // Set start time if provided
    if (startTime) {
      playerRef.current.currentTime = startTime;
    }
  }, [startTime, onDurationChange]);

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    
    const currentTime = playerRef.current.currentTime;
    setState(prev => ({ ...prev, currentTime }));
    onTimeUpdate?.(currentTime);

    // Handle end time if provided
    if (endTime && currentTime >= endTime) {
      playerRef.current.pause();
    }
  }, [endTime, onTimeUpdate]);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onEnded?.();
  }, [onEnded]);

  const handleWaiting = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const handleProgress = useCallback(() => {
    if (!playerRef.current) return;
    
    const buffered = playerRef.current.buffered.length > 0 
      ? playerRef.current.buffered.end(0) 
      : 0;
    setState(prev => ({ ...prev, buffered }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'j':
          e.preventDefault();
          skipBackward();
          break;
        case 'l':
          e.preventDefault();
          skipForward();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipBackward, skipForward, toggleMute, toggleFullscreen]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: document.fullscreenElement !== null }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Calculate optimal player dimensions
  const getPlayerDimensions = () => {
    if (isMobile) {
      if (isPortrait) {
        return {
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: '16/9'
        };
      } else {
        return {
          width: '100%',
          height: '100vh',
          maxHeight: '100vh'
        };
      }
    }
    return {};
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative group bg-black rounded-lg overflow-hidden',
        state.isFullscreen ? 'fixed inset-0 z-50 rounded-none' : '',
        className
      )}
      style={getPlayerDimensions()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Video Player */}
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        poster={poster}
        autoPlay={autoPlay}
        muted={state.isMuted}
        loop={loop}
        controls={false} // We'll use custom controls
        className="w-full h-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onProgress={handleProgress}
      />

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Watermark */}
      {watermark && (
        <div className="absolute top-4 right-4 opacity-60">
          <img src={watermark} alt="Watermark" className="h-8" />
        </div>
      )}

      {/* Chapter Indicator */}
      {currentChapter && showChapters && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Bookmark className="w-3 h-3 mr-1" />
            {currentChapter.title}
          </Badge>
        </div>
      )}

      {/* Custom Controls */}
      {showControls && (
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white border-none backdrop-blur-sm"
            >
              {state.isPlaying ? (
                <Pause className="w-8 h-8" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              )}
            </Button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[state.currentTime]}
                max={state.duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
              {/* Buffered Progress */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-white/30 rounded-full -translate-y-1/2"
                style={{ width: `${(state.buffered / state.duration) * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {state.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                {/* Skip Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipBackward}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipForward}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {state.isMuted || state.volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Slider
                    value={[state.isMuted ? 0 : state.volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                {/* Time Display */}
                <div className="text-sm font-mono">
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Share Button */}
                {allowSharing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-white hover:bg-white/20"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                )}

                {/* Download Button */}
                {allowDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                {/* Settings */}
                {showSettings && (
                  <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Playback Speed</div>
                        <div className="grid grid-cols-2 gap-1">
                          {playbackRates.map(rate => (
                            <Button
                              key={rate}
                              variant={state.playbackRate === rate ? "default" : "ghost"}
                              size="sm"
                              onClick={() => changePlaybackRate(rate)}
                              className="text-xs"
                            >
                              {rate}x
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {state.isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Sidebar */}
      {showChapters && chapters.length > 0 && !state.isFullscreen && (
        <div className="absolute top-0 right-0 w-64 h-full bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Chapters
            </h3>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Card 
                  key={chapter.id}
                  className={cn(
                    'cursor-pointer transition-all hover:bg-accent',
                    currentChapter?.id === chapter.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => jumpToChapter(chapter)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium line-clamp-2">
                      {chapter.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(chapter.startTime)}
                      {chapter.endTime && ` - ${formatTime(chapter.endTime)}`}
                    </div>
                    {chapter.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {chapter.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 