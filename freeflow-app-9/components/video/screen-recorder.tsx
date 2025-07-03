"use client";

/**
 * Screen Recorder Component
 * Professional screen recording with audio capture
 * Integrated with FreeFlow's video upload infrastructure
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Pause, 
  Download,
  Upload,
  Settings,
  Video,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useScreenRecorder, RecordingOptions } from '@/hooks/use-screen-recorder';
import { formatDuration } from '@/lib/video/config';

interface ScreenRecorderProps {
  projectId?: string;
  onRecordingComplete?: (videoBlob: Blob, metadata: any) => void;
  onUploadComplete?: (videoId: string) => void;
  className?: string;
}

export default function ScreenRecorder({ 
  projectId, 
  onRecordingComplete, 
  onUploadComplete,
  className 
}: ScreenRecorderProps) {
  // Recording options
  const [options, setOptions] = useState<RecordingOptions>({
    video: {
      mediaSource: 'screen',
      audio: true,
      systemAudio: false,
      quality: 'high',
      frameRate: 30
    },
    title: '',
    projectId: projectId,
    autoUpload: true
  });

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Preview refs
  const previewRef = useRef<HTMLVideoElement>(null);

  // Use the screen recorder hook
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
    streamRef
  } = useScreenRecorder({ onRecordingComplete, onUploadComplete });

  // Start recording with current options
  const handleStartRecording = () => {
    startRec(options);
  };

  // Handle upload with progress tracking
  const handleUpload = async () => {
    if (!recordingBlob) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await uploadRecording(options);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Set preview stream when recording starts
  React.useEffect(() => {
    if (previewRef.current && streamRef.current && recordingState.status === 'recording') {
      previewRef.current.srcObject = streamRef.current;
      previewRef.current.play();
    }
  }, [recordingState.status, streamRef]);

  // Helper functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render recording status indicator
  const renderStatusIndicator = () => {
    const statusConfig = {
      idle: { icon: Monitor, color: 'bg-gray-500', label: 'Ready to Record' },
      setup: { icon: Loader2, color: 'bg-blue-500', label: 'Setting Up...' },
      recording: { icon: Video, color: 'bg-red-500', label: 'Recording' },
      paused: { icon: Pause, color: 'bg-yellow-500', label: 'Paused' },
      stopping: { icon: Loader2, color: 'bg-orange-500', label: 'Stopping...' },
      completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed' },
      error: { icon: AlertCircle, color: 'bg-red-500', label: 'Error' }
    };

    const config = statusConfig[recordingState.status];
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${config.color} ${recordingState.status === 'recording' ? 'animate-pulse' : ''}`} />
        <Icon className={`w-4 h-4 ${recordingState.status === 'setup' || recordingState.status === 'stopping' ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  };

  if (!capabilities.screenCapture) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Screen recording is not supported in this browser. Please use Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Screen Recorder</span>
          {renderStatusIndicator()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Options */}
        {recordingState.status === 'idle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Recording Title</Label>
                <Input
                  id="title"
                  placeholder="My Screen Recording"
                  value={options.title}
                  onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quality">Quality</Label>
                <Select 
                  value={options.video.quality} 
                  onValueChange={(value: any) => setOptions(prev => ({ 
                    ...prev, 
                    video: { ...prev.video, quality: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (8 Mbps)</SelectItem>
                    <SelectItem value="medium">Medium (4 Mbps)</SelectItem>
                    <SelectItem value="low">Low (2 Mbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select 
                  value={options.video.mediaSource} 
                  onValueChange={(value: any) => setOptions(prev => ({ 
                    ...prev, 
                    video: { ...prev.video, mediaSource: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screen">Entire Screen</SelectItem>
                    <SelectItem value="window">Application Window</SelectItem>
                    <SelectItem value="tab">Browser Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="framerate">Frame Rate</Label>
                <Select 
                  value={options.video.frameRate.toString()} 
                  onValueChange={(value) => setOptions(prev => ({ 
                    ...prev, 
                    video: { ...prev.video, frameRate: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="15">15 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <Label htmlFor="microphone">Include Microphone</Label>
                </div>
                <Switch
                  id="microphone"
                  checked={options.video.audio}
                  onCheckedChange={(checked) => setOptions(prev => ({
                    ...prev,
                    video: { ...prev.video, audio: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <Label htmlFor="system-audio">System Audio</Label>
                </div>
                <Switch
                  id="system-audio"
                  checked={options.video.systemAudio}
                  onCheckedChange={(checked) => setOptions(prev => ({
                    ...prev,
                    video: { ...prev.video, systemAudio: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <Label htmlFor="auto-upload">Auto Upload</Label>
                </div>
                <Switch
                  id="auto-upload"
                  checked={options.autoUpload}
                  onCheckedChange={(checked) => setOptions(prev => ({
                    ...prev,
                    autoUpload: checked
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex justify-center gap-2">
          {recordingState.status === 'idle' && (
            <Button onClick={handleStartRecording} size="lg" className="bg-red-600 hover:bg-red-700">
              <Play className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          )}

          {(recordingState.status === 'recording' || recordingState.status === 'paused') && (
            <>
              <Button onClick={pauseRecording} variant="outline" size="lg">
                {recordingState.status === 'recording' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {recordingState.status === 'completed' && (
            <>
              <Button onClick={downloadRecording} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              {!options.autoUpload && (
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload
                </Button>
              )}
              
              <Button onClick={resetRecording} variant="outline">
                Record New
              </Button>
            </>
          )}
        </div>

        {/* Recording Stats */}
        {(recordingState.status === 'recording' || recordingState.status === 'paused' || recordingState.status === 'completed') && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <Badge variant="secondary">
                {formatDuration(recordingState.duration)}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">File Size</span>
              </div>
              <Badge variant="secondary">
                {formatFileSize(recordingState.fileSize)}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Video className="w-4 h-4" />
                <span className="text-sm font-medium">Quality</span>
              </div>
              <Badge variant="secondary">
                {options.video.quality.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Error Display */}
        {recordingState.status === 'error' && recordingState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{recordingState.error}</AlertDescription>
          </Alert>
        )}

        {/* Preview Video */}
        {previewUrl && recordingState.status === 'completed' && (
          <div className="space-y-2">
            <Label>Recording Preview</Label>
            <video
              src={previewUrl}
              controls
              className="w-full rounded-lg border"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        {/* Live Preview */}
        {recordingState.status === 'recording' && (
          <div className="space-y-2">
            <Label>Live Preview</Label>
            <video
              ref={previewRef}
              autoPlay
              muted
              className="w-full rounded-lg border"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 