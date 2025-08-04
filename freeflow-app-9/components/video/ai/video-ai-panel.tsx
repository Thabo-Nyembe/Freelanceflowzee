'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Play, 
  Pause, 
  Settings, 
  Download, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import TranscriptionViewer from './transcription-viewer';
import AIInsightsDashboard from './ai-insights-dashboard';

interface VideoAIData {
  transcription?: unknown;
  analysis?: unknown;
  tags?: unknown[];
  chapters?: unknown[];
  status: {
    overall: 'pending' | 'processing' | 'completed' | 'failed' | 'disabled';
    startedAt?: string;
    completedAt?: string;
    features: {
      transcription: boolean;
      analysis: boolean;
      tags: boolean;
      chapters: boolean;
    };
  };
}

interface VideoAIPanelProps {
  videoId: string;
  videoTitle?: string;
  videoDuration?: number;
  aiData?: VideoAIData;
  isLoading?: boolean;
  onProcessAI?: (features, options) => Promise<void>;
  onSeekTo?: (timestamp: number) => void;
  className?: string;
}

export function VideoAIPanel({
  videoId, videoTitle, videoDuration, aiData, isLoading = false, onProcessAI, onSeekTo, className
}: VideoAIPanelProps) {
  const [isProcessing, setIsProcessing] = useState<any>(false);
  const [selectedFeatures, setSelectedFeatures] = useState<any>({
    transcription: true,
    analysis: true,
    tagging: true,
    chapters: true
  });
  const [processingOptions, setProcessingOptions] = useState<any>({
    language: 'auto',
    force: false
  });
  const [activeTab, setActiveTab] = useState<any>('overview');

  // Auto-refresh AI data while processing
  useEffect(() => {
    if (aiData?.status.overall === 'processing') {
      const interval = setInterval(() => {
        // In a real implementation, this would fetch updated AI data
        console.log('Checking AI processing status...');
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [aiData?.status.overall]);

  // Handle AI processing
  const handleStartProcessing = async () => {
    if (!onProcessAI) return;

    setIsProcessing(true);
    try {
      await onProcessAI(selectedFeatures, processingOptions);
    } catch (error) {
      console.error('Failed to start AI processing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get processing progress
  const getProcessingProgress = () => {
    if (!aiData?.status.features) return 0;
    
    const features = aiData.status.features;
    const completed = Object.values(features).filter(Boolean).length;
    const total = Object.keys(selectedFeatures).filter(key => selectedFeatures[key as keyof typeof selectedFeatures]).length;
    
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
          {aiData?.status.overall === 'processing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Processing Progress</span>
                <span>{Math.round(getProcessingProgress())}%</span>
              </div>
              <Progress value={getProcessingProgress()} className="h-2" />
              <div className="text-xs text-gray-500">
                This may take several minutes depending on video length
              </div>
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
          </div>

          {/* Error Alert */}
          {aiData?.status.overall === 'failed' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                AI processing failed. Please try again or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Results Tabs */}
      {aiData && (aiData.status.overall === 'completed' || aiData.status.overall === 'processing') && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
                </div>

                {aiData.status.startedAt && (
                  <div className="mt-4 text-sm text-gray-600">
                    Started: {new Date(aiData.status.startedAt).toLocaleString()}
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
        </Tabs>
      )}
    </div>
  );
}

export default VideoAIPanel; 