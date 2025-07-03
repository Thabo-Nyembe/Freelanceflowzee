import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoProcessingStatus } from '@/lib/mux/config';

export interface VideoStatus {
  id: string;
  processing_status: VideoProcessingStatus;
  mux_asset_id?: string;
  mux_playback_id?: string;
  transcript?: string;
  ai_summary?: string;
  ai_action_items?: any[];
  ai_insights?: any;
  thumbnail_path?: string;
  duration_seconds?: number;
  resolution?: string;
  // Timestamps for tracking processing stages
  uploaded_at?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  transcription_started_at?: string;
  transcription_completed_at?: string;
  ai_analysis_started_at?: string;
  ai_analysis_completed_at?: string;
}

export interface UseVideoStatusOptions {
  videoId: string;
  enabled?: boolean;
  pollingInterval?: number; // in milliseconds
  maxPollingDuration?: number; // in milliseconds
  onStatusChange?: (status: VideoStatus) => void;
  onProcessingComplete?: (video: VideoStatus) => void;
  onError?: (error: Error) => void;
}

export interface UseVideoStatusReturn {
  status: VideoStatus | null;
  isLoading: boolean;
  error: Error | null;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  refetch: () => Promise<void>;
  // Helper status checks
  isUploading: boolean;
  isProcessing: boolean;
  isTranscribing: boolean;
  isReady: boolean;
  hasError: boolean;
  // Progress indicators
  uploadProgress: number;
  processingProgress: number;
  overallProgress: number;
}

export function useVideoStatus({
  videoId,
  enabled = true,
  pollingInterval = 2000, // Poll every 2 seconds
  maxPollingDuration = 300000, // Stop polling after 5 minutes
  onStatusChange,
  onProcessingComplete,
  onError,
}: UseVideoStatusOptions): UseVideoStatusReturn {
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch video status from API
  const fetchVideoStatus = useCallback(async () => {
    if (!videoId) return;

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`/api/video/${videoId}/status`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video status: ${response.statusText}`);
      }

      const videoStatus: VideoStatus = await response.json();
      
      setStatus(prevStatus => {
        // Only update if status actually changed
        if (JSON.stringify(prevStatus) !== JSON.stringify(videoStatus)) {
          onStatusChange?.(videoStatus);
          
          // Check if processing is complete
          if (videoStatus.processing_status === 'ready' && prevStatus?.processing_status !== 'ready') {
            onProcessingComplete?.(videoStatus);
          }
          
          return videoStatus;
        }
        return prevStatus;
      });

      setError(null);
      return videoStatus;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [videoId, onStatusChange, onProcessingComplete, onError]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling || !enabled) return;

    setIsPolling(true);
    pollingStartTimeRef.current = Date.now();

    const poll = async () => {
      try {
        const currentStatus = await fetchVideoStatus();
        
        // Stop polling if video is ready or errored
        if (currentStatus?.processing_status === 'ready' || currentStatus?.processing_status === 'errored') {
          setIsPolling(false);
          return;
        }

        // Stop polling if max duration exceeded
        if (pollingStartTimeRef.current && Date.now() - pollingStartTimeRef.current > maxPollingDuration) {
          setIsPolling(false);
          console.warn('Video status polling stopped due to timeout');
          return;
        }

        // Schedule next poll
        pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
      } catch (err) {
        setIsPolling(false);
        console.error('Polling stopped due to error:', err);
      }
    };

    poll();
  }, [isPolling, enabled, fetchVideoStatus, pollingInterval, maxPollingDuration]);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Manual refetch
  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchVideoStatus();
    } finally {
      setIsLoading(false);
    }
  }, [fetchVideoStatus]);

  // Auto-start polling when enabled
  useEffect(() => {
    if (enabled && videoId) {
      refetch().then(() => {
        // Only start polling if video is not already ready
        if (status?.processing_status && !['ready', 'errored'].includes(status.processing_status)) {
          startPolling();
        }
      });
    }

    return () => {
      stopPolling();
    };
  }, [videoId, enabled]); // Only depend on videoId and enabled

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Helper status checks
  const isUploading = status?.processing_status === 'uploading';
  const isProcessing = status?.processing_status === 'processing' || status?.processing_status === 'uploaded';
  const isTranscribing = status?.processing_status === 'transcribing';
  const isReady = status?.processing_status === 'ready';
  const hasError = status?.processing_status === 'errored';

  // Progress calculations
  const getProgress = useCallback(() => {
    if (!status) return { uploadProgress: 0, processingProgress: 0, overallProgress: 0 };

    const statusProgress: Record<VideoProcessingStatus, number> = {
      uploading: 20,
      uploaded: 40,
      processing: 60,
      transcribing: 80,
      transcribed: 90,
      ready: 100,
      errored: 0,
    };

    const uploadProgress = isUploading ? 100 : (status.processing_status ? 100 : 0);
    const processingProgress = statusProgress[status.processing_status] || 0;
    const overallProgress = processingProgress;

    return { uploadProgress, processingProgress, overallProgress };
  }, [status, isUploading]);

  const { uploadProgress, processingProgress, overallProgress } = getProgress();

  return {
    status,
    isLoading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch,
    // Helper status checks
    isUploading,
    isProcessing,
    isTranscribing,
    isReady,
    hasError,
    // Progress indicators
    uploadProgress,
    processingProgress,
    overallProgress,
  };
} 