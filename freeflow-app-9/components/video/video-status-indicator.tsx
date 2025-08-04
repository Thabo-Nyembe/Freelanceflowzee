'use client';

import { useVideoStatus } from '@/hooks/useVideoStatus';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  Cog,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoStatusIndicatorProps {
  videoId: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showLabel?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export function VideoStatusIndicator({ 
  videoId, size = 'md', showProgress = true, showLabel = true, autoRefresh = true, className
}: VideoStatusIndicatorProps) {
  const {
    status,
    isUploading,
    isProcessing,
    isTranscribing,
    isReady,
    hasError,
    overallProgress
  } = useVideoStatus({
    videoId,
    enabled: autoRefresh,
    pollingInterval: 3000, // Slower polling for indicators
    maxPollingDuration: 300000
  });

  if (!status) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <RefreshCw className={cn(
          "animate-spin text-muted-foreground",
          size === 'sm' && "h-3 w-3",
          size === 'md' && "h-4 w-4", 
          size === 'lg' && "h-5 w-5"
        )} />
        {showLabel && (
          <span className={cn(
            "text-muted-foreground",
            size === 'sm' && "text-xs",
            size === 'md' && "text-sm",
            size === 'lg' && "text-base"
          )}>
            Loading...
          </span>
        )}
      </div>
    );
  }

  const getStatusIcon = () => {
    const iconClass = cn(
      size === 'sm' && "h-3 w-3",
      size === 'md' && "h-4 w-4", 
      size === 'lg' && "h-5 w-5"
    );

    if (isReady) return <CheckCircle className={cn(iconClass, "text-green-600")} />;
    if (hasError) return <AlertCircle className={cn(iconClass, "text-red-600")} />;
    if (isUploading) return <Upload className={cn(iconClass, "text-blue-600")} />;
    if (isProcessing) return <Cog className={cn(iconClass, "text-blue-600 animate-spin")} />;
    if (isTranscribing) return <RefreshCw className={cn(iconClass, "text-blue-600 animate-spin")} />;
    return <Clock className={cn(iconClass, "text-gray-400")} />;
  };

  const getStatusText = () => {
    if (isReady) return 'Ready';
    if (hasError) return 'Error';
    if (isUploading) return 'Uploading';
    if (isProcessing) return 'Processing';
    if (isTranscribing) return 'Transcribing';
    return status.processing_status || 'Unknown';
  };

  const getStatusVariant = () => {
    if (isReady) return 'default';
    if (hasError) return 'destructive';
    if (isUploading || isProcessing || isTranscribing) return 'secondary';
    return 'outline';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {getStatusIcon()}
      
      {showLabel && (
        <Badge 
          variant={getStatusVariant()}
          className={cn(
            size === 'sm' && "text-xs px-1.5 py-0.5",
            size === 'md' && "text-xs",
            size === 'lg' && "text-sm"
          )}
        >
          {getStatusText()}
        </Badge>
      )}

      {showProgress && !isReady && !hasError && (
        <div className={cn(
          "flex-1 max-w-20",
          size === 'sm' && "max-w-16",
          size === 'lg' && "max-w-24"
        )}>
          <Progress 
            value={overallProgress} 
            className={cn(
              size === 'sm' && "h-1",
              size === 'md' && "h-1.5",
              size === 'lg' && "h-2"
            )}
          />
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {overallProgress}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified version for use in thumbnail overlays
export function VideoStatusBadge({ videoId, className }: { videoId: string; className?: string }) {
  const { status, isReady, hasError, isPolling } = useVideoStatus({
    videoId,
    enabled: true,
    pollingInterval: 5000, // Slower polling for badges
  });

  if (isReady) return null; // Don&apos;t show badge for ready videos

  const getBadgeContent = () => {
    if (hasError) return { text: 'Error', variant: 'destructive' as const };
    if (!status) return { text: 'Loading', variant: 'outline' as const };
    
    switch (status.processing_status) {
      case 'uploading': return { text: 'Uploading', variant: 'secondary' as const };
      case 'processing': return { text: 'Processing', variant: 'secondary' as const };
      case 'transcribing': return { text: 'Transcribing', variant: 'secondary' as const };
      default: return { text: status.processing_status, variant: 'outline' as const };
    }
  };

  const { text, variant } = getBadgeContent();

  return (
    <Badge 
      variant={variant}
      className={cn(
        "absolute top-2 right-2 text-xs backdrop-blur-sm",
        isPolling && "animate-pulse",
        className
      )}
    >
      {text}
    </Badge>
  );
} 