"use client";

import { useState, useCallback, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  Settings,
  Share,
  Loader2
} from 'lucide-react';
import { useVideoAnalytics } from '@/hooks/video/useVideoAnalytics';

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  description?: string;
}

export interface MuxVideoPlayerProps {
  playbackId: string;
  title?: string;
  poster?: string;
  chapters?: VideoChapter[];
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  aspectRatio?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  showControls?: boolean;
  allowSharing?: boolean;
  onError?: (error: Error) => void;
  videoId: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

export default function MuxVideoPlayer({
  playbackId, title, poster, chapters = [], autoPlay = false, muted = false, className, aspectRatio = '16/9', onPlay, onPause, onEnded, onTimeUpdate, showControls = true, allowSharing = true, onError, videoId, }: MuxVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
    isLoading: false
  });

  const [controlsVisible, setControlsVisible] = useState<any>(true);

  const { startWatchSession, endWatchSession, trackEngagement } = useVideoAnalytics({
    videoId,
    onError,
  });

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

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/video/${playbackId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Video',
          url
        });
      } catch (error) {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [playbackId, title]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!playerRef.current) return;
    setState(prev => ({ ...prev, duration: playerRef.current!.duration, isLoading: false }));
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.currentTime;
    setState(prev => ({ ...prev, currentTime }));
    onTimeUpdate?.(currentTime);
  }, [onTimeUpdate]);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    onPlay?.();
    startWatchSession(state.duration);
    trackEngagement('play');
  }, [onPlay, startWatchSession, trackEngagement, state.duration]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
    const progress = (state.currentTime / state.duration) * 100;
    endWatchSession(progress);
    trackEngagement('pause');
  }, [onPause, startWatchSession, endWatchSession, trackEngagement, state.currentTime, state.duration]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onEnded?.();
    endWatchSession(100);
    trackEngagement('complete');
  }, [onEnded, startWatchSession, endWatchSession, trackEngagement]);

  const handleWaiting = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleSeeking = () => {
      const currentTime = player.currentTime;
      trackEngagement('seek', {
        from: currentTime,
        to: player.seekable.end(0),
      });
    };

    const handleError = (event: ErrorEvent) => {
      trackEngagement('error', {
        message: event.message,
        code: event.error?.code,
      });
    };

    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);
    player.addEventListener('ended', handleEnded);
    player.addEventListener('seeking', handleSeeking);
    player.addEventListener('error', handleError);

    return () => {
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);
      player.removeEventListener('seeking', handleSeeking);
      player.removeEventListener('error', handleError);
    };
  }, [handlePlay, handlePause, handleEnded, trackEngagement]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative group bg-black rounded-lg overflow-hidden',
        className
      )}
      style={{ aspectRatio }}
      onMouseEnter={() => setControlsVisible(true)}
      onMouseLeave={() => setControlsVisible(false)}
    >
      {/* Main Video Player */}
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        poster={poster}
        autoPlay={autoPlay}
        muted={state.isMuted}
        className="w-full h-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        metadata={{ video_title: title }}
        streamType="on-demand"
        thumbnailTime={0}
        preload="metadata"
      />

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Custom Controls */}
      {showControls && (
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            controlsVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              {state.isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {state.isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                <div className="text-sm font-mono">
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </div>
              </div>

              <div className="flex items-center gap-2">
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      {chapters.length > 0 && (
        <div className="absolute top-4 left-4">
          <div className="bg-black/70 rounded-lg p-2 text-white text-sm">
            Chapter Navigation Available
          </div>
        </div>
      )}
    </div>
  );
} 