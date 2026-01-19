"use client";

/**
 * Floating Recording Controls - FreeFlow A+++ Implementation
 * Loom-style minimal floating controls during screen recording
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pause,
  Play,
  Square,
  Trash2,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MousePointer,
  Pencil,
  Eraser,
  RotateCcw,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Circle,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface RecordingControlsState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  webcamEnabled: boolean;
  micEnabled: boolean;
  drawingMode: boolean;
}

interface FloatingRecordingControlsProps {
  state: RecordingControlsState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCancel: () => void;
  onToggleWebcam: () => void;
  onToggleMic: () => void;
  onToggleDrawing: () => void;
  onClearDrawing?: () => void;
  onUndo?: () => void;
  position?: 'top' | 'bottom';
  className?: string;
}

// Color palette for drawing tools
const DRAWING_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ffffff', // white
  '#000000', // black
];

export function FloatingRecordingControls({
  state,
  onPause,
  onResume,
  onStop,
  onCancel,
  onToggleWebcam,
  onToggleMic,
  onToggleDrawing,
  onClearDrawing,
  onUndo,
  position = 'bottom',
  className,
}: FloatingRecordingControlsProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedColor, setSelectedColor] = useState(DRAWING_COLORS[0]);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (state.isPaused) {
            onResume();
          } else {
            onPause();
          }
          break;
        case 'escape':
          setShowStopConfirm(true);
          break;
        case 'd':
          if (e.altKey) {
            e.preventDefault();
            onToggleDrawing();
          }
          break;
        case 'w':
          if (e.altKey) {
            e.preventDefault();
            onToggleWebcam();
          }
          break;
        case 'm':
          if (e.altKey) {
            e.preventDefault();
            onToggleMic();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPaused, onPause, onResume, onToggleDrawing, onToggleWebcam, onToggleMic]);

  const handleStop = useCallback(() => {
    setShowStopConfirm(false);
    onStop();
  }, [onStop]);

  const positionClass = position === 'top'
    ? 'top-4 left-1/2 -translate-x-1/2'
    : 'bottom-4 left-1/2 -translate-x-1/2';

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          className={cn(
            'fixed z-50 bg-gray-900/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-700',
            positionClass,
            className
          )}
        >
          <div className="flex items-center gap-1 px-2 py-1.5">
            {/* Recording indicator */}
            <div className="flex items-center gap-2 px-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                state.isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
              )} />
              <span className="text-white font-mono text-sm font-medium">
                {formatDuration(state.duration)}
              </span>
            </div>

            <div className="w-px h-6 bg-gray-700" />

            {!isMinimized && (
              <>
                {/* Pause/Resume */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/10"
                      onClick={state.isPaused ? onResume : onPause}
                    >
                      {state.isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{state.isPaused ? 'Resume' : 'Pause'} (Space)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Stop */}
                <Popover open={showStopConfirm} onOpenChange={setShowStopConfirm}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Stop recording?</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={handleStop}
                        >
                          Stop
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowStopConfirm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="w-px h-6 bg-gray-700" />

                {/* Webcam toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8',
                        state.webcamEnabled
                          ? 'text-green-400 hover:bg-green-500/20'
                          : 'text-gray-400 hover:bg-gray-500/20'
                      )}
                      onClick={onToggleWebcam}
                    >
                      {state.webcamEnabled ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <VideoOff className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle webcam (Alt+W)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Mic toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8',
                        state.micEnabled
                          ? 'text-green-400 hover:bg-green-500/20'
                          : 'text-gray-400 hover:bg-gray-500/20'
                      )}
                      onClick={onToggleMic}
                    >
                      {state.micEnabled ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle microphone (Alt+M)</p>
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-6 bg-gray-700" />

                {/* Drawing tools */}
                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-8 w-8',
                            state.drawingMode
                              ? 'text-blue-400 hover:bg-blue-500/20 bg-blue-500/10'
                              : 'text-gray-400 hover:bg-gray-500/20'
                          )}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Drawing tools (Alt+D)</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Draw on screen</span>
                        <Button
                          variant={state.drawingMode ? 'default' : 'outline'}
                          size="sm"
                          onClick={onToggleDrawing}
                        >
                          {state.drawingMode ? 'On' : 'Off'}
                        </Button>
                      </div>

                      {state.drawingMode && (
                        <>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Color</span>
                            <div className="flex flex-wrap gap-1">
                              {DRAWING_COLORS.map((color) => (
                                <button
                                  key={color}
                                  className={cn(
                                    'w-6 h-6 rounded-full border-2 transition-transform',
                                    selectedColor === color
                                      ? 'border-white scale-110'
                                      : 'border-transparent hover:scale-105'
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setSelectedColor(color)}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={onUndo}
                                  disabled={!onUndo}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Undo</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={onClearDrawing}
                                  disabled={!onClearDrawing}
                                >
                                  <Eraser className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Clear all</TooltipContent>
                            </Tooltip>
                          </div>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="w-px h-6 bg-gray-700" />

                {/* Cancel/Delete */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                      onClick={onCancel}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel recording</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Minimize toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:bg-gray-500/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
}

export default FloatingRecordingControls;
