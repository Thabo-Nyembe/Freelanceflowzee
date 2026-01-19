/**
 * Video Timeline - FreeFlow A+++ Implementation
 * Interactive timeline with comments and markers
 */

'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import { MessageSquare, Flag, Bookmark, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  formatDuration,
  msToSMPTE,
  type VideoComment,
  type VideoMarker,
  type VideoAsset,
} from '@/lib/video/frame-comments';

interface VideoTimelineProps {
  video: VideoAsset;
  currentTimeMs: number;
  comments: VideoComment[];
  markers?: VideoMarker[];
  onSeek: (timeMs: number) => void;
  onCommentClick?: (comment: VideoComment) => void;
  onMarkerClick?: (marker: VideoMarker) => void;
  showComments?: boolean;
  showMarkers?: boolean;
  className?: string;
}

export function VideoTimeline({
  video,
  currentTimeMs,
  comments,
  markers = [],
  onSeek,
  onCommentClick,
  onMarkerClick,
  showComments = true,
  showMarkers = true,
  className,
}: VideoTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTimeMs, setHoverTimeMs] = useState<number | null>(null);

  const durationMs = video.durationMs;

  // Group comments by position (within 1% of each other)
  const commentGroups = useMemo(() => {
    if (!showComments) return [];

    const groups: { position: number; comments: VideoComment[] }[] = [];
    const sortedComments = [...comments].sort(
      (a, b) => a.timestampMs - b.timestampMs
    );

    for (const comment of sortedComments) {
      const position = (comment.timestampMs / durationMs) * 100;
      const existingGroup = groups.find(
        (g) => Math.abs(g.position - position) < 1
      );

      if (existingGroup) {
        existingGroup.comments.push(comment);
      } else {
        groups.push({ position, comments: [comment] });
      }
    }

    return groups;
  }, [comments, durationMs, showComments]);

  // Handle seeking via click/drag
  const handleSeekFromEvent = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!container || durationMs === 0) return;

      const rect = container.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTimeMs = Math.round(position * durationMs);

      onSeek(newTimeMs);
    },
    [durationMs, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!container || durationMs === 0) return;

      const rect = container.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverTimeMs(Math.round(position * durationMs));

      if (isDragging) {
        handleSeekFromEvent(e);
      }
    },
    [durationMs, isDragging, handleSeekFromEvent]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleSeekFromEvent(e);
    },
    [handleSeekFromEvent]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverTimeMs(null);
    setIsDragging(false);
  }, []);

  const currentPosition = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  return (
    <TooltipProvider>
      <div className={cn('select-none', className)}>
        {/* Markers row */}
        {showMarkers && markers.length > 0 && (
          <div className="relative h-6 mb-2">
            {markers.map((marker) => {
              const position = (marker.timestampMs / durationMs) * 100;
              return (
                <Tooltip key={marker.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="absolute -translate-x-1/2 top-0 p-1 rounded hover:bg-muted"
                      style={{ left: `${position}%` }}
                      onClick={() => {
                        onSeek(marker.timestampMs);
                        onMarkerClick?.(marker);
                      }}
                    >
                      {marker.markerType === 'chapter' ? (
                        <Flag className="h-4 w-4" style={{ color: marker.color }} />
                      ) : (
                        <Bookmark className="h-4 w-4" style={{ color: marker.color }} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{marker.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(marker.timestampMs)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Main timeline */}
        <div
          ref={containerRef}
          className="relative h-12 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background track */}
          <div className="absolute inset-y-4 inset-x-0 bg-muted rounded-full" />

          {/* Progress */}
          <div
            className="absolute inset-y-4 left-0 bg-primary rounded-full transition-all"
            style={{ width: `${currentPosition}%` }}
          />

          {/* Hover indicator */}
          {hoverTimeMs !== null && (
            <>
              <div
                className="absolute inset-y-4 w-0.5 bg-primary/50 transition-none"
                style={{
                  left: `${(hoverTimeMs / durationMs) * 100}%`,
                }}
              />
              <div
                className="absolute -top-6 -translate-x-1/2 px-2 py-1 bg-popover border rounded shadow-lg text-xs font-mono"
                style={{
                  left: `${(hoverTimeMs / durationMs) * 100}%`,
                }}
              >
                {msToSMPTE(hoverTimeMs, video.frameRate)}
              </div>
            </>
          )}

          {/* Playhead */}
          <div
            className="absolute top-2 bottom-2 w-1 -ml-0.5 bg-primary rounded-full shadow transition-all"
            style={{ left: `${currentPosition}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
          </div>

          {/* Comment indicators */}
          {showComments &&
            commentGroups.map((group, i) => {
              const unresolvedCount = group.comments.filter(
                (c) => c.status !== 'resolved'
              ).length;
              const hasCritical = group.comments.some((c) => c.priority === 2);
              const hasImportant = group.comments.some((c) => c.priority === 1);

              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background',
                        'flex items-center justify-center',
                        'hover:scale-125 transition-transform',
                        hasCritical
                          ? 'bg-red-500'
                          : hasImportant
                          ? 'bg-orange-500'
                          : unresolvedCount > 0
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      )}
                      style={{ left: `${group.position}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(group.comments[0].timestampMs);
                        onCommentClick?.(group.comments[0]);
                      }}
                    >
                      {group.comments.length > 1 && (
                        <span className="text-[8px] font-bold text-white">
                          {group.comments.length}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      {group.comments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="text-xs">
                          <p className="font-medium">{comment.user?.name}</p>
                          <p className="text-muted-foreground line-clamp-1">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                      {group.comments.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{group.comments.length - 3} more
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatDuration(currentTimeMs)}</span>
          <span className="font-mono">
            {msToSMPTE(currentTimeMs, video.frameRate)}
          </span>
          <span>{formatDuration(durationMs)}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
