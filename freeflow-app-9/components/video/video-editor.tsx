"use client";

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Film,
  Palette,
  Settings,
  Save,
  Download,
  Share,
  Eye,
  Wand2,
  Sparkles,
  Filter,
  Type,
  Layers,
  Clock,
  FileVideo,
  History
} from 'lucide-react';
import VideoTimelineEditor, { TimelineEdit } from './video-timeline-editor';
import { Video } from '@/lib/video/types';

export interface VideoEditorProps {
  video: Video;
  onSave?: (edits: VideoEdit[]) => void;
  onExport?: (format: ExportFormat) => void;
  onShare?: (settings: ShareSettings) => void;
  className?: string;
}

export interface VideoEdit {
  id: string;
  type: 'timeline' | 'effect' | 'filter' | 'overlay' | 'audio';
  data: unknown;
  timestamp: string;
}

export interface ExportFormat {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '1440p' | '4k';
  includeAudio: boolean;
}

export interface ShareSettings {
  privacy: 'public' | 'unlisted' | 'private';
  password?: string;
  expiresAt?: string;
  allowComments: boolean;
  allowDownload: boolean;
}

export interface VideoEffect {
  id: string;
  name: string;
  type: 'visual' | 'audio' | 'transition';
  intensity: number;
  parameters: Record<string, any>;
}

export default function VideoEditor({
  video, onSave, onExport, onShare, className
}: VideoEditorProps) {
  const [activeTab, setActiveTab] = useState<any>('timeline');
  const [edits, setEdits] = useState<VideoEdit[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<any>({
    title: video.title,
    description: video.description || '',
    tags: video.tags || [],
    project_id: video.project_id || ''
  });
  const [appliedEffects, setAppliedEffects] = useState<VideoEffect[]>([]);
  const [isProcessing, setIsProcessing] = useState<any>(false);
  const [processingProgress, setProcessingProgress] = useState<any>(0);

  const handleTimelineEdits = useCallback((timelineEdits: TimelineEdit[]) => {
    const newEdits: VideoEdit[] = timelineEdits.map(edit => ({
      id: `timeline-${Date.now()}-${Math.random()}`,
      type: 'timeline',
      data: edit,
      timestamp: new Date().toISOString()
    }));
    
    setEdits(prev => [...prev.filter(e => e.type !== 'timeline'), ...newEdits]);
  }, []);

  const handleAddEffect = useCallback((effect: VideoEffect) => {
    setAppliedEffects(prev => [...prev, effect]);
    
    const newEdit: VideoEdit = {
      id: `effect-${Date.now()}`,
      type: 'effect',
      data: effect,
      timestamp: new Date().toISOString()
    };
    
    setEdits(prev => [...prev, newEdit]);
  }, []);

  const handleRemoveEffect = useCallback((effectId: string) => {
    setAppliedEffects(prev => prev.filter(e => e.id !== effectId));
    setEdits(prev => prev.filter(e => !(e.type === 'effect' && e.data.id === effectId)));
  }, [/* add dependencies */]);

  const handleSave = useCallback(async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Simulate processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      onSave?.(edits);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [edits, onSave]);

  const handleExport = useCallback((format: ExportFormat) => {
    onExport?.(format);
  }, [onExport]);

  const handleShare = useCallback((settings: ShareSettings) => {
    onShare?.(settings);
  }, [onShare]);

  const availableEffects: VideoEffect[] = [
    {
      id: 'blur',
      name: 'Blur Effect',
      type: 'visual',
      intensity: 50,
      parameters: { radius: 5, type: 'gaussian' }
    },
    {
      id: 'brightness',
      name: 'Brightness Adjust',
      type: 'visual',
      intensity: 100,
      parameters: { value: 1.2 }
    },
    {
      id: 'contrast',
      name: 'Contrast Enhance',
      type: 'visual',
      intensity: 100,
      parameters: { value: 1.1 }
    },
    {
      id: 'fade-in',
      name: 'Fade In',
      type: 'transition',
      intensity: 100,
      parameters: { duration: 1000 }
    },
    {
      id: 'fade-out',
      name: 'Fade Out',
      type: 'transition',
      intensity: 100,
      parameters: { duration: 1000 }
    }
  ];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Video Editor</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileVideo className="w-4 h-4" />
              <span>{video.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(video.duration_seconds)}</span>
            </div>
            <Badge variant={video.status === 'ready' ? 'default' : 'secondary'}>
              {video.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isProcessing || edits.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Save Changes'}
          </Button>
          
          <Button variant="outline" size="icon" onClick={() => toast.info('Share', { description: 'Share video link copied to clipboard' })}>
            <Share className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => toast.info('Preview', { description: 'Opening video preview...' })}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing video edits...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Timeline Editor Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <VideoTimelineEditor
            videoId={video.id}
            playbackId={video.mux_playback_id || ''}
            title={video.title}
            duration={video.duration_seconds}
            chapters={video.ai_chapters}
            onSave={handleTimelineEdits}
            onExport={(format) => handleExport({ 
              format: format as 'mp4', 
              quality: 'high', 
              resolution: '1080p', 
              includeAudio: true 
            })}
          />
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Effects */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Available Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {availableEffects.map(effect => (
                      <Card key={effect.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{effect.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {effect.type} effect
                          </p>
                          <Button
                            onClick={() => handleAddEffect(effect)}
                            size="sm"
                            className="w-full"
                          >
                            Apply Effect
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applied Effects */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Applied Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedEffects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No effects applied</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {appliedEffects.map(effect => (
                        <div key={effect.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{effect.name}</span>
                          <Button
                            onClick={() => handleRemoveEffect(effect.id)}
                            variant="ghost"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Color & Visual Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Brightness</Label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      defaultValue="100"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Contrast</Label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      defaultValue="100"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Saturation</Label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      defaultValue="100"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Hue</Label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      defaultValue="0"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Gamma</Label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Exposure</Label>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      defaultValue="0"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Video Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={videoMetadata.title}
                    onChange={(e) => setVideoMetadata(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={videoMetadata.description}
                    onChange={(e) => setVideoMetadata(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={videoMetadata.tags.join(', ')}
                    onChange={(e) => setVideoMetadata(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Project Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Video Duration</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(video.duration_seconds)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <p className="text-sm text-muted-foreground">
                    {video.resolution || 'Auto-detected'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>File Size</Label>
                  <p className="text-sm text-muted-foreground">
                    {(video.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Applied Edits</Label>
                  <Badge variant="outline">
                    {edits.length} changes
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Format</Label>
                    <Select defaultValue="mp4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                        <SelectItem value="mov">MOV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Quality</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Fast)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (Recommended)</SelectItem>
                        <SelectItem value="ultra">Ultra (Slow)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Resolution</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="1440p">1440p 2K</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="include-audio" defaultChecked />
                    <Label htmlFor="include-audio">Include Audio</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => handleExport({
                    format: 'mp4',
                    quality: 'high',
                    resolution: '1080p',
                    includeAudio: true
                  })}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Video
                </Button>
                
                <Button
                  onClick={() => handleShare({
                    privacy: 'unlisted',
                    allowComments: true,
                    allowDownload: false
                  })}
                  variant="outline"
                  className="flex-1"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit History */}
      {edits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Edit History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {edits.slice(-5).map(edit => (
                <div key={edit.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{edit.type}</Badge>
                    <span>Edit applied</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(edit.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {edits.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  And {edits.length - 5} more edits...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 