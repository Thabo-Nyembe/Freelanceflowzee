'use client';

/**
 * Meeting Summaries Dashboard - FreeFlow A+++ Implementation
 * AI-powered meeting intelligence competing with Fireflies.ai, Otter.ai, Grain
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Mic,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  Target,
  MessageSquare,
  TrendingUp,
  Download,
  Copy,
  Trash2,
  ChevronRight,
  Sparkles,
  ListChecks,
  Lightbulb,
  HelpCircle,
  Calendar,
  Send,
  Play,
  Pause,
  BarChart3,
  PieChart,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Zap,
  FolderOpen,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMeetingSummaries } from '@/lib/hooks/use-meeting-summaries';
import type { MeetingSummary, ActionItem, KeyDecision, TopicSegment } from '@/lib/ai/meeting-summarizer';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'generate' | 'history' | 'detail';
type SummaryStyle = 'brief' | 'detailed' | 'executive' | 'technical';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MeetingSummariesPage() {
  const {
    summaries,
    currentSummary,
    isLoading,
    isGenerating,
    generateSummary,
    quickSummarize,
    fetchSummaries,
    fetchSummary,
    deleteSummary,
    exportToMarkdown,
  } = useMeetingSummaries();

  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const [transcript, setTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [speakerInput, setSpeakerInput] = useState('');
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>('detailed');
  const [selectedSummary, setSelectedSummary] = useState<MeetingSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch summaries on mount
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) {
      toast.error('Please enter or upload a transcript');
      return;
    }

    const summary = await generateSummary({
      transcript,
      title: meetingTitle || undefined,
      speakers: speakers.length > 0 ? speakers : undefined,
      options: {
        style: summaryStyle,
        extractActionItems: true,
        extractDecisions: true,
        extractQuestions: true,
        analyzeSentiment: true,
        generateFollowUps: true,
        speakerAnalysis: true,
        topicSegmentation: true,
      },
    });

    if (summary) {
      setSelectedSummary(summary);
      setViewMode('detail');
    }
  };

  const handleQuickSummarize = async () => {
    if (!transcript.trim()) {
      toast.error('Please enter text to summarize');
      return;
    }

    const result = await quickSummarize(transcript);
    if (result) {
      toast.success('Quick summary generated!');
      // Show in a simple format
      setSelectedSummary({
        id: `quick_${Date.now()}`,
        meetingId: '',
        title: meetingTitle || 'Quick Summary',
        executiveSummary: result.summary,
        detailedSummary: result.summary,
        bulletPoints: result.keyPoints,
        duration: 0,
        participantCount: 1,
        language: 'en',
        actionItems: result.actionItems.map((item, i) => ({
          id: `action_${i}`,
          description: item,
          priority: 'medium' as const,
          status: 'pending' as const,
          context: '',
        })),
        decisions: [],
        topics: [],
        questions: [],
        followUps: [],
        speakerAnalytics: [],
        sentiment: { overall: 'neutral', score: 0, byTopic: [], bySpeaker: [] },
        processingTime: 0,
        model: 'gpt-4o-mini',
        confidence: 0.8,
        createdAt: new Date().toISOString(),
      });
      setViewMode('detail');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTranscript(content);
      toast.success(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleAddSpeaker = () => {
    if (speakerInput.trim() && !speakers.includes(speakerInput.trim())) {
      setSpeakers([...speakers, speakerInput.trim()]);
      setSpeakerInput('');
    }
  };

  const handleRemoveSpeaker = (speaker: string) => {
    setSpeakers(speakers.filter(s => s !== speaker));
  };

  const handleSelectSummary = (summary: MeetingSummary) => {
    setSelectedSummary(summary);
    setViewMode('detail');
  };

  const handleExport = async () => {
    if (selectedSummary) {
      await exportToMarkdown(selectedSummary);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this summary?')) {
      const success = await deleteSummary(id);
      if (success && selectedSummary?.id === id) {
        setSelectedSummary(null);
        setViewMode('history');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Here you would send to transcription API
        toast.info('Recording saved. Transcription requires Voice AI integration.');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (err) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Filter summaries by search
  const filteredSummaries = summaries.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                Meeting Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI-powered meeting summaries with action items, decisions, and insights
              </p>
            </div>

            {/* View Mode Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {[
                { id: 'generate', icon: Sparkles, label: 'Generate' },
                { id: 'history', icon: FolderOpen, label: 'History' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id as ViewMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === id || (viewMode === 'detail' && id === 'history')
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Generate View */}
          {viewMode === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Input Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Transcript Input */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Meeting Transcript
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.vtt,.srt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            Record
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste your meeting transcript here, or upload a file...

Example format:
[00:00] Speaker 1: Welcome everyone to today's meeting.
[00:15] Speaker 2: Thanks for having us. Let's discuss the Q4 roadmap.
[00:30] Speaker 1: Great idea. First, we need to finalize the budget..."
                    className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
                  />

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
                    <span>~{Math.round(transcript.split(/\s+/).filter(Boolean).length / 150)} min estimated</span>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Meeting Details (Optional)
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meeting Title
                      </label>
                      <input
                        type="text"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="e.g., Q4 Planning Session"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Participants
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={speakerInput}
                          onChange={(e) => setSpeakerInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSpeaker()}
                          placeholder="Add participant name"
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={handleAddSpeaker}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {speakers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {speakers.map((speaker) => (
                            <span
                              key={speaker}
                              className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                            >
                              <Users className="w-3 h-3" />
                              {speaker}
                              <button
                                onClick={() => handleRemoveSpeaker(speaker)}
                                className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Options Panel */}
              <div className="space-y-6">
                {/* Summary Style */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Summary Style
                  </h3>

                  <div className="space-y-2">
                    {[
                      { id: 'brief', label: 'Brief', desc: 'Quick overview in 2-3 paragraphs' },
                      { id: 'detailed', label: 'Detailed', desc: 'Comprehensive analysis' },
                      { id: 'executive', label: 'Executive', desc: 'For leadership' },
                      { id: 'technical', label: 'Technical', desc: 'With specific details' },
                    ].map(({ id, label, desc }) => (
                      <button
                        key={id}
                        onClick={() => setSummaryStyle(id as SummaryStyle)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          summaryStyle === id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                        <div className="text-sm text-gray-500">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGenerating || !transcript.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Full Summary
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleQuickSummarize}
                    disabled={isGenerating || !transcript.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Zap className="w-5 h-5" />
                    Quick Summary
                  </button>
                </div>

                {/* Features List */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    What you'll get:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {[
                      'Executive summary',
                      'Action items with assignees',
                      'Key decisions made',
                      'Topic segmentation',
                      'Question tracking',
                      'Speaker analytics',
                      'Sentiment analysis',
                      'Follow-up recommendations',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* History View */}
          {viewMode === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Search Bar */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search summaries..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {/* Summaries Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : filteredSummaries.length === 0 ? (
                <div className="text-center py-20">
                  <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No summaries yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Generate your first meeting summary to see it here
                  </p>
                  <button
                    onClick={() => setViewMode('generate')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                  >
                    Create Summary
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSummaries.map((summary) => (
                    <motion.div
                      key={summary.id}
                      whileHover={{ y: -2 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                      onClick={() => handleSelectSummary(summary)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {summary.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(summary.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                        {summary.executiveSummary}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(summary.duration / 60)}m
                        </span>
                        <span className="flex items-center gap-1">
                          <ListChecks className="w-3 h-3" />
                          {summary.actionItems?.length || 0} actions
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {summary.participantCount}
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-400">
                          {new Date(summary.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Detail View */}
          {viewMode === 'detail' && selectedSummary && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Back Button */}
              <button
                onClick={() => setViewMode('history')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Back to History
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Summary */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Header Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedSummary.title}
                        </h2>
                        <p className="text-gray-500 mt-1">
                          {new Date(selectedSummary.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleExport}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Export to Markdown"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(selectedSummary.executiveSummary)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Copy Summary"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { icon: Clock, label: 'Duration', value: `${Math.round(selectedSummary.duration / 60)}m` },
                        { icon: Users, label: 'Participants', value: selectedSummary.participantCount },
                        { icon: ListChecks, label: 'Actions', value: selectedSummary.actionItems?.length || 0 },
                        { icon: Target, label: 'Decisions', value: selectedSummary.decisions?.length || 0 },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                          <Icon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                          <div className="text-xs text-gray-500">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Executive Summary
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {selectedSummary.executiveSummary}
                      </p>
                    </div>

                    {/* Key Points */}
                    {selectedSummary.bulletPoints && selectedSummary.bulletPoints.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Key Points
                        </h3>
                        <ul className="space-y-2">
                          {selectedSummary.bulletPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Items */}
                  {selectedSummary.actionItems && selectedSummary.actionItems.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-blue-600" />
                        Action Items ({selectedSummary.actionItems.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedSummary.actionItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                          >
                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300" />
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white">{item.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                {item.assignee && (
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <Users className="w-3 h-3" />
                                    {item.assignee}
                                  </span>
                                )}
                                {item.dueDate && (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    <Calendar className="w-3 h-3" />
                                    {item.dueDate}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full ${
                                  item.priority === 'critical' ? 'bg-red-100 text-red-600' :
                                  item.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                  {item.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decisions */}
                  {selectedSummary.decisions && selectedSummary.decisions.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Key Decisions ({selectedSummary.decisions.length})
                      </h3>
                      <div className="space-y-4">
                        {selectedSummary.decisions.map((decision) => (
                          <div
                            key={decision.id}
                            className="border-l-4 border-green-500 pl-4"
                          >
                            <p className="font-medium text-gray-900 dark:text-white">
                              {decision.decision}
                            </p>
                            {decision.rationale && (
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium">Rationale:</span> {decision.rationale}
                              </p>
                            )}
                            {decision.madeBy && (
                              <p className="text-xs text-gray-400 mt-1">
                                Decision by: {decision.madeBy}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {selectedSummary.questions && selectedSummary.questions.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-orange-600" />
                        Questions ({selectedSummary.questions.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedSummary.questions.map((q) => (
                          <div
                            key={q.id}
                            className={`p-3 rounded-xl ${
                              q.answered
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-orange-50 dark:bg-orange-900/20'
                            }`}
                          >
                            <p className="font-medium text-gray-900 dark:text-white">
                              {q.question}
                            </p>
                            {q.askedBy && (
                              <p className="text-xs text-gray-500 mt-1">Asked by: {q.askedBy}</p>
                            )}
                            {q.answered && q.answer && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                <span className="font-medium">Answer:</span> {q.answer}
                              </p>
                            )}
                            {!q.answered && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs rounded-full mt-2">
                                <AlertCircle className="w-3 h-3" />
                                Unanswered
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Sentiment */}
                  {selectedSummary.sentiment && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Sentiment Analysis
                      </h3>
                      <div className="text-center mb-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                          selectedSummary.sentiment.overall === 'positive'
                            ? 'bg-green-100 text-green-600'
                            : selectedSummary.sentiment.overall === 'negative'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedSummary.sentiment.overall === 'positive' ? (
                            <ThumbsUp className="w-5 h-5" />
                          ) : selectedSummary.sentiment.overall === 'negative' ? (
                            <ThumbsDown className="w-5 h-5" />
                          ) : null}
                          {selectedSummary.sentiment.overall.charAt(0).toUpperCase() +
                            selectedSummary.sentiment.overall.slice(1)}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Score: {(selectedSummary.sentiment.score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Topics */}
                  {selectedSummary.topics && selectedSummary.topics.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Topics Discussed
                      </h3>
                      <div className="space-y-3">
                        {selectedSummary.topics.map((topic) => (
                          <div key={topic.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {topic.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {topic.summary}
                            </p>
                            {topic.keywords && topic.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {topic.keywords.slice(0, 3).map((kw) => (
                                  <span
                                    key={kw}
                                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-ups */}
                  {selectedSummary.followUps && selectedSummary.followUps.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-green-600" />
                        Recommended Follow-ups
                      </h3>
                      <div className="space-y-3">
                        {selectedSummary.followUps.map((followUp) => (
                          <div
                            key={followUp.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                          >
                            <span className={`p-1.5 rounded-lg ${
                              followUp.type === 'email' ? 'bg-blue-100 text-blue-600' :
                              followUp.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                              followUp.type === 'task' ? 'bg-green-100 text-green-600' :
                              followUp.type === 'document' ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {followUp.type === 'email' ? <Send className="w-4 h-4" /> :
                               followUp.type === 'meeting' ? <Calendar className="w-4 h-4" /> :
                               followUp.type === 'task' ? <ListChecks className="w-4 h-4" /> :
                               followUp.type === 'document' ? <FileText className="w-4 h-4" /> :
                               <Clock className="w-4 h-4" />}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {followUp.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {followUp.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Speaker Analytics */}
                  {selectedSummary.speakerAnalytics && selectedSummary.speakerAnalytics.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Speaker Analytics
                      </h3>
                      <div className="space-y-3">
                        {selectedSummary.speakerAnalytics.map((speaker) => (
                          <div key={speaker.speakerId} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {speaker.speakerName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {speaker.percentageOfMeeting}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${speaker.percentageOfMeeting}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>{speaker.wordCount} words</span>
                              <span>{speaker.questionsAsked} questions</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-xs text-gray-500">
                    <div className="flex items-center justify-between mb-2">
                      <span>Processing time:</span>
                      <span>{(selectedSummary.processingTime / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Model:</span>
                      <span>{selectedSummary.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <span>{(selectedSummary.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
