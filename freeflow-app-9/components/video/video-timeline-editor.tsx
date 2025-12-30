"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Scissors,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Plus,
  Trash2,
  Edit,
  Clock,
  Film
} from 'lucide-react';
import MuxVideoPlayer, { VideoChapter as MuxVideoChapter } from './mux-video-player';
import { VideoChapter } from '@/lib/video/types';

export interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  title?: string;
  type: 'video' | 'audio' | 'chapter';
  color?: string;
}

export interface VideoTimelineEditorProps {
  videoId: string;
  playbackId: string;
  title: string;
  duration: number;
  chapters?: VideoChapter[];
  onSave?: (edits: TimelineEdit[]) => void;
  onExport?: (format: string) => void;
  className?: string;
}

export interface TimelineEdit {
  type: 'trim' | 'cut' | 'chapter' | 'effect';
  startTime: number;
  endTime?: number;
  data?: unknown;
}

export default function VideoTimelineEditor({
  videoId, playbackId, title, duration, chapters = [], onSave, onExport, className
}: VideoTimelineEditorProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<any>(0);
  const [isPlaying, setIsPlaying] = useState<any>(false);
  const [zoomLevel, setZoomLevel] = useState<any>(1);
  const [selectedSegment, setSelectedSegment] = useState<TimelineSegment | null>(null);
  const [trimStart, setTrimStart] = useState<any>(0);
  const [trimEnd, setTrimEnd] = useState<any>(duration);
  const [cuts, setCuts] = useState<number[]>([]);
  const [videoChapters, setVideoChapters] = useState<VideoChapter[]>(chapters);
  const [editHistory, setEditHistory] = useState<TimelineEdit[]>([]);
  const [isEditingChapter, setIsEditingChapter] = useState<any>(false);
  const [newChapterTitle, setNewChapterTitle] = useState<any>('');

  // Timeline scale calculations
  const timelineWidth = 800;
  const _pixelsPerSecond = (timelineWidth * zoomLevel) / duration;

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }, []);

  const timeToPixels = useCallback((time: number) => {
    return (time / duration) * timelineWidth * zoomLevel;
  }, [duration, timelineWidth, zoomLevel]);

  const pixelsToTime = useCallback((pixels: number) => {
    return (pixels / (timelineWidth * zoomLevel)) * duration;
  }, [duration, timelineWidth, zoomLevel]);

  const handleTimelineClick = useCallback((event: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const time = pixelsToTime(x);
    setCurrentTime(Math.max(0, Math.min(duration, time)));
  }, [pixelsToTime, duration]);

  const addCut = useCallback(() => {
    if (!cuts.includes(currentTime)) {
      setCuts(prev => [...prev, currentTime].sort((a, b) => a - b));
      setEditHistory(prev => [...prev, {
        type: 'cut',
        startTime: currentTime
      }]);
    }
  }, [currentTime, cuts]);

  const removeCut = useCallback((cutTime: number) => {
    setCuts(prev => prev.filter(cut => cut !== cutTime));
  }, [/* add dependencies */]);

  const addChapter = useCallback(() => {
    if (!newChapterTitle.trim()) return;
    
    const newChapter: VideoChapter = {
      id: `chapter-${Date.now()}`,
      title: newChapterTitle,
      start_time: currentTime,
      end_time: Math.min(currentTime + 30, duration),
      summary: `Chapter starting at ${formatTime(currentTime)}`
    };
    
    setVideoChapters(prev => [...prev, newChapter].sort((a, b) => a.start_time - b.start_time));
    setEditHistory(prev => [...prev, {
      type: 'chapter',
      startTime: currentTime,
      data: newChapter
    }]);
    setNewChapterTitle('');
    setIsEditingChapter(false);
  }, [currentTime, newChapterTitle, duration, formatTime]);

  const removeChapter = useCallback((chapterId: string) => {
    setVideoChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
  }, [/* add dependencies */]);

  const handleTrimChange = useCallback((type: 'start' | 'end', value: number) => {
    if (type === 'start') {
      setTrimStart(Math.max(0, Math.min(value, trimEnd - 1)));
    } else {
      setTrimEnd(Math.min(duration, Math.max(value, trimStart + 1)));
    }
  }, [trimStart, trimEnd, duration]);

  const handleSave = useCallback(() => {
    const edits: TimelineEdit[] = [
      {
        type: 'trim',
        startTime: trimStart,
        endTime: trimEnd
      },
      ...cuts.map(cut => ({
        type: 'cut' as const,
        startTime: cut
      })),
      ...videoChapters.map(chapter => ({
        type: 'chapter' as const,
        startTime: chapter.start_time,
        endTime: chapter.end_time,
        data: chapter
      }))
    ];
    
    onSave?.(edits);
  }, [trimStart, trimEnd, cuts, videoChapters, onSave]);

  const handleExport = useCallback((format: string) => {
    onExport?.(format);
  }, [onExport]);

  // Convert VideoChapter to MuxVideoChapter format
  const muxChapters: MuxVideoChapter[] = videoChapters.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    startTime: chapter.start_time,
    endTime: chapter.end_time,
    description: chapter.summary
  }));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Video Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MuxVideoPlayer
            playbackId={playbackId}
            title={title}
            chapters={muxChapters}
            videoId={videoId}
            onTimeUpdate={setCurrentTime}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="aspect-video"
          />
        </div>

        {/* Edit Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trim Controls */}
              <div className="space-y-2">
                <Label>Trim Video</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Start:</Label>
                    <Input
                      type="number"
                      value={trimStart.toFixed(2)}
                      onChange={(e) => handleTrimChange('start', parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      step="0.1"
                      min="0"
                      max={duration}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">End:</Label>
                    <Input
                      type="number"
                      value={trimEnd.toFixed(2)}
                      onChange={(e) => handleTrimChange('end', parseFloat(e.target.value))}
                      className="h-8 text-xs"
                      step="0.1"
                      min="0"
                      max={duration}
                    />
                  </div>
                </div>
              </div>

              {/* Cut Tool */}
              <div className="space-y-2">
                <Button
                  onClick={addCut}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Add Cut at {formatTime(currentTime)}
                </Button>
              </div>

              {/* Chapter Tool */}
              <div className="space-y-2">
                <Label>Add Chapter</Label>
                {isEditingChapter ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Chapter title"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      className="h-8"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={addChapter}
                        size="sm"
                        className="flex-1"
                      >
                        Add
                      </Button>
                      <Button
                        onClick={() => setIsEditingChapter(false)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditingChapter(true)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chapter
                  </Button>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} size="sm" className="flex-1">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => handleExport('mp4')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Timeline Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))}
                variant="outline"
                size="sm"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                variant="outline"
                size="sm"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Time Markers */}
            <div className="relative h-6 border-b">
              {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => i * 10)
                .filter(time => time <= duration)
                .map(time => (
                  <div
                    key={time}
                    className="absolute text-xs text-muted-foreground"
                    style={{ left: `${timeToPixels(time)}px` }}
                  >
                    {formatTime(time)}
                  </div>
                ))}
            </div>

            {/* Main Timeline */}
            <div
              ref={timelineRef}
              className="relative h-20 bg-muted/20 border rounded cursor-pointer overflow-hidden"
              style={{ width: `${timelineWidth * zoomLevel}px` }}
              onClick={handleTimelineClick}
            >
              {/* Video Track */}
              <div className="absolute top-2 left-0 right-0 h-6 bg-blue-500/20 border border-blue-500/50 rounded">
                <div className="p-1 text-xs text-blue-700">Video Track</div>
              </div>

              {/* Trim Indicators */}
              <div
                className="absolute top-0 bottom-0 bg-red-500/20 border-l-2 border-red-500"
                style={{ left: `${timeToPixels(trimStart)}px` }}
              />
              <div
                className="absolute top-0 bottom-0 bg-red-500/20 border-r-2 border-red-500"
                style={{ left: `${timeToPixels(trimEnd)}px` }}
              />

              {/* Cut Markers */}
              {cuts.map(cut => (
                <div
                  key={cut}
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 cursor-pointer group"
                  style={{ left: `${timeToPixels(cut)}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCut(cut);
                  }}
                >
                  <div className="absolute -top-6 left-0 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                      Cut: {formatTime(cut)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Chapter Markers */}
              {videoChapters.map(chapter => (
                <div
                  key={chapter.id}
                  className="absolute top-10 h-6 bg-green-500/20 border border-green-500/50 rounded group cursor-pointer"
                  style={{
                    left: `${timeToPixels(chapter.start_time)}px`,
                    width: `${timeToPixels((chapter.end_time || chapter.start_time + 30) - chapter.start_time)}px`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTime(chapter.start_time);
                  }}
                >
                  <div className="p-1 text-xs text-green-700 truncate">{chapter.title}</div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChapter(chapter.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="absolute -top-1 -right-1 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {/* Current Time Indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
                style={{ left: `${timeToPixels(currentTime)}px` }}
              >
                <div className="absolute -top-2 left-0 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-red-600 rotate-45" />
                </div>
              </div>
            </div>

            {/* Current Time Display */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Current: {formatTime(currentTime)}</span>
                </div>
                <Badge variant="outline">
                  Duration: {formatTime(duration)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={cuts.length > 0 ? "default" : "outline"}>
                  {cuts.length} cuts
                </Badge>
                <Badge variant={videoChapters.length > 0 ? "default" : "outline"}>
                  {videoChapters.length} chapters
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 