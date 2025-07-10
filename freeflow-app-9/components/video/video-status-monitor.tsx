'use client';

import React from 'react';
import { useVideoStatus } from '@/hooks/useVideoStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  Cog,
  Wand2,
  Image as ImageIcon,
  BarChart3,
  Pause,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoStatusMonitorProps {
  videoId: string;
  showDebugInfo?: boolean;
  autoStart?: boolean;
  className?: string;
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  icon: React.ReactNode;
  description: string;
  estimatedTime?: string;
}

export function VideoStatusMonitor({ 
  videoId: unknown, showDebugInfo = false: unknown, autoStart = true: unknown, className 
}: VideoStatusMonitorProps) {
  const {
    status,
    isLoading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch,
    isUploading,
    isProcessing,
    isTranscribing,
    isReady,
    hasError,
    uploadProgress,
    processingProgress,
    overallProgress
  } = useVideoStatus({
    videoId,
    enabled: autoStart,
    pollingInterval: 2000,
    maxPollingDuration: 600000, // 10 minutes
    onStatusChange: (newStatus) => {
      console.log('Status changed:', newStatus);
    },
    onProcessingComplete: (video) => {
      console.log('Processing complete:', video);
    },
    onError: (error) => {
      console.error('Video status error:', error);
    }
  });

  // Define processing steps based on status
  const getProcessingSteps = (): ProcessingStep[] => {
    const steps: ProcessingStep[] = [
      {
        name: 'upload',
        status: isUploading ? 'processing' : (status?.processing_status === 'uploading' ? 'processing' : 'completed'),
        progress: uploadProgress,
        icon: <Upload className="h-4 w-4" />,
        description: 'Uploading video file to server',
        estimatedTime: isUploading ? '2-5 minutes' : undefined
      },
      {
        name: 'encoding',
        status: isProcessing ? 'processing' : (isReady ? 'completed' : (isUploading ? 'pending' : 'processing')),
        progress: processingProgress,
        icon: <Cog className="h-4 w-4" />,
        description: 'Processing and encoding video',
        estimatedTime: isProcessing ? '3-8 minutes' : undefined
      },
      {
        name: 'thumbnail',
        status: isReady ? 'completed' : (isProcessing ? 'processing' : 'pending'),
        progress: isReady ? 100 : (isProcessing ? 50 : 0),
        icon: <ImageIcon className="h-4 w-4" />,
        description: 'Generating thumbnails and preview',
        estimatedTime: isProcessing ? '1-2 minutes' : undefined
      },
      {
        name: 'ai_analysis',
        status: status?.transcript ? 'completed' : (isReady ? 'processing' : 'pending'),
        progress: status?.transcript ? 100 : (isReady ? 75 : 0),
        icon: <Wand2 className="h-4 w-4" />,
        description: 'AI transcription and analysis',
        estimatedTime: isReady && !status?.transcript ? '2-4 minutes' : undefined
      }
    ];

    if (hasError) {
      steps.forEach(step => {
        if (step.status === 'processing') {
          step.status = 'error';
        }
      });
    }

    return steps;
  };

  const steps = getProcessingSteps();
  const currentStep = steps.find(step => step.status === 'processing');

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'processing': return 'secondary';
      case 'uploading': return 'outline';
      case 'errored': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isReady ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : hasError ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : isPolling ? (
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              Video Processing Status
            </CardTitle>
            <CardDescription>
              Real-time updates for video processing pipeline
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(status?.processing_status || 'unknown')}>
              {status?.processing_status || 'Loading...'}
            </Badge>
            
            {!autoStart && (
              <Button
                variant="outline"
                size="sm"
                onClick={isPolling ? stopPolling : startPolling}
                disabled={isLoading}
              >
                {isPolling ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Step Highlight */}
        {currentStep && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 dark:text-blue-400">
                {currentStep.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Currently {currentStep.description.toLowerCase()}
                </div>
                {currentStep.estimatedTime && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Estimated time remaining: {currentStep.estimatedTime}
                  </div>
                )}
              </div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">
                {currentStep.progress}%
              </div>
            </div>
            <Progress value={currentStep.progress} className="mt-3 h-1" />
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Processing Pipeline</h4>
          
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className={cn("transition-colors", getStatusColor(step.status))}>
                {step.status === 'processing' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : step.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {step.name.replace('_', ' ')}
                  </span>
                  <Badge 
                    variant={step.status === 'completed' ? 'default' : 'outline'}
                    className={cn(
                      "text-xs",
                      step.status === 'processing' && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    )}
                  >
                    {step.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                
                {step.status === 'processing' && (
                  <div className="mt-2">
                    <Progress value={step.progress} className="h-1" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Video Ready Actions */}
        {isReady && status && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <CheckCircle className="h-4 w-4" />
              Video Ready!
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <a href={`/video/${videoId}`}>
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Watch Video
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/video/${videoId}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Analytics
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {showDebugInfo && status && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Debug Information
            </summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
              <pre>{JSON.stringify(status, null, 2)}</pre>
            </div>
          </details>
        )}

        {/* Polling Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isPolling ? 'Auto-refreshing...' : 'Manual refresh only'}
          </span>
          {(status?.processing_completed_at || status?.processing_started_at) && (
            <span>
              Last updated: {new Date(status.processing_completed_at || status.processing_started_at || '').toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 