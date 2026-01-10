"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface RecordingOptions {
  video: {
    mediaSource: 'screen' | 'window' | 'tab';
    audio: boolean;
    systemAudio: boolean;
    quality: 'high' | 'medium' | 'low';
    frameRate: number;
  };
  title: string;
  projectId?: string;
  autoUpload: boolean;
}

export interface RecordingState {
  status: 'idle' | 'setup' | 'recording' | 'paused' | 'stopping' | 'completed' | 'error';
  duration: number;
  fileSize: number;
  error?: string;
}

interface UseScreenRecorderProps {
  onRecordingComplete?: (videoBlob: Blob, metadata) => void;
  onUploadComplete?: (videoId: string) => void;
}

export function useScreenRecorder({ onRecordingComplete, onUploadComplete }: UseScreenRecorderProps = {}) {
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>({
    status: 'idle',
    duration: 0,
    fileSize: 0
  });

  // Recording infrastructure
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording data
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Browser capabilities
  const [capabilities, setCapabilities] = useState<any>({
    screenCapture: false,
    audioCapture: false,
    systemAudio: false
  });

  // Check browser capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const caps = {
        screenCapture: 'getDisplayMedia' in navigator.mediaDevices,
        audioCapture: 'getUserMedia' in navigator.mediaDevices,
        systemAudio: 'getDisplayMedia' in navigator.mediaDevices
      };
      setCapabilities(caps);

      if (!caps.screenCapture) {
        setRecordingState(prev => ({
          ...prev,
          status: 'error',
          error: 'Screen recording is not supported in this browser'
        }));
      }
    };

    checkCapabilities();
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (recordingState.status === 'recording') {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setRecordingState(prev => ({
          ...prev,
          duration: Math.floor(elapsed / 1000)
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState.status]);

  // Helper functions
  const getSupportedMimeType = useCallback(() => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
  }, []);

  const getVideoBitrate = useCallback((quality: string) => {
    switch (quality) {
      case 'high': return 8000000; // 8 Mbps
      case 'medium': return 4000000; // 4 Mbps
      case 'low': return 2000000; // 2 Mbps
      default: return 4000000;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (options: RecordingOptions) => {
    try {
      setRecordingState(prev => ({ ...prev, status: 'setup' }));

      // Configure display media constraints
      const displayMediaOptions = {
        video: {
          mediaSource: options.video.mediaSource as any,
          frameRate: { ideal: options.video.frameRate },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: options.video.systemAudio
      };

      // Get display media stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      const combinedStream = displayStream;

      // Add microphone audio if requested
      if (options.video.audio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });

          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            combinedStream.addTrack(audioTrack);
          }
        } catch (audioError) {
          console.warn('Could not access microphone:', audioError);
          toast.warning('Microphone access denied, recording without audio');
        }
      }

      streamRef.current = combinedStream;

      // Configure MediaRecorder
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: getVideoBitrate(options.video.quality),
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // MediaRecorder event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          
          const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          setRecordingState(prev => ({ ...prev, fileSize: totalSize }));
        }
      };

      mediaRecorder.onstop = async () => {
        const recordingBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordingBlob(recordingBlob);

        const url = URL.createObjectURL(recordingBlob);
        setPreviewUrl(url);

        setRecordingState(prev => ({
          ...prev,
          status: 'completed',
          fileSize: recordingBlob.size
        }));

        if (onRecordingComplete) {
          // Calculate duration from start time ref to avoid stale closure
          const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onRecordingComplete(recordingBlob, {
            duration: finalDuration,
            size: recordingBlob.size,
            mimeType,
            options
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingState(prev => ({
          ...prev,
          status: 'error',
          error: 'Recording failed'
        }));
      };

      // Handle stream end
      combinedStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      };

      // Start recording
      startTimeRef.current = Date.now();
      mediaRecorder.start(1000);

      setRecordingState(prev => ({
        ...prev,
        status: 'recording',
        duration: 0,
        fileSize: 0,
        error: undefined
      }));

      toast.success('Recording started successfully!');

    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
      toast.error('Failed to start recording');
    }
  }, [getSupportedMimeType, getVideoBitrate, onRecordingComplete]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setRecordingState(prev => ({ ...prev, status: 'stopping' }));
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Pause/resume recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (recordingState.status === 'recording') {
        mediaRecorderRef.current.pause();
        setRecordingState(prev => ({ ...prev, status: 'paused' }));
      } else if (recordingState.status === 'paused') {
        mediaRecorderRef.current.resume();
        setRecordingState(prev => ({ ...prev, status: 'recording' }));
      }
    }
  }, [recordingState.status]);

  // Reset recording
  const resetRecording = useCallback(() => {
    setRecordingState({
      status: 'idle',
      duration: 0,
      fileSize: 0
    });
    setRecordingBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    chunksRef.current = [];
  }, [previewUrl]);

  // Download recording
  const downloadRecording = useCallback(() => {
    if (!recordingBlob) return;

    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screen-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordingBlob]);

  // Upload recording
  const uploadRecording = useCallback(async (options: RecordingOptions) => {
    if (!recordingBlob) return;

    try {
      const fileName = `screen-recording-${Date.now()}.webm`;
      const title = options.title || `Screen Recording ${new Date().toLocaleDateString()}`;

      const uploadResponse = await fetch('/api/video/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileSize: recordingBlob.size,
          fileType: recordingBlob.type,
          title,
          description: `Screen recording captured on ${new Date().toLocaleString()}`,
          project_id: options.projectId,
          tags: ['screen-recording', 'freeflow'],
          is_public: false
        })
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to create upload URL');
      }

      const uploadData = await uploadResponse.json();
      const { uploadUrl } = uploadData.data.upload;

      // Upload to Mux
      const formData = new FormData();
      formData.append('file', recordingBlob, fileName);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success('Recording uploaded successfully!');
      if (onUploadComplete) {
        onUploadComplete(uploadData.data.video.id);
      }

      return uploadData.data.video.id;

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload recording');
      throw error;
    }
  }, [recordingBlob, onUploadComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [stopRecording, previewUrl]);

  return {
    // State
    recordingState,
    recordingBlob,
    previewUrl,
    capabilities,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resetRecording,
    downloadRecording,
    uploadRecording,
    
    // Refs for advanced usage
    streamRef,
    mediaRecorderRef
  };
} 