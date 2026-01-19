"use client";

/**
 * Webcam Overlay Component - FreeFlow A+++ Implementation
 * Loom-style draggable webcam bubble for screen recordings
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Move,
  Camera,
  Mic,
  MicOff,
  Settings,
  X,
  Circle,
  Square,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type WebcamShape = 'circle' | 'square' | 'rounded';
export type WebcamSize = 'small' | 'medium' | 'large';
export type WebcamPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

interface WebcamOverlayProps {
  isVisible?: boolean;
  isRecording?: boolean;
  defaultPosition?: WebcamPosition;
  defaultShape?: WebcamShape;
  defaultSize?: WebcamSize;
  showControls?: boolean;
  enableDrag?: boolean;
  enableMirror?: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  onClose?: () => void;
  className?: string;
}

const SIZE_CONFIGS = {
  small: { width: 120, height: 120 },
  medium: { width: 180, height: 180 },
  large: { width: 240, height: 240 },
};

const POSITION_CONFIGS = {
  'top-left': { top: 20, left: 20 },
  'top-right': { top: 20, right: 20 },
  'bottom-left': { bottom: 20, left: 20 },
  'bottom-right': { bottom: 20, right: 20 },
  'custom': { top: 20, right: 20 },
};

export function WebcamOverlay({
  isVisible = true,
  isRecording = false,
  defaultPosition = 'bottom-right',
  defaultShape = 'circle',
  defaultSize = 'medium',
  showControls = true,
  enableDrag = true,
  enableMirror = true,
  onStreamReady,
  onClose,
  className,
}: WebcamOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [shape, setShape] = useState<WebcamShape>(defaultShape);
  const [size, setSize] = useState<WebcamSize>(defaultSize);
  const [position, setPosition] = useState<WebcamPosition>(defaultPosition);
  const [isHovered, setIsHovered] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);

        const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
        const audioDevices = deviceList.filter(d => d.kind === 'audioinput');

        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
        if (audioDevices.length > 0 && !selectedMic) {
          setSelectedMic(audioDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Failed to get devices:', err);
      }
    };

    getDevices();
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, [selectedCamera, selectedMic]);

  // Initialize webcam stream
  useEffect(() => {
    const initWebcam = async () => {
      if (!isWebcamOn) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: selectedCamera
            ? { deviceId: { exact: selectedCamera } }
            : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: isMicOn && selectedMic
            ? { deviceId: { exact: selectedMic } }
            : isMicOn,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        if (onStreamReady) {
          onStreamReady(mediaStream);
        }
      } catch (err) {
        console.error('Failed to access webcam:', err);
        setError('Could not access camera. Please check permissions.');
        setStream(null);
      }
    };

    initWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamOn, selectedCamera, selectedMic, isMicOn, onStreamReady]);

  // Toggle webcam
  const toggleWebcam = useCallback(() => {
    setIsWebcamOn(prev => !prev);
  }, []);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(prev => !prev);
  }, [stream, isMicOn]);

  // Change camera
  const changeCamera = useCallback((deviceId: string) => {
    setSelectedCamera(deviceId);
  }, []);

  // Change microphone
  const changeMic = useCallback((deviceId: string) => {
    setSelectedMic(deviceId);
  }, []);

  // Get shape class
  const getShapeClass = () => {
    switch (shape) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-xl';
      default: return 'rounded-full';
    }
  };

  // Get position style
  const getPositionStyle = () => {
    if (position === 'custom') return {};
    return POSITION_CONFIGS[position];
  };

  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  const audioDevices = devices.filter(d => d.kind === 'audioinput');
  const sizeConfig = SIZE_CONFIGS[size];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        drag={enableDrag}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        whileDrag={{ scale: 1.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed z-50 shadow-2xl cursor-move overflow-hidden',
          getShapeClass(),
          isRecording && 'ring-4 ring-red-500 ring-opacity-75 animate-pulse',
          className
        )}
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
          ...getPositionStyle(),
        }}
      >
        {/* Webcam video */}
        {isWebcamOn && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              'w-full h-full object-cover bg-gray-900',
              enableMirror && 'scale-x-[-1]'
            )}
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            {error ? (
              <div className="text-center p-2">
                <VideoOff className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">{error}</p>
              </div>
            ) : (
              <Camera className="w-8 h-8 text-gray-500" />
            )}
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-white font-medium drop-shadow-lg">REC</span>
          </div>
        )}

        {/* Controls overlay */}
        <AnimatePresence>
          {showControls && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1"
            >
              {/* Toggle webcam */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleWebcam}
              >
                {isWebcamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>

              {/* Toggle mic */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>

              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Shape</DropdownMenuLabel>
                  <div className="flex gap-1 px-2 py-1">
                    <Button
                      variant={shape === 'circle' ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShape('circle')}
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={shape === 'square' ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShape('square')}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={shape === 'rounded' ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShape('rounded')}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel>Size</DropdownMenuLabel>
                  <div className="flex gap-1 px-2 py-1">
                    <Button
                      variant={size === 'small' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSize('small')}
                    >
                      S
                    </Button>
                    <Button
                      variant={size === 'medium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSize('medium')}
                    >
                      M
                    </Button>
                    <Button
                      variant={size === 'large' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSize('large')}
                    >
                      L
                    </Button>
                  </div>

                  <DropdownMenuSeparator />

                  {videoDevices.length > 1 && (
                    <>
                      <DropdownMenuLabel>Camera</DropdownMenuLabel>
                      <div className="px-2 py-1">
                        <Select value={selectedCamera} onValueChange={changeCamera}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select camera" />
                          </SelectTrigger>
                          <SelectContent>
                            {videoDevices.map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {audioDevices.length > 1 && (
                    <>
                      <DropdownMenuLabel>Microphone</DropdownMenuLabel>
                      <div className="px-2 py-1">
                        <Select value={selectedMic} onValueChange={changeMic}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select microphone" />
                          </SelectTrigger>
                          <SelectContent>
                            {audioDevices.map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Close button */}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag handle indicator */}
        {enableDrag && isHovered && (
          <div className="absolute bottom-1 right-1">
            <Move className="w-3 h-3 text-white/50" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default WebcamOverlay;
