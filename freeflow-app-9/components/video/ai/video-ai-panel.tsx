'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Sparkles,
  Eye,
  Wand2,
  Camera,
  Megaphone,
  Shield,
  FileVideo,
  Users,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import TranscriptionViewer from './transcription-viewer';
import AIInsightsDashboard from './ai-insights-dashboard';
import { 
  IntegratedAISystem, 
  AIOperationType, 
  AIOperationStatus, 
  AIEventType,
  AIOperationResult,
  AIOperationProgress
} from '@/lib/ai/integrated-ai-system';

// Enhanced types for video AI data
interface VideoTranscription {
  id: string;
  text: string;
  segments: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    speaker?: string;
    confidence: number;
  }>;
  language: string;
  confidence: number;
  wordCount: number;
  processingTime: number;
}

interface VideoAnalysis {
  id: string;
  summary: string;
  main_topics: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target_audience: string;
  key_insights: string[];
  action_items: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  detected_language: string;
  estimated_watch_time: string;
  content_type: string;
  confidence_score?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface VideoTag {
  tag: string;
  category?: string;
  confidence_score?: number;
  source: 'ai_generated' | 'manual' | 'imported';
}

interface VideoChapter {
  id: string;
  title: string;
  description?: string;
  start_time: number;
  end_time: number;
  confidence: number;
  keywords?: string[];
  thumbnail_url?: string;
}

interface VideoScene {
  id: string;
  start_time: number;
  end_time: number;
  description?: string;
  confidence: number;
  visual_elements?: Array<{
    type: 'text' | 'logo' | 'face' | 'object';
    description: string;
    confidence: number;
    boundingBox?: { x: number, y: number, width: number, height: number };
  }>;
}

interface EmotionData {
  timestamp: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    neutral: number;
  };
  dominant_emotion: string;
  confidence: number;
}

interface AudioQualityAnalysis {
  overall_score: number;
  issues: Array<{
    type: 'noise' | 'clipping' | 'volume' | 'clarity' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp_start?: number;
    timestamp_end?: number;
    recommendation?: string;
  }>;
}

interface ContentModerationResult {
  safe: boolean;
  flags: Array<{
    category: string;
    confidence: number;
    timestamp_start?: number;
    timestamp_end?: number;
  }>;
  overall_safety_score: number;
}

interface VideoAIData {
  transcription?: VideoTranscription;
  analysis?: VideoAnalysis;
  tags?: VideoTag[];
  chapters?: VideoChapter[];
  scenes?: VideoScene[]; // Phase 2: Advanced scene detection
  emotions?: EmotionData[]; // Phase 2: Emotion analysis
  audioQuality?: AudioQualityAnalysis; // Phase 2: Audio quality analysis
  moderation?: ContentModerationResult; // Phase 2: Content moderation
  status: {
    overall: 'pending' | 'processing' | 'completed' | 'failed' | 'disabled';
    startedAt?: string;
    completedAt?: string;
    progress?: number;
    currentStep?: string;
    features: {
      transcription: boolean;
      analysis: boolean;
      tags: boolean;
      chapters: boolean;
      scenes?: boolean; // Phase 2
      emotions?: boolean; // Phase 2
      audioQuality?: boolean; // Phase 2
      moderation?: boolean; // Phase 2
    };
    processingCost?: number;
    estimatedTimeRemaining?: number;
  };
}

interface VideoAIPanelProps {
  videoId: string;
  videoTitle?: string;
  videoDuration?: number;
  aiData?: VideoAIData;
  isLoading?: boolean;
  onProcessAI?: (features: Record<string, boolean>, options: Record<string, any>) => Promise<void>;
  onSeekTo?: (timestamp: number) => void;
  onCollaborationUpdate?: (update: any) => void;
  className?: string;
}

