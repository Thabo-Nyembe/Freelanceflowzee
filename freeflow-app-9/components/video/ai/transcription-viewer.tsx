'use client';

import { useState, useMemo } from 'react';
import { Search, Download, Copy, Volume2, VolumeX, Clock, Languages, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

interface TranscriptionData {
  id: string;
  text: string;
  language?: string;
  duration_seconds?: number;
  confidence_score?: number;
  segments?: TranscriptionSegment[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface TranscriptionViewerProps {
  transcription: TranscriptionData | null;
  isLoading?: boolean;
  onSeekTo?: (timestamp: number) => void;
  onDownload?: (format: 'txt' | 'srt' | 'vtt') => void;
  className?: string;
}

export function TranscriptionViewer({
  transcription, isLoading = false, onSeekTo, onDownload, className
}: TranscriptionViewerProps) {
  const [searchQuery, setSearchQuery] = useState<any>('');
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'srt' | 'vtt'>('txt');
  const [highlightedSegment, setHighlightedSegment] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState<any>(true);
  const [copiedText, setCopiedText] = useState<any>(false);

  // Filter segments based on search query
  const filteredSegments = useMemo(() => {
    if (!transcription?.segments || !searchQuery.trim()) {
      return transcription?.segments || [];
    }

    return transcription.segments.filter(segment =>
      segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transcription?.segments, searchQuery]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy full transcription to clipboard
  const copyToClipboard = async () => {
    if (!transcription?.text) return;

    try {
      await navigator.clipboard.writeText(transcription.text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // Handle segment click for seeking
  const handleSegmentClick = (segment: TranscriptionSegment) => {
    setHighlightedSegment(segment.id);
    onSeekTo?.(segment.start);
  };

  // Download transcription in various formats
  const handleDownload = () => {
    if (!transcription) return;

    let content = '';
    let filename = '';

    switch (downloadFormat) {
      case 'txt':
        content = transcription.text;
        filename = 'transcription.txt';
        break;
      case 'srt':
        content = generateSRT(transcription.segments || []);
        filename = 'transcription.srt';
        break;
      case 'vtt':
        content = generateVTT(transcription.segments || []);
        filename = 'transcription.vtt';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    onDownload?.(downloadFormat);
  };

  // Generate SRT format
  const generateSRT = (segments: TranscriptionSegment[]): string => {
    return segments.map((segment, index) => {
      const start = formatSRTTime(segment.start);
      const end = formatSRTTime(segment.end);
      return `${index + 1}\n${start} --> ${end}\n${segment.text}\n\n`;
    }).join('');
  };

  // Generate VTT format
  const generateVTT = (segments: TranscriptionSegment[]): string => {
    const header = 'WEBVTT\n\n';
    const content = segments.map(segment => {
      const start = formatVTTTime(segment.start);
      const end = formatVTTTime(segment.end);
      return `${start} --> ${end}\n${segment.text}\n\n`;
    }).join('');
    return header + content;
  };

  // Format time for SRT (HH:MM:SS,mmm)
  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Format time for VTT (HH:MM:SS.mmm)
  const formatVTTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No transcription state
  if (!transcription) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5 text-gray-400" />
            Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Volume2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No transcription available</p>
            <p className="text-sm">Start AI processing to generate a transcription</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (transcription.processing_status === 'failed') {
    return (
      <Card className={cn("w-full border-red-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <VolumeX className="h-5 w-5" />
            Transcription Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p className="text-lg font-medium mb-2">Transcription processing failed</p>
            <p className="text-sm">Please try processing the video again</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing state
  if (transcription.processing_status === 'processing') {
    return (
      <Card className={cn("w-full border-blue-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Volume2 className="h-5 w-5 animate-pulse" />
            Processing Transcription...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-blue-500">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Generating transcription</p>
            <p className="text-sm">This may take a few minutes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Transcription
            {transcription.language && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Languages className="h-3 w-3" />
                {transcription.language.toUpperCase()}
              </Badge>
            )}
            {transcription.confidence_score && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {Math.round(transcription.confidence_score * 100)}% confidence
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              {copiedText ? 'Copied!' : 'Copy'}
            </Button>
            <div className="flex items-center gap-2">
              <Select value={downloadFormat} onValueChange={(value) => setDownloadFormat(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">TXT</SelectItem>
                  <SelectItem value="srt">SRT</SelectItem>
                  <SelectItem value="vtt">VTT</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transcription..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Transcription Stats */}
        {transcription.duration_seconds && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Duration: {formatTime(transcription.duration_seconds)}
            </div>
            {transcription.segments && (
              <div>Segments: {transcription.segments.length}</div>
            )}
            {searchQuery && (
              <div>
                Matches: {filteredSegments.length}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Transcription Content */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transcription.segments && transcription.segments.length > 0 ? (
            <>
              {/* Segmented view with timestamps */}
              {filteredSegments.map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50",
                    highlightedSegment === segment.id && "bg-blue-50 border-blue-200",
                    searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase()) && "bg-yellow-50"
                  )}
                  onClick={() => handleSegmentClick(segment)}
                >
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs font-mono text-gray-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSegmentClick(segment);
                      }}
                    >
                      {formatTime(segment.start)}
                    </Button>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        {searchQuery ? (
                          // Highlight search matches
                          segment.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, index) => (
                            <span
                              key={index}
                              className={part.toLowerCase() === searchQuery.toLowerCase() ? 'bg-yellow-200 font-medium' : ''}
                            >
                              {part}
                            </span>
                          ))
                        ) : (
                          segment.text
                        )}
                      </p>
                      {segment.confidence && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(segment.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Plain text view */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {searchQuery ? (
                    // Highlight search matches in plain text
                    transcription.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, index) => (
                      <span
                        key={index}
                        className={part.toLowerCase() === searchQuery.toLowerCase() ? 'bg-yellow-200 font-medium' : ''}
                      >
                        {part}
                      </span>
                    ))
                  ) : (
                    transcription.text
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        {searchQuery && filteredSegments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No matches found for "{searchQuery}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TranscriptionViewer; 