"use client";

import { useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface VideoChapter {
  startTime: number;
  title: string;
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
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  showControls?: boolean;
  showChapters?: boolean;
  showSettings?: boolean;
  watermark?: string;
  startTime?: number;
}

export default function VideoPlayer({
  playbackId,
  title,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onDurationChange,
  showControls = true,
  showChapters = false,
  showSettings = true,
  watermark,
  startTime,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const containerRef =<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      setCurrentTime(target.currentTime);
      onTimeUpdate?.(target.currentTime);
    };

    const handleDurationChange = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      setDuration(target.duration);
      onDurationChange?.(target.duration);
    };

    const handleVolumeChange = () => {
      setVolume(containerRef.current?.querySelector('video')?.volume || 1);
      setIsMuted(containerRef.current?.querySelector('video')?.muted || false);
    };

    if (containerRef.current) {
      const video = containerRef.current.querySelector('video');
      if (video) {
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('volumechange', handleVolumeChange);
      }
    }

    return () => {
      if (containerRef.current) {
        const video = containerRef.current.querySelector('video');
        if (video) {
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('durationchange', handleDurationChange);
          video.removeEventListener('volumechange', handleVolumeChange);
        }
      }
    };
  }, [onTimeUpdate, onDurationChange]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (containerRef.current) {
      const value = newVolume[0];
      const video = containerRef.current.querySelector('video');
      if (video) {
        video.volume = value;
        if (value === 0) {
          video.muted = true;
        } else if (isMuted) {
          video.muted = false;
        }
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      toast.error('Fullscreen mode is not supported on this device');
    }
  };

  const handleTimeSeek = (newTime: number[]) => {
    if (containerRef.current) {
      const video = containerRef.current.querySelector('video');
      if (video) {
        video.currentTime = newTime[0];
      }
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full aspect-video', className)}>
      <MuxPlayer
        playbackId={playbackId}
        metadata={{
          video_id: playbackId,
          video_title: title,
          viewer_user_id: 'anonymous'
        }}
        streamType="on-demand"
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        title={title}
        poster={poster}
        startTime={startTime}
        onPlay={() => {
          setIsPlaying(true);
          onPlay?.();
        }}
        onPause={() => {
          setIsPlaying(false);
          onPause?.();
        }}
        onEnded={onEnded}
        onTimeUpdate={(e: Event) => {
          const target = e.target as HTMLVideoElement;
          onTimeUpdate?.(target.currentTime);
        }}
        onDurationChange={(e: Event) => {
          const target = e.target as HTMLVideoElement;
          onDurationChange?.(target.duration);
        }}
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            {!isMobile && (
              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            )}
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration}
                step={1}
                onValueChange={handleTimeSeek}
              />
            </div>
            {showSettings && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
              >
                <Settings />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-6 w-6" />
              ) : (
                <Maximize2 className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 