export function VideoAIPanel({
  videoId, 
  videoTitle, 
  videoDuration, 
  aiData, 
  isLoading = false, 
  onProcessAI, 
  onSeekTo, 
  onCollaborationUpdate,
  className
}: VideoAIPanelProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [currentProcessingStep, setCurrentProcessingStep] = useState<string>('');
  const [operationId, setOperationId] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [costEstimate, setCostEstimate] = useState<number | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [activeCollaborators, setActiveCollaborators] = useState<Array<{id: string, name: string, cursor?: {x: number, y: number}}>>([]);
  
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({
    transcription: true,
    analysis: true,
    tagging: true,
    chapters: true,
    scenes: false,     // Phase 2: Advanced scene detection
    emotions: false,   // Phase 2: Emotion analysis
    audioQuality: false, // Phase 2: Audio quality analysis
    moderation: false  // Phase 2: Content moderation
  });
  
  const [processingOptions, setProcessingOptions] = useState<Record<string, any>>({
    language: 'auto',
    force: false,
    provider: 'auto', // Auto-select best provider
    quality: 'standard', // standard or high
    priority: 'normal', // low, normal, high
    enableFallback: true // Use fallback providers if primary fails
  });
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const aiSystem = useRef<IntegratedAISystem>(IntegratedAISystem.getInstance());
  const unsubscribeRef = useRef<() => void | null>(null);

  // Initialize AI system and subscribe to events
  useEffect(() => {
    // Initialize AI system if not already initialized
    if (!aiSystem.current) {
      aiSystem.current = IntegratedAISystem.getInstance();
    }

    // Subscribe to AI events
    const unsubscribe = aiSystem.current.subscribe(AIEventType.OPERATION_PROGRESS, (event) => {
      const progress = event.payload as AIOperationProgress;
      if (progress.requestId === operationId) {
        setProcessingProgress(progress.progress);
        setCurrentProcessingStep(progress.currentStep || '');
        setEstimatedTimeRemaining(progress.estimatedTimeRemaining || null);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Also subscribe to operation completion
    const unsubscribeComplete = aiSystem.current.subscribe(AIEventType.OPERATION_COMPLETED, (event) => {
      const result = event.payload.result as AIOperationResult;
      if (result.requestId === operationId) {
        setIsProcessing(false);
        setProcessingProgress(100);
        
        // Update cost information
        if (result.cost) {
          setCostEstimate(result.cost);
        }
      }
    });

    // Subscribe to operation failures
    const unsubscribeFailed = aiSystem.current.subscribe(AIEventType.OPERATION_FAILED, (event) => {
      const result = event.payload.result as AIOperationResult;
      if (result.requestId === operationId) {
        setIsProcessing(false);
        setProcessingError(result.error?.message || 'Processing failed');
      }
    });

    // Subscribe to quota updates
    const unsubscribeQuota = aiSystem.current.subscribe(AIEventType.QUOTA_UPDATED, (event) => {
      const quotaUsage = event.payload.quotaUsage;
      if (quotaUsage) {
        setQuotaRemaining(quotaUsage.total - quotaUsage.used);
      }
    });

    // Clean up subscriptions on unmount
    return () => {
      unsubscribe();
      unsubscribeComplete();
      unsubscribeFailed();
      unsubscribeQuota();
    };
  }, [operationId]);

  // Auto-refresh AI data while processing
  useEffect(() => {
    if (aiData?.status.overall === 'processing') {
      const interval = setInterval(() => {
        // Check operation status if we have an operationId
        if (operationId) {
          const status = aiSystem.current.getOperationStatus(operationId);
          if (status === AIOperationStatus.COMPLETED) {
            // In a real implementation, this would trigger a refresh of the AI data
            console.log('AI processing completed');
            setIsProcessing(false);
            setProcessingProgress(100);
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [aiData?.status.overall, operationId]);

  // Handle AI processing
  const handleStartProcessing = async () => {
    if (!onProcessAI) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingError(null);
    setCurrentProcessingStep('Initializing');
    
    try {
      // First, call the provided onProcessAI function for backward compatibility
      await onProcessAI(selectedFeatures, processingOptions);
      
      // Then use our new AI system for enhanced processing
      const videoContent = {
        videoId,
        videoTitle,
        videoDuration,
        url: `/api/videos/${videoId}`, // Assuming this is the video URL
        options: processingOptions
      };
      
      // Determine which operations to perform based on selected features
      const operations = [];
      
      if (selectedFeatures.transcription) {
        operations.push(AIOperationType.SPEECH_TO_TEXT);
      }
      
      if (selectedFeatures.analysis) {
        operations.push(AIOperationType.CONTENT_GENERATION);
        operations.push(AIOperationType.KEYWORD_EXTRACTION);
      }
      
      if (selectedFeatures.chapters) {
        operations.push(AIOperationType.CHAPTER_GENERATION);
      }
      
      if (selectedFeatures.tagging) {
        operations.push(AIOperationType.KEYWORD_EXTRACTION);
      }
      
      // Phase 2 features
      if (selectedFeatures.scenes) {
        operations.push(AIOperationType.SCENE_DETECTION);
        operations.push(AIOperationType.OBJECT_DETECTION);
      }
      
      if (selectedFeatures.emotions) {
        operations.push(AIOperationType.EMOTION_ANALYSIS);
        operations.push(AIOperationType.FACE_RECOGNITION);
      }
      
      if (selectedFeatures.audioQuality) {
        operations.push(AIOperationType.AUDIO_ENHANCEMENT);
      }
      
      if (selectedFeatures.moderation) {
        operations.push(AIOperationType.CONTENT_MODERATION);
      }
      
      // Execute operations in parallel
      const promises = operations.map(operationType => {
        return aiSystem.current.executeOperation(
          operationType,
          videoContent,
          {
            provider: processingOptions.provider !== 'auto' ? processingOptions.provider : undefined,
            priority: processingOptions.priority,
            metadata: {
              videoId,
              features: selectedFeatures
            },
            webhook: `/api/webhooks/ai-processing/${videoId}`,
            onProgress: (progress) => {
              console.log(`${operationType} progress: ${progress}%`);
            }
          }
        );
      });
      
      // Store the first operation ID for tracking progress
      const firstOperation = await promises[0];
      setOperationId(firstOperation.requestId);
      
      // Wait for all operations to complete
      const results = await Promise.all(promises);
      
      // Calculate total cost
      const totalCost = results.reduce((sum, result) => sum + result.cost, 0);
      setCostEstimate(totalCost);
      
      setIsProcessing(false);
      setProcessingProgress(100);
      setCurrentProcessingStep('Processing complete');
      
    } catch (error) {
      console.error('Failed to start AI processing:', error);
      setProcessingError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsProcessing(false);
    }
  };

  // Cancel ongoing processing
  const handleCancelProcessing = async () => {
    if (operationId) {
      try {
        const cancelled = await aiSystem.current.cancelOperation(operationId);
        if (cancelled) {
          setIsProcessing(false);
          setProcessingError('Processing cancelled by user');
        }
      } catch (error) {
        console.error('Failed to cancel processing:', error);
      }
    }
  };

  // Get processing progress
  const getProcessingProgress = () => {
    // If we have direct progress from the AI system, use that
    if (isProcessing && processingProgress > 0) {
      return processingProgress;
    }
    
    // Otherwise fall back to the legacy calculation
    if (!aiData?.status.features) return 0;
    
    const features = aiData.status.features;
    const completed = Object.values(features).filter(Boolean).length;
    const total = Object.keys(selectedFeatures).filter(key => selectedFeatures[key]).length;
    
    return total > 0 ? (completed / total) * 100 : 0;
  };

  // Get status display
  const getStatusDisplay = () => {
    const status = aiData?.status.overall || 'pending';
    
    const displays = {
      pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Pending' },
      processing: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Processing' },
      completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
      failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
      disabled: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Disabled' }
    };

    return displays[status] || displays.pending;
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  
  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s remaining`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s remaining`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* AI Processing Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Processing
              <Badge variant="outline" className={cn("flex items-center gap-1", statusDisplay.color)}>
                <StatusIcon className={cn("h-3 w-3", aiData?.status.overall === 'processing' && "animate-spin")} />
                {statusDisplay.label}
              </Badge>
            </div>
            {aiData?.status.overall === 'completed' && aiData.status.completedAt && (
              <div className="text-sm text-gray-500">
                Completed {new Date(aiData.status.completedAt).toLocaleString()}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Processing Status */}
          {(aiData?.status.overall === 'processing' || isProcessing) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {currentProcessingStep || 'Processing'}
                  {activeCollaborators.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-blue-50">
                      <Users className="h-3 w-3 mr-1" /> 
                      {activeCollaborators.length} viewing
                    </Badge>
                  )}
                </span>
                <span>{Math.round(getProcessingProgress())}%</span>
              </div>
              <Progress value={getProcessingProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <div>
                  {estimatedTimeRemaining ? formatTimeRemaining(estimatedTimeRemaining) : 'Estimating time...'}
                </div>
                {costEstimate !== null && (
                  <div>Est. cost: ${costEstimate.toFixed(4)}</div>
                )}
              </div>
              {isProcessing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelProcessing}
                  className="mt-2"
                >
                  Cancel Processing
                </Button>
              )}
            </div>
          )}

          {/* Feature Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">AI Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="transcription"
                  checked={selectedFeatures.transcription}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, transcription: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="transcription" className="text-sm">
                  Transcription
                  {aiData?.status.features.transcription && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="analysis"
                  checked={selectedFeatures.analysis}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, analysis: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="analysis" className="text-sm">
                  Content Analysis
                  {aiData?.status.features.analysis && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="tagging"
                  checked={selectedFeatures.tagging}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, tagging: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="tagging" className="text-sm">
                  Smart Tags
                  {aiData?.status.features.tags && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="chapters"
                  checked={selectedFeatures.chapters}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, chapters: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="chapters" className="text-sm">
                  Chapters
                  {aiData?.status.features.chapters && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>
              
              {/* Phase 2: Advanced Video Intelligence Features */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="scenes"
                  checked={selectedFeatures.scenes}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, scenes: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="scenes" className="text-sm flex items-center">
                  Scene Detection
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">New</Badge>
                  {aiData?.status.features.scenes && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="emotions"
                  checked={selectedFeatures.emotions}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, emotions: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="emotions" className="text-sm flex items-center">
                  Emotion Analysis
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">New</Badge>
                  {aiData?.status.features.emotions && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="audioQuality"
                  checked={selectedFeatures.audioQuality}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, audioQuality: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="audioQuality" className="text-sm flex items-center">
                  Audio Quality
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">New</Badge>
                  {aiData?.status.features.audioQuality && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="moderation"
                  checked={selectedFeatures.moderation}
                  onCheckedChange={(checked) => 
                    setSelectedFeatures(prev => ({ ...prev, moderation: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="moderation" className="text-sm flex items-center">
                  Content Moderation
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">New</Badge>
                  {aiData?.status.features.moderation && (
                    <CheckCircle className="inline-block h-3 w-3 ml-1 text-green-600" />
                  )}
                </Label>
              </div>
            </div>
          </div>

          {/* Processing Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm">Language</Label>
                <Select 
                  value={processingOptions.language} 
                  onValueChange={(value) => 
                    setProcessingOptions(prev => ({ ...prev, language: value }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider" className="text-sm">AI Provider</Label>
                <Select 
                  value={processingOptions.provider} 
                  onValueChange={(value) => 
                    setProcessingOptions(prev => ({ ...prev, provider: value }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                >
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-select</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                    <SelectItem value="deepgram">Deepgram</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality" className="text-sm">Processing Quality</Label>
                <Select 
                  value={processingOptions.quality} 
                  onValueChange={(value) => 
                    setProcessingOptions(prev => ({ ...prev, quality: value }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                >
                  <SelectTrigger id="quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High (More Credits)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm">Priority</Label>
                <Select 
                  value={processingOptions.priority} 
                  onValueChange={(value) => 
                    setProcessingOptions(prev => ({ ...prev, priority: value }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High (More Credits)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableFallback"
                  checked={processingOptions.enableFallback}
                  onCheckedChange={(checked) => 
                    setProcessingOptions(prev => ({ ...prev, enableFallback: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="enableFallback" className="text-sm">
                  Enable Provider Fallback
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="force"
                  checked={processingOptions.force}
                  onCheckedChange={(checked) => 
                    setProcessingOptions(prev => ({ ...prev, force: checked }))
                  }
                  disabled={isProcessing || aiData?.status.overall === 'processing'}
                />
                <Label htmlFor="force" className="text-sm">
                  Force Re-process
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleStartProcessing}
              disabled={
                isProcessing || 
                aiData?.status.overall === 'processing' ||
                !Object.values(selectedFeatures).some(Boolean)
              }
              className="flex items-center gap-2"
            >
              {isProcessing || aiData?.status.overall === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Start AI Processing
                </>
              )}
            </Button>

            {aiData?.status.overall === 'completed' && (
              <Button
                variant="outline"
                onClick={() => handleStartProcessing()}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            )}
            
            {quotaRemaining !== null && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-auto text-xs text-gray-500 flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                      {quotaRemaining.toFixed(2)} credits remaining
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI processing credits available for your account</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Error Alert */}
          {(aiData?.status.overall === 'failed' || processingError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Processing Failed</AlertTitle>
              <AlertDescription>
                {processingError || 'AI processing failed. Please try again or contact support if the issue persists.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Results Tabs */}
      {aiData && (aiData.status.overall === 'completed' || aiData.status.overall === 'processing') && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcription" disabled={!aiData.status.features.transcription}>
              Transcription
            </TabsTrigger>
            <TabsTrigger value="insights" disabled={!aiData.status.features.analysis}>
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="chapters" disabled={!aiData.status.features.chapters}>
              Chapters
            </TabsTrigger>
            {/* Phase 2 Feature Tabs */}
            <TabsTrigger value="scenes" disabled={!aiData.status.features.scenes}>
              <Eye className="h-4 w-4 mr-1" />
              Scenes
            </TabsTrigger>
            <TabsTrigger value="emotions" disabled={!aiData.status.features.emotions}>
              <Wand2 className="h-4 w-4 mr-1" />
              Emotions
            </TabsTrigger>
            <TabsTrigger value="audio" disabled={!aiData.status.features.audioQuality}>
              <Megaphone className="h-4 w-4 mr-1" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="moderation" disabled={!aiData.status.features.moderation}>
              <Shield className="h-4 w-4 mr-1" />
              Safety
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Processing Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {aiData.status.features.transcription ? '✓' : '⏳'}
                    </div>
                    <div className="text-sm font-medium">Transcription</div>
                    <div className="text-xs text-gray-600">
                      {aiData.status.features.transcription ? 'Completed' : 'Pending'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {aiData.status.features.analysis ? '✓' : '⏳'}
                    </div>
                    <div className="text-sm font-medium">Analysis</div>
                    <div className="text-xs text-gray-600">
                      {aiData.status.features.analysis ? 'Completed' : 'Pending'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {aiData.status.features.tags ? '✓' : '⏳'}
                    </div>
                    <div className="text-sm font-medium">Smart Tags</div>
                    <div className="text-xs text-gray-600">
                      {aiData.status.features.tags ? 'Completed' : 'Pending'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {aiData.status.features.chapters ? '✓' : '⏳'}
                    </div>
                    <div className="text-sm font-medium">Chapters</div>
                    <div className="text-xs text-gray-600">
                      {aiData.status.features.chapters ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                  
                  {/* Phase 2 Feature Status */}
                  {aiData.status.features.scenes !== undefined && (
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">
                        {aiData.status.features.scenes ? '✓' : '⏳'}
                      </div>
                      <div className="text-sm font-medium">Scene Detection</div>
                      <div className="text-xs text-gray-600">
                        {aiData.status.features.scenes ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  )}
                  
                  {aiData.status.features.emotions !== undefined && (
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">
                        {aiData.status.features.emotions ? '✓' : '⏳'}
                      </div>
                      <div className="text-sm font-medium">Emotion Analysis</div>
                      <div className="text-xs text-gray-600">
                        {aiData.status.features.emotions ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  )}
                  
                  {aiData.status.features.audioQuality !== undefined && (
                    <div className="text-center p-4 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">
                        {aiData.status.features.audioQuality ? '✓' : '⏳'}
                      </div>
                      <div className="text-sm font-medium">Audio Quality</div>
                      <div className="text-xs text-gray-600">
                        {aiData.status.features.audioQuality ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  )}
                  
                  {aiData.status.features.moderation !== undefined && (
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {aiData.status.features.moderation ? '✓' : '⏳'}
                      </div>
                      <div className="text-sm font-medium">Content Moderation</div>
                      <div className="text-xs text-gray-600">
                        {aiData.status.features.moderation ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  )}
                </div>

                {aiData.status.startedAt && (
                  <div className="mt-4 text-sm text-gray-600">
                    Started: {new Date(aiData.status.startedAt).toLocaleString()}
                  </div>
                )}
                
                {aiData.status.processingCost !== undefined && (
                  <div className="mt-2 text-sm text-gray-600">
                    Processing cost: ${aiData.status.processingCost.toFixed(4)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcription">
            <TranscriptionViewer
              transcription={aiData.transcription}
              isLoading={aiData.status.overall === 'processing' && !aiData.status.features.transcription}
              onSeekTo={onSeekTo}
            />
          </TabsContent>

          <TabsContent value="insights">
            <AIInsightsDashboard
              analysis={aiData.analysis}
              tags={aiData.tags || []}
              isLoading={aiData.status.overall === 'processing' && !aiData.status.features.analysis}
              onRegenerate={() => handleStartProcessing()}
            />
          </TabsContent>

          <TabsContent value="chapters">
            {aiData.chapters && aiData.chapters.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Video Chapters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiData.chapters.map((chapter, index: number) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => onSeekTo?.(chapter.start_time)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{chapter.title}</div>
                          {chapter.description && (
                            <div className="text-sm text-gray-600 mt-1">{chapter.description}</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {Math.floor(chapter.start_time / 60)}:{Math.floor(chapter.start_time % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No chapters generated yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Phase 2 Feature Content */}
          <TabsContent value="scenes">
            {aiData.scenes && aiData.scenes.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Scene Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiData.scenes.map((scene, index) => (
                      <div 
                        key={scene.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                          <div className="font-medium">Scene {index + 1}</div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(scene.start_time / 60)}:{Math.floor(scene.start_time % 60).toString().padStart(2, '0')} - 
                            {Math.floor(scene.end_time / 60)}:{Math.floor(scene.end_time % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        <div className="p-3 flex gap-4">
                          <div 
                            className="w-32 h-20 bg-gray-200 rounded flex-shrink-0 cursor-pointer"
                            onClick={() => onSeekTo?.(scene.start_time)}
                          >
                            {/* Thumbnail would go here */}
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="h-6 w-6 text-gray-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">{scene.description || 'No description available'}</p>
                            
                            {scene.visual_elements && scene.visual_elements.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">Visual Elements:</p>
                                <div className="flex flex-wrap gap-1">
                                  {scene.visual_elements.map((element, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {element.type === 'text' && <FileText className="h-3 w-3 mr-1" />}
                                      {element.type === 'logo' && <FileVideo className="h-3 w-3 mr-1" />}
                                      {element.type === 'face' && <Users className="h-3 w-3 mr-1" />}
                                      {element.type === 'object' && <Camera className="h-3 w-3 mr-1" />}
                                      {element.description}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No scene detection data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="emotions">
            {aiData.emotions && aiData.emotions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Emotion Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Emotion visualization would go here */}
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Emotion timeline visualization</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {aiData.emotions.slice(0, 6).map((emotion, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="text-sm font-medium mb-1">
                            {Math.floor(emotion.timestamp / 60)}:{Math.floor(emotion.timestamp % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-lg font-bold capitalize">{emotion.dominant_emotion}</div>
                          <div className="mt-2 space-y-1">
                            {Object.entries(emotion.emotions).map(([key, value]) => (
                              <div key={key} className="flex items-center text-xs">
                                <span className="w-16 capitalize">{key}</span>
                                <div className="flex-1">
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 rounded-full" 
                                      style={{ width: `${value * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="w-8 text-right">{Math.round(value * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  <Wand2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No emotion analysis data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="audio">
            {aiData.audioQuality ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Audio Quality Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center relative">
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-green-500"
                          style={{ 
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(aiData.audioQuality.overall_score * Math.PI * 2)}% ${50 - 50 * Math.sin(aiData.audioQuality.overall_score * Math.PI * 2)}%, 50% 0%)`,
                          }}
                        ></div>
                        <span className="text-3xl font-bold">{Math.round(aiData.audioQuality.overall_score * 100)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Overall Audio Score</h3>
                        <p className="text-gray-600">
                          {aiData.audioQuality.overall_score > 0.8 ? 'Excellent audio quality' : 
                           aiData.audioQuality.overall_score > 0.6 ? 'Good audio quality' :
                           aiData.audioQuality.overall_score > 0.4 ? 'Average audio quality' :
                           'Poor audio quality, consider re-recording'}
                        </p>
                      </div>
                    </div>
                    
                    {aiData.audioQuality.issues.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Detected Issues</h3>
                        <div className="space-y-3">
                          {aiData.audioQuality.issues.map((issue, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "mr-2",
                                      issue.severity === 'high' ? "bg-red-100 text-red-800" :
                                      issue.severity === 'medium' ? "bg-yellow-100 text-yellow-800" :
                                      "bg-blue-100 text-blue-800"
                                    )}
                                  >
                                    {issue.severity}
                                  </Badge>
                                  <span className="font-medium capitalize">{issue.type}</span>
                                </div>
                                {issue.timestamp_start !== undefined && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => onSeekTo?.(issue.timestamp_start!)}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    {Math.floor(issue.timestamp_start / 60)}:{Math.floor(issue.timestamp_start % 60).toString().padStart(2, '0')}
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                              {issue.recommendation && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <strong>Recommendation:</strong> {issue.recommendation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>No audio issues detected</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No audio quality analysis data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="moderation">
            {aiData.moderation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Content Moderation
                    {aiData.moderation.safe ? (
                      <Badge className="bg-green-100 text-green-800">Safe Content</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Flagged Content</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center relative">
                        <div 
                          className={cn(
                            "absolute inset-0 rounded-full border-8",
                            aiData.moderation.overall_safety_score > 0.8 ? "border-green-500" :
                            aiData.moderation.overall_safety_score > 0.6 ? "border-yellow-500" :
                            "border-red-500"
                          )}
                          style={{ 
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(aiData.moderation.overall_safety_score * Math.PI * 2)}% ${50 - 50 * Math.sin(aiData.moderation.overall_safety_score * Math.PI * 2)}%, 50% 0%)`,
                          }}
                        ></div>
                        <span className="text-3xl font-bold">{Math.round(aiData.moderation.overall_safety_score * 100)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Safety Score</h3>
                        <p className="text-gray-600">
                          {aiData.moderation.overall_safety_score > 0.8 ? 'Content is suitable for all audiences' : 
                           aiData.moderation.overall_safety_score > 0.6 ? 'Content may require age restrictions' :
                           'Content contains potentially sensitive material'}
                        </p>
                      </div>
                    </div>
                    
                    {aiData.moderation.flags.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Flagged Content</h3>
                        <div className="space-y-3">
                          {aiData.moderation.flags.map((flag, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-red-100 text-red-800 mr-2"
                                  >
                                    {Math.round(flag.confidence * 100)}%
                                  </Badge>
                                  <span className="font-medium capitalize">{flag.category}</span>
                                </div>
                                {flag.timestamp_start !== undefined && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => onSeekTo?.(flag.timestamp_start!)}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    {Math.floor(flag.timestamp_start / 60)}:{Math.floor(flag.timestamp_start % 60).toString().padStart(2, '0')}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>No content flags detected</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <p className="text-xs text-gray-500">
                    Content moderation is automated and may not be 100% accurate. Review flagged content manually if needed.
                  </p>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No content moderation data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default VideoAIPanel;
