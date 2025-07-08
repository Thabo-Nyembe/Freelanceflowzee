'use client';

import { useState, useEffect } from 'react';
import { MediaStreamComposer } from '@api.video/media-stream-composer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Camera, Monitor, Loader2 } from 'lucide-react';

interface VideoMessageRecorderProps {
  onRecordingComplete?: (videoUrl: string, videoId: string) => void;
  assetId?: string;
  className?: string;
}

export default function VideoMessageRecorder({ 
  onRecordingComplete, 
  assetId,
  className = '' 
}: VideoMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoId, setRecordedVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composer, setComposer] = useState<MediaStreamComposer | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasScreen, setHasScreen] = useState(false);
  
  const _videoRef = useRef<HTMLVideoElement>(null);
  const _containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (composer) {
        composer.stop();
      }
    };
  }, [composer]);

  const initializeComposer = async () => {
    try {
      setError(null);
      
      // Get upload token from our API
      const tokenResponse = await fetch('/api/generate-video-upload-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get upload token');
      }
      
      const { uploadToken } = await tokenResponse.json();
      
      // Initialize the composer
      const newComposer = new MediaStreamComposer({
        uploadToken,
        resolution: { width: 1280, height: 720 }
      });
      
      setComposer(newComposer);
      
      // Set up event listeners
      newComposer.addEventListener('upload.success', (event: any) => {
        const videoId = event.detail.videoId;
        const videoUrl = `https://vod.api.video/vod/${videoId}/hls/manifest.m3u8`;
        
        setRecordedVideoUrl(videoUrl);
        setRecordedVideoId(videoId);
        setIsProcessing(false);
        
        // Call the callback if provided
        if (onRecordingComplete) {
          onRecordingComplete(videoUrl, videoId);
        }
        
        // Save to feedback system if assetId is provided
        if (assetId) {
          saveFeedback(videoId, videoUrl);
        }
      });
      
      newComposer.addEventListener('upload.error', (event: any) => {
        console.error('Upload error:', event.detail);
        setError('Failed to upload recording');
        setIsProcessing(false);
      });
      
    } catch (err) {
      console.error('Failed to initialize composer:', err);
      setError('Failed to initialize recorder');
    }
  };

  const saveFeedback = async (videoId: string, videoUrl: string) => {
    try {
      const response = await fetch('/api/collaboration/universal-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'video',
          content: `Video feedback: ${videoUrl}`,
          assetId,
          metadata: {
            videoId,
            videoUrl,
            recordedAt: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save feedback');
      }
    } catch (err) {
      console.error('Error saving feedback:', err);
    }
  };

  const startCamera = async () => {
    if (!composer) await initializeComposer();
    
    try {
      await composer?.addUserMedia({ video: true, audio: true });
      setHasCamera(true);
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to access camera');
    }
  };

  const startScreen = async () => {
    if (!composer) await initializeComposer();
    
    try {
      await composer?.addDisplayMedia({ video: true, audio: true });
      setHasScreen(true);
    } catch (err) {
      console.error('Failed to start screen capture:', err);
      setError('Failed to access screen');
    }
  };

  const startRecording = async () => {
    if (!composer) {
      setError('Recorder not initialized');
      return;
    }
    
    try {
      setError(null);
      setIsRecording(true);
      await composer.start();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!composer) return;
    
    try {
      setIsRecording(false);
      setIsProcessing(true);
      await composer.stop();
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording');
      setIsProcessing(false);
    }
  };

  const prepareRecording = async () => {
    await initializeComposer();
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Record Video Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {!composer && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Click "Prepare to Record" to initialize the video recorder.
            </p>
            <Button onClick={prepareRecording} className="w-full">
              Prepare to Record
            </Button>
          </div>
        )}
        
        {composer && !isRecording && !recordedVideoUrl && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enable your camera and/or screen sharing, then start recording.
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={startCamera} 
                variant={hasCamera ? "default" : "outline"}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {hasCamera ? "Camera Active" : "Start Webcam"}
              </Button>
              
              <Button 
                onClick={startScreen} 
                variant={hasScreen ? "default" : "outline"}
                className="flex-1"
              >
                <Monitor className="w-4 h-4 mr-2" />
                {hasScreen ? "Screen Active" : "Start Screen"}
              </Button>
            </div>
            
            {(hasCamera || hasScreen) && (
              <Button onClick={startRecording} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}
          </div>
        )}
        
        {isRecording && (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Recording in progress...
              </div>
            </div>
            
            <Button onClick={stopRecording} variant="destructive" className="w-full">
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing and uploading...
            </div>
          </div>
        )}
        
        {recordedVideoUrl && recordedVideoId && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              Recording Complete!
            </div>
            
            <div className="relative">
              <iframe
                src={`https://embed.api.video/vod/${recordedVideoId}`}
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                title="api.video player"
                className="rounded-md"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 