"use client";

/**
 * Screen Recording Client - FreeFlow A+++ Implementation
 * Full Loom-style screen recording interface
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Monitor,
  Video,
  Mic,
  Camera,
  Circle,
  Play,
  Download,
  Upload,
  Copy,
  Share2,
  Trash2,
  Settings,
  Clock,
  HardDrive,
  CheckCircle,
  Loader2,
  Grid3X3,
  List,
  Search,
  MoreVertical,
  Eye,
  Lock,
  Globe,
  Pencil,
  ChevronRight,
  Sparkles,
  FolderOpen,
  Calendar,
} from 'lucide-react';

// Custom Components
import { WebcamOverlay } from '@/components/video/webcam-overlay';
import { FloatingRecordingControls } from '@/components/video/floating-recording-controls';
import { TeleprompterOverlay } from '@/components/video/teleprompter-overlay';

// Hooks
import { useScreenRecorder, RecordingOptions } from '@/hooks/use-screen-recorder';

// Types
interface Recording {
  id: string;
  title: string;
  description?: string;
  duration: number;
  fileSize: number;
  thumbnailUrl?: string;
  shareUrl?: string;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
  recordingType: 'screen' | 'webcam' | 'both';
}

type RecordingMode = 'screen' | 'webcam' | 'both';
type ViewMode = 'grid' | 'list';

// Demo recordings for development
const DEMO_RECORDINGS: Recording[] = [
  {
    id: '1',
    title: 'Product Demo - New Features',
    description: 'Walkthrough of the new dashboard features',
    duration: 185,
    fileSize: 45000000,
    thumbnailUrl: '/api/placeholder/320/180',
    shareUrl: 'https://freeflow.app/share/abc123',
    viewCount: 42,
    isPublic: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recordingType: 'both',
  },
  {
    id: '2',
    title: 'Bug Report - Login Issue',
    description: 'Reproducing the login bug on Safari',
    duration: 67,
    fileSize: 18000000,
    thumbnailUrl: '/api/placeholder/320/180',
    shareUrl: 'https://freeflow.app/share/def456',
    viewCount: 5,
    isPublic: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    recordingType: 'screen',
  },
  {
    id: '3',
    title: 'Quick Update for Team',
    description: 'Status update on the sprint progress',
    duration: 120,
    fileSize: 32000000,
    thumbnailUrl: '/api/placeholder/320/180',
    shareUrl: 'https://freeflow.app/share/ghi789',
    viewCount: 15,
    isPublic: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    recordingType: 'webcam',
  },
];

export function ScreenRecordingClient() {
  // Recording state
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('both');
  const [showWebcam, setShowWebcam] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [systemAudio, setSystemAudio] = useState(false);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTitle, setRecordingTitle] = useState('');

  // Library state
  const [recordings, setRecordings] = useState<Recording[]>(DEMO_RECORDINGS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Teleprompter state
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterScript, setTeleprompterScript] = useState('');

  // Preview state
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Interval refs for cleanup
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Screen recorder hook
  const {
    recordingState,
    recordingBlob,
    previewUrl,
    capabilities,
    startRecording: startRec,
    stopRecording,
    pauseRecording,
    resetRecording,
    downloadRecording,
    uploadRecording,
    streamRef,
  } = useScreenRecorder({
    onRecordingComplete: (blob, metadata) => {
      toast.success('Recording completed!', {
        description: `Duration: ${formatDuration(metadata.duration)}`,
      });
    },
    onUploadComplete: (videoId) => {
      toast.success('Recording uploaded successfully!');
    },
  });

  // Check capabilities on mount
  useEffect(() => {
    if (!capabilities.screenCapture) {
      toast.error('Screen recording is not supported in this browser');
    }
  }, [capabilities]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (uploadProgressIntervalRef.current) {
        clearInterval(uploadProgressIntervalRef.current);
      }
    };
  }, []);

  // Handle countdown and start
  const handleStartRecording = useCallback(() => {
    // Clear any existing countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start 3-second countdown
    setCountdown(3);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          // Actually start recording
          const options: RecordingOptions = {
            video: {
              mediaSource: recordingMode === 'webcam' ? 'screen' : 'screen',
              audio: micEnabled,
              systemAudio: systemAudio,
              quality: quality,
              frameRate: 30,
            },
            title: recordingTitle || `Recording ${new Date().toLocaleDateString()}`,
            autoUpload: false,
          };
          startRec(options);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [recordingMode, micEnabled, systemAudio, quality, recordingTitle, startRec]);

  // Handle stop
  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Handle cancel
  const handleCancelRecording = useCallback(() => {
    stopRecording();
    resetRecording();
    toast.info('Recording cancelled');
  }, [stopRecording, resetRecording]);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!recordingBlob) return;

    // Clear any existing progress interval
    if (uploadProgressIntervalRef.current) {
      clearInterval(uploadProgressIntervalRef.current);
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      uploadProgressIntervalRef.current = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const options: RecordingOptions = {
        video: {
          mediaSource: 'screen',
          audio: micEnabled,
          systemAudio: systemAudio,
          quality: quality,
          frameRate: 30,
        },
        title: recordingTitle || `Recording ${new Date().toLocaleDateString()}`,
        autoUpload: true,
      };

      await uploadRecording(options);

      if (uploadProgressIntervalRef.current) {
        clearInterval(uploadProgressIntervalRef.current);
        uploadProgressIntervalRef.current = null;
      }
      setUploadProgress(100);

      // Add to recordings list
      const newRecording: Recording = {
        id: Date.now().toString(),
        title: recordingTitle || `Recording ${new Date().toLocaleDateString()}`,
        duration: recordingState.duration,
        fileSize: recordingState.fileSize,
        shareUrl: `https://freeflow.app/share/${Date.now()}`,
        viewCount: 0,
        isPublic: false,
        createdAt: new Date().toISOString(),
        recordingType: recordingMode,
      };

      setRecordings(prev => [newRecording, ...prev]);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        resetRecording();
      }, 1000);

    } catch (error) {
      if (uploadProgressIntervalRef.current) {
        clearInterval(uploadProgressIntervalRef.current);
        uploadProgressIntervalRef.current = null;
      }
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Failed to upload recording');
    }
  }, [recordingBlob, recordingTitle, recordingMode, micEnabled, systemAudio, quality, recordingState, uploadRecording, resetRecording]);

  // Copy share link
  const copyShareLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  }, []);

  // Delete recording
  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    setShowDeleteDialog(false);
    setSelectedRecording(null);
    toast.success('Recording deleted');
  }, []);

  // Format helpers
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Filter recordings
  const filteredRecordings = recordings.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if in active recording mode
  const isActiveRecording = recordingState.status === 'recording' || recordingState.status === 'paused';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-white text-9xl font-bold"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating controls during recording */}
      {isActiveRecording && (
        <FloatingRecordingControls
          state={{
            isRecording: recordingState.status === 'recording',
            isPaused: recordingState.status === 'paused',
            duration: recordingState.duration,
            webcamEnabled: showWebcam,
            micEnabled: micEnabled,
            drawingMode: false,
          }}
          onPause={pauseRecording}
          onResume={pauseRecording}
          onStop={handleStopRecording}
          onCancel={handleCancelRecording}
          onToggleWebcam={() => setShowWebcam(!showWebcam)}
          onToggleMic={() => setMicEnabled(!micEnabled)}
          onToggleDrawing={() => {}}
        />
      )}

      {/* Webcam overlay during recording */}
      {isActiveRecording && showWebcam && recordingMode !== 'screen' && (
        <WebcamOverlay
          isVisible={true}
          isRecording={recordingState.status === 'recording'}
          onClose={() => setShowWebcam(false)}
          onStreamReady={(stream) => {
            webcamStreamRef.current = stream;
          }}
        />
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="record" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Screen Recording
              </h1>
              <p className="text-muted-foreground mt-1">
                Record your screen, add webcam overlay, share instantly
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="record" className="gap-2">
                <Video className="w-4 h-4" />
                Record
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Library
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Record Tab */}
          <TabsContent value="record" className="space-y-6">
            {/* Recording status */}
            {recordingState.status === 'completed' && previewUrl && (
              <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    Recording Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <video
                        ref={previewVideoRef}
                        src={previewUrl}
                        controls
                        className="w-full rounded-lg border shadow-sm"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>

                    {/* Details & Actions */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recording-title">Title</Label>
                        <Input
                          id="recording-title"
                          value={recordingTitle}
                          onChange={(e) => setRecordingTitle(e.target.value)}
                          placeholder="My Recording"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDuration(recordingState.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <span>{formatFileSize(recordingState.fileSize)}</span>
                        </div>
                      </div>

                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={downloadRecording} variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Save & Share
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={resetRecording}
                      >
                        Record Another
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recording setup */}
            {recordingState.status === 'idle' && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Mode Selection */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Choose Recording Mode</CardTitle>
                    <CardDescription>
                      Select what you want to record
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Screen Only */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRecordingMode('screen')}
                        className={cn(
                          'p-6 rounded-xl border-2 cursor-pointer transition-all text-center',
                          recordingMode === 'screen'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        )}
                      >
                        <Monitor className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <h3 className="font-semibold">Screen Only</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Record your screen
                        </p>
                      </motion.div>

                      {/* Screen + Webcam */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRecordingMode('both')}
                        className={cn(
                          'p-6 rounded-xl border-2 cursor-pointer transition-all text-center relative',
                          recordingMode === 'both'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        )}
                      >
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500">
                          Popular
                        </Badge>
                        <div className="relative w-12 h-12 mx-auto mb-3">
                          <Monitor className="w-12 h-12 text-primary" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Camera className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <h3 className="font-semibold">Screen + Webcam</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Best for presentations
                        </p>
                      </motion.div>

                      {/* Webcam Only */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRecordingMode('webcam')}
                        className={cn(
                          'p-6 rounded-xl border-2 cursor-pointer transition-all text-center',
                          recordingMode === 'webcam'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        )}
                      >
                        <Camera className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <h3 className="font-semibold">Webcam Only</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Record yourself
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Audio Settings */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          <Label>Microphone</Label>
                        </div>
                        <Switch
                          checked={micEnabled}
                          onCheckedChange={setMicEnabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          <Label>System Audio</Label>
                        </div>
                        <Switch
                          checked={systemAudio}
                          onCheckedChange={setSystemAudio}
                        />
                      </div>

                      {recordingMode !== 'screen' && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <Label>Webcam Bubble</Label>
                          </div>
                          <Switch
                            checked={showWebcam}
                            onCheckedChange={setShowWebcam}
                          />
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Quality */}
                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={(v: 'high' | 'medium' | 'low') => setQuality(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High (1080p, 8 Mbps)</SelectItem>
                          <SelectItem value="medium">Medium (720p, 4 Mbps)</SelectItem>
                          <SelectItem value="low">Low (480p, 2 Mbps)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Recording Title */}
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={recordingTitle}
                        onChange={(e) => setRecordingTitle(e.target.value)}
                        placeholder="My Recording"
                      />
                    </div>

                    <Separator />

                    {/* Teleprompter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <Label>Teleprompter</Label>
                        </div>
                        <Button
                          variant={showTeleprompter ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowTeleprompter(!showTeleprompter)}
                        >
                          {showTeleprompter ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                      {showTeleprompter && (
                        <Textarea
                          value={teleprompterScript}
                          onChange={(e) => setTeleprompterScript(e.target.value)}
                          placeholder="Enter your script here... The teleprompter will scroll this text during recording."
                          rows={4}
                          className="text-sm"
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use the teleprompter to read from a script while recording
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Start Recording Button */}
            {recordingState.status === 'idle' && (
              <div className="flex justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={handleStartRecording}
                    disabled={!capabilities.screenCapture}
                    className="h-16 px-12 text-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full shadow-lg"
                  >
                    <Circle className="w-6 h-6 mr-3 fill-current" />
                    Start Recording
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Tips */}
            {recordingState.status === 'idle' && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Pro Tips</h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          Press <kbd className="px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-xs">Space</kbd> to pause/resume
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          Use <kbd className="px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-xs">Alt+W</kbd> to toggle webcam
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          Drag the webcam bubble anywhere on screen
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            {/* Library header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recordings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Badge variant="secondary">
                  {filteredRecordings.length} recordings
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Recordings Grid/List */}
            {filteredRecordings.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No recordings yet</h3>
                <p className="text-muted-foreground mt-1">
                  Start recording to see your videos here
                </p>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecordings.map((recording) => (
                  <Card key={recording.id} className="overflow-hidden group">
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                      {recording.thumbnailUrl ? (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                        {formatDuration(recording.duration)}
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{recording.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {recording.viewCount}
                            </span>
                            <span>{formatDate(recording.createdAt)}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRecording(recording);
                              setShowShareDialog(true);
                            }}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyShareLink(recording.shareUrl || '')}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRecording(recording);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {filteredRecordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-32 aspect-video rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                          <Video className="w-6 h-6 text-gray-400" />
                          <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-white text-[10px]">
                            {formatDuration(recording.duration)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{recording.title}</h3>
                          {recording.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {recording.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {recording.viewCount} views
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {formatFileSize(recording.fileSize)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(recording.createdAt)}
                            </span>
                            {recording.isPublic ? (
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyShareLink(recording.shareUrl || '')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRecording(recording);
                              setShowShareDialog(true);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedRecording(recording);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Recording</DialogTitle>
            <DialogDescription>
              Anyone with the link can view this recording
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={selectedRecording?.shareUrl || ''}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => copyShareLink(selectedRecording?.shareUrl || '')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Public access</span>
              </div>
              <Switch checked={selectedRecording?.isPublic} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recording</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedRecording?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRecording && deleteRecording(selectedRecording.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teleprompter Overlay */}
      <TeleprompterOverlay
        isVisible={showTeleprompter}
        onClose={() => setShowTeleprompter(false)}
        initialScript={teleprompterScript}
      />
    </div>
  );
}
