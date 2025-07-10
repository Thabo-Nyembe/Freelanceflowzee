'use client'

import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';

interface VideoControlsProps {
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  quality: string;
  qualities: string[];
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onQualityChange: (quality: string) => void;
  className?: string;
}

export function VideoControls({
  playing,
  muted,
  volume,
  currentTime,
  duration,
  playbackRate,
  quality,
  qualities,
  onPlayPause,
  onMute,
  onVolumeChange,
  onSeek,
  onPlaybackRateChange,
  onQualityChange,
  className
}: VideoControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (!isMobile) return;

    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('touchmove', handleActivity);
    handleActivity();

    return () => {
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('touchmove', handleActivity);
      clearTimeout(timeout);
    };
  }, [isMobile]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
        !showControls && 'opacity-0',
        className
      )}
    >
      {/* Progress bar */}
      <Slider.Root
        className="relative flex h-1.5 w-full touch-none select-none items-center"
        value={[currentTime]}
        max={duration}
        step={0.1}
        onValueChange={([value]) => onSeek(value)}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-white/30">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-3 w-3 rounded-full bg-primary shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Seek time"
        />
      </Slider.Root>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={onPlayPause}
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Skip buttons (desktop only) */}
          {!isMobile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white"
                onClick={() => onSeek(currentTime - 10)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white"
                onClick={() => onSeek(currentTime + 10)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Volume control (desktop only) */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white"
                onClick={onMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider.Root
                className="relative flex h-4 w-24 touch-none select-none items-center"
                value={[muted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => onVolumeChange(value)}
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-white/30">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>
                <Slider.Thumb
                  className="block h-3 w-3 rounded-full bg-white shadow-lg"
                  aria-label="Volume"
                />
              </Slider.Root>
            </div>
          )}

          {/* Time display */}
          <div className="text-sm text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Settings */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-black/90 p-2 text-white shadow-lg">
              {/* Playback speed */}
              <div className="mb-2">
                <label className="mb-1 block text-xs">Playback Speed</label>
                <Select.Root
                  value={playbackRate.toString()}
                  onValueChange={(value) => onPlaybackRateChange(parseFloat(value))}
                >
                  <Select.Trigger className="flex w-full items-center justify-between rounded px-2 py-1 text-sm hover:bg-white/10">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="rounded-lg bg-black/90 p-1">
                      <Select.Viewport>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <Select.Item
                            key={rate}
                            value={rate.toString()}
                            className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-white/10"
                          >
                            <Select.ItemText>{rate}x</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Quality selection */}
              <div>
                <label className="mb-1 block text-xs">Quality</label>
                <Select.Root
                  value={quality}
                  onValueChange={onQualityChange}
                >
                  <Select.Trigger className="flex w-full items-center justify-between rounded px-2 py-1 text-sm hover:bg-white/10">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="rounded-lg bg-black/90 p-1">
                      <Select.Viewport>
                        {qualities.map((q) => (
                          <Select.Item
                            key={q}
                            value={q}
                            className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-white/10"
                          >
                            <Select.ItemText>{q}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 