'use client';

export const dynamic = 'force-dynamic';

/**
 * Voice AI Dashboard - FreeFlow A+++ Implementation
 *
 * Comprehensive Voice AI interface with:
 * - Real-time voice transcription
 * - Voice commands with wake word
 * - Meeting transcription & summarization
 * - Speaker identification
 * - AI-powered insights extraction
 * - Multi-language support
 * - Subtitle generation
 *
 * Competitors: Otter.ai, Fireflies.ai, Notion AI, Descript
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Mic, MicOff, Radio, Upload, FileText, Sparkles, Clock,
  Settings, Trash2, Copy, Check, ChevronRight,
  MessageSquare, Target, HelpCircle, Loader2, ListChecks, LightbulbIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { toast } from 'sonner';
import { useVoiceCommands } from '@/lib/hooks/use-voice-commands';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('VoiceAI-Page');

// Types
interface Transcription {
  id: string;
  type: 'transcribe' | 'translate';
  text_content: string;
  language: string;
  duration: number;
  word_count: number;
  speakers: string[];
  insights?: {
    actionItems: string[];
    keyPoints: string[];
    decisions: string[];
    questions: string[];
    nextSteps: string[];
  };
  created_at: string;
}

interface TranscriptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence: number;
}

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function VoiceAIPage() {
  // Voice Commands Hook
  const {
    isListening: isCommandListening,
    isWakeWordActive,
    lastTranscript,
    lastCommand,
    startListening: startCommandListening,
    stopListening: stopCommandListening,
    toggleListening: toggleCommandListening,
    getAllCommands,
  } = useVoiceCommands({
    wakeWord: 'hey freeflow',
    wakeWordEnabled: true,
    continuousListening: true,
    enableFeedback: true,
    onCommand: (cmd, params) => {
      logger.info('Voice command executed', { command: cmd.id, transcript: params.transcript });
    },
  });

  // State
  const [activeTab, setActiveTab] = useState('transcribe');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [enableDiarization, setEnableDiarization] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch transcription history
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/ai/voice?limit=20');
      const data = await response.json();
      if (data.success) {
        setTranscriptions(data.data);
      }
    } catch (error) {
      logger.error('Failed to fetch history', { error });
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.start(1000); // Capture every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
      logger.info('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
      logger.error('Microphone access error', { error });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.info('Processing audio...');
      logger.info('Recording stopped', { duration: recordingTime });
    }
  };

  // Process audio file
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setCurrentTranscript('');
    setSegments([]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('action', 'transcribe');
      formData.append('options', JSON.stringify({
        language: selectedLanguage,
        enableDiarization,
        timestampGranularity: 'word',
      }));

      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTranscript(data.data.text);
        setSegments(data.data.segments || []);
        toast.success('Transcription complete!');
        logger.info('Transcription completed', {
          wordCount: data.data.wordCount,
          duration: data.data.duration,
        });
        fetchHistory(); // Refresh history
      } else {
        throw new Error(data.error || 'Transcription failed');
      }
    } catch (error) {
      toast.error('Transcription failed');
      logger.error('Transcription error', { error });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('action', 'transcribe');
      formData.append('options', JSON.stringify({
        language: selectedLanguage,
        enableDiarization,
        timestampGranularity: 'word',
      }));

      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTranscript(data.data.text);
        setSegments(data.data.segments || []);
        toast.success('File transcribed successfully!');
        fetchHistory();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to process file');
      logger.error('File processing error', { error });
    } finally {
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  // Extract insights from transcription
  const extractInsights = async (transcriptionId: string) => {
    try {
      const formData = new FormData();
      formData.append('action', 'extract-insights');
      formData.append('transcriptionId', transcriptionId);

      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Insights extracted!');
        setTranscriptions(prev =>
          prev.map(t => t.id === transcriptionId ? { ...t, insights: data.data } : t)
        );
        if (selectedTranscription?.id === transcriptionId) {
          setSelectedTranscription(prev => prev ? { ...prev, insights: data.data } : null);
        }
      }
    } catch (error) {
      toast.error('Failed to extract insights');
      logger.error('Insights extraction error', { error });
    }
  };

  // Delete transcription
  const deleteTranscription = async (id: string) => {
    try {
      const response = await fetch(`/api/ai/voice?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTranscriptions(prev => prev.filter(t => t.id !== id));
        if (selectedTranscription?.id === id) {
          setSelectedTranscription(null);
        }
        toast.success('Transcription deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
      logger.error('Delete error', { error });
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, id?: string) => {
    await navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    toast.success('Copied to clipboard');
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get all voice commands
  const allCommands = getAllCommands();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <TextShimmer className="text-3xl font-bold">
              Voice AI Studio
            </TextShimmer>
            <p className="text-muted-foreground mt-1">
              Transcribe, translate, and extract insights from audio with AI
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Voice Commands Toggle */}
            <Button
              variant={isCommandListening ? 'default' : 'outline'}
              onClick={toggleCommandListening}
              className={isCommandListening ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isCommandListening ? (
                <>
                  <Radio className="w-4 h-4 mr-2 animate-pulse" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Commands
                </>
              )}
            </Button>

            <Dialog open={showCommands} onOpenChange={setShowCommands}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Voice Commands</DialogTitle>
                  <DialogDescription>
                    Say &quot;Hey FreeFlow&quot; followed by any command
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {['navigation', 'creation', 'search', 'ai', 'settings'].map(category => {
                    const commands = allCommands.filter(c => c.category === category);
                    if (commands.length === 0) return null;
                    return (
                      <div key={category}>
                        <h4 className="font-medium capitalize mb-2">{category}</h4>
                        <div className="grid gap-2">
                          {commands.map(cmd => (
                            <div key={cmd.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <div>
                                <p className="text-sm font-medium">{cmd.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  &quot;{cmd.patterns[0]}&quot;
                                </p>
                              </div>
                              <Badge variant="outline">{category}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Wake Word Indicator */}
        <AnimatePresence>
          {isWakeWordActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
            >
              <Card className="bg-green-500 text-white border-none shadow-lg">
                <CardContent className="py-3 px-6 flex items-center gap-3">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Listening for command...</span>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="transcribe" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Transcribe
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Transcribe Tab */}
          <TabsContent value="transcribe" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recording Panel */}
              <LiquidGlassCard className="p-6">
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Record Audio</h3>

                    {/* Recording Button */}
                    <div className="flex justify-center">
                      <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        className={`
                          w-24 h-24 rounded-full flex items-center justify-center
                          transition-all duration-300 shadow-lg
                          ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-blue-500 hover:bg-blue-600'
                          }
                          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-10 h-10 text-white animate-spin" />
                        ) : isRecording ? (
                          <MicOff className="w-10 h-10 text-white" />
                        ) : (
                          <Mic className="w-10 h-10 text-white" />
                        )}
                      </motion.button>
                    </div>

                    {/* Recording Time */}
                    {isRecording && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-mono text-red-500"
                      >
                        {formatTime(recordingTime)}
                      </motion.div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </div>

                  <Separator />

                  {/* File Upload */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Or upload a file</h4>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="audio/*,video/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing || isRecording}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio/Video File
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Supports MP3, WAV, M4A, MP4, WebM
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Speaker Identification</Label>
                        <p className="text-xs text-muted-foreground">
                          Identify who said what
                        </p>
                      </div>
                      <Switch
                        checked={enableDiarization}
                        onCheckedChange={setEnableDiarization}
                      />
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Transcript Panel */}
              <LiquidGlassCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Transcript</h3>
                    {currentTranscript && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(currentTranscript)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-muted-foreground">Processing audio...</p>
                      </div>
                    ) : currentTranscript ? (
                      <div className="space-y-4">
                        {segments.length > 0 ? (
                          segments.map((segment, index) => (
                            <div key={segment.id || index} className="space-y-1">
                              <div className="flex items-center gap-2">
                                {segment.speaker && (
                                  <Badge variant="outline" className="text-xs">
                                    {segment.speaker}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(Math.floor(segment.start))}
                                </span>
                              </div>
                              <p className="text-sm">{segment.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{currentTranscript}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <FileText className="w-12 h-12 mb-3 opacity-50" />
                        <p>Transcript will appear here</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </LiquidGlassCard>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transcription List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Transcriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : transcriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No transcriptions yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transcriptions.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTranscription(t)}
                              className={`
                                p-3 rounded-lg cursor-pointer transition-colors
                                ${selectedTranscription?.id === t.id
                                  ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                                  : 'hover:bg-muted/50'
                                }
                              `}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">
                                    {t.text_content.slice(0, 50)}...
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {t.language.toUpperCase()}
                                    </Badge>
                                    <span>{t.word_count} words</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Transcription Detail */}
              <div className="lg:col-span-2">
                {selectedTranscription ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Transcription Detail</CardTitle>
                          <CardDescription>
                            {format(new Date(selectedTranscription.created_at), 'PPpp')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => extractInsights(selectedTranscription.id)}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Extract Insights
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(selectedTranscription.text_content, selectedTranscription.id)}
                          >
                            {copiedId === selectedTranscription.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTranscription(selectedTranscription.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-lg font-medium">
                            {formatTime(Math.floor(selectedTranscription.duration))}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Words</p>
                          <p className="text-lg font-medium">{selectedTranscription.word_count}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Speakers</p>
                          <p className="text-lg font-medium">
                            {selectedTranscription.speakers?.length || 1}
                          </p>
                        </div>
                      </div>

                      {/* Transcript */}
                      <div className="space-y-2">
                        <Label>Transcript</Label>
                        <ScrollArea className="h-[200px] rounded-md border p-4">
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedTranscription.text_content}
                          </p>
                        </ScrollArea>
                      </div>

                      {/* Insights */}
                      {selectedTranscription.insights && (
                        <div className="space-y-4">
                          <Label>AI Insights</Label>
                          <div className="grid gap-4">
                            {selectedTranscription.insights.actionItems.length > 0 && (
                              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <ListChecks className="w-4 h-4 text-orange-600" />
                                  <h5 className="font-medium text-orange-800 dark:text-orange-200">
                                    Action Items
                                  </h5>
                                </div>
                                <ul className="space-y-1">
                                  {selectedTranscription.insights.actionItems.map((item, i) => (
                                    <li key={i} className="text-sm text-orange-700 dark:text-orange-300">
                                      • {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {selectedTranscription.insights.keyPoints.length > 0 && (
                              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <LightbulbIcon className="w-4 h-4 text-blue-600" />
                                  <h5 className="font-medium text-blue-800 dark:text-blue-200">
                                    Key Points
                                  </h5>
                                </div>
                                <ul className="space-y-1">
                                  {selectedTranscription.insights.keyPoints.map((item, i) => (
                                    <li key={i} className="text-sm text-blue-700 dark:text-blue-300">
                                      • {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {selectedTranscription.insights.decisions.length > 0 && (
                              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-4 h-4 text-green-600" />
                                  <h5 className="font-medium text-green-800 dark:text-green-200">
                                    Decisions
                                  </h5>
                                </div>
                                <ul className="space-y-1">
                                  {selectedTranscription.insights.decisions.map((item, i) => (
                                    <li key={i} className="text-sm text-green-700 dark:text-green-300">
                                      • {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {selectedTranscription.insights.questions.length > 0 && (
                              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <HelpCircle className="w-4 h-4 text-purple-600" />
                                  <h5 className="font-medium text-purple-800 dark:text-purple-200">
                                    Questions
                                  </h5>
                                </div>
                                <ul className="space-y-1">
                                  {selectedTranscription.insights.questions.map((item, i) => (
                                    <li key={i} className="text-sm text-purple-700 dark:text-purple-300">
                                      • {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                      <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Select a transcription</p>
                      <p className="text-sm">Click on any transcription to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Voice AI Settings</CardTitle>
                <CardDescription>
                  Configure transcription and voice command preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Voice Commands Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Voice Commands</h4>
                    <div className="space-y-4 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Wake Word</Label>
                          <p className="text-xs text-muted-foreground">
                            Say this to activate commands
                          </p>
                        </div>
                        <Badge variant="secondary">&quot;Hey FreeFlow&quot;</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Continuous Listening</Label>
                          <p className="text-xs text-muted-foreground">
                            Keep listening for commands
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Voice Feedback</Label>
                          <p className="text-xs text-muted-foreground">
                            Show toasts on command recognition
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  {/* Transcription Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Transcription</h4>
                    <div className="space-y-4 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Language Detection</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically detect speech language
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Speaker Diarization</Label>
                          <p className="text-xs text-muted-foreground">
                            Identify different speakers
                          </p>
                        </div>
                        <Switch
                          checked={enableDiarization}
                          onCheckedChange={setEnableDiarization}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Extract Insights</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically extract action items
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Available Commands Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium">Available Voice Commands ({allCommands.length})</h4>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {allCommands.slice(0, 9).map(cmd => (
                      <div key={cmd.id} className="p-3 rounded-lg border bg-muted/50">
                        <p className="text-sm font-medium">{cmd.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          &quot;{cmd.patterns[0]}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setShowCommands(true)}>
                    View All Commands
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
