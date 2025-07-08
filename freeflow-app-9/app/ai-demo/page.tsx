'use client';

import React, { useState } from 'react';
import { 
  Brain, 
  Play, 
  Mic, 
  Tag, 
  FileText, 
  BarChart3, 
  Zap, 
  Sparkles,
  Volume2,
  Clock,
  Users,
  TrendingUp,
  BookOpen,
  Lightbulb,
  CheckSquare,
  Languages,
  Download,
  RefreshCw,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import TranscriptionViewer from '@/components/video/ai/transcription-viewer';
import AIInsightsDashboard from '@/components/video/ai/ai-insights-dashboard';
import VideoAIPanel from '@/components/video/ai/video-ai-panel';

// Mock data for demonstration
const DEMO_VIDEO = {
  id: 'demo-video-1',
  title: 'Building a React Video Player - Complete Tutorial',
  description: 'Learn how to build a custom video player with React, featuring play controls, progress tracking, and advanced features.',
  duration_seconds: 1247, // ~20 minutes
  owner_id: 'demo-user',
  created_at: '2024-01-15T10:00:00Z'
};

const DEMO_TRANSCRIPTION = {
  id: 'demo-transcript-1',
  text: `Welcome to this comprehensive tutorial on building a React video player. Today we&apos;re going to cover everything from basic setup to advanced features like custom controls and analytics tracking. 

First, let&apos;s start with the basic HTML5 video element and how to integrate it with React. We&apos;ll be using modern React hooks like useState and to manage our player state.

The key components we&apos;ll build include the video display area, play/pause controls, a progress bar with seeking functionality, volume controls, and fullscreen capabilities. We&apos;ll also implement keyboard shortcuts for better user experience.

For the backend, we&apos;ll integrate with a video hosting service to handle different video formats and streaming optimization. This ensures our player works across all devices and connection speeds.

Finally, we&apos;ll add analytics tracking to understand user engagement patterns and optimize the viewing experience. This includes tracking play events, seek positions, and completion rates.

By the end of this tutorial, you&apos;ll have a production-ready video player that you can customize for your specific needs.`,
  language: 'en',
  duration_seconds: 1247,
  confidence_score: 0.96,
  processing_status: 'completed' as const,
  segments: [
    {
      id: 1,
      start: 0,
      end: 15,
      text: 'Welcome to this comprehensive tutorial on building a React video player.',
      confidence: 0.98
    },
    {
      id: 2,
      start: 15,
      end: 32,
      text: "Today we&apos;re going to cover everything from basic setup to advanced features like custom controls and analytics tracking.",
      confidence: 0.97
    },
    {
      id: 3,
      start: 32,
      end: 58,
      text: "First, let&apos;s start with the basic HTML5 video element and how to integrate it with React. We&apos;ll be using modern React hooks like useState and to manage our player state.",
      confidence: 0.95
    }
  ]
};

const DEMO_ANALYSIS = {
  id: 'demo-analysis-1',
  summary: 'This tutorial provides a comprehensive guide to building a custom React video player from scratch. It covers essential components like playback controls, progress tracking, volume management, and fullscreen functionality. The tutorial also includes backend integration with video hosting services and analytics implementation for tracking user engagement.',
  main_topics: ['React Development', 'Video Player', 'Frontend Tutorial', 'Web Development', 'User Interface'],
  category: 'tutorial',
  difficulty: 'intermediate' as const,
  target_audience: 'React developers looking to implement custom video functionality in their applications',
  key_insights: [
    'Building video players requires careful state management with React hooks',
    'Integration with video hosting services ensures optimal performance across devices',
    'Analytics tracking provides valuable insights into user engagement patterns',
    'Keyboard shortcuts significantly improve user experience'
  ],
  action_items: [
    'Set up basic React project structure',
    'Implement HTML5 video element integration',
    'Build custom playback controls',
    'Add analytics tracking functionality'
  ],
  sentiment: 'positive' as const,
  detected_language: 'en',
  estimated_watch_time: '20 minutes',
  content_type: 'tutorial',
  confidence_score: 0.92,
  processing_status: 'completed' as const
};

const DEMO_TAGS = [
  { tag: 'React', category: 'technology', confidence_score: 0.98, source: 'ai_generated' as const },
  { tag: 'JavaScript', category: 'technology', confidence_score: 0.95, source: 'ai_generated' as const },
  { tag: 'Video Player', category: 'feature', confidence_score: 0.97, source: 'ai_generated' as const },
  { tag: 'Tutorial', category: 'content_type', confidence_score: 0.99, source: 'ai_generated' as const },
  { tag: 'Frontend Development', category: 'skill', confidence_score: 0.94, source: 'ai_generated' as const },
  { tag: 'Web Development', category: 'industry', confidence_score: 0.93, source: 'ai_generated' as const },
  { tag: 'HTML5', category: 'technology', confidence_score: 0.91, source: 'ai_generated' as const },
  { tag: 'User Interface', category: 'concept', confidence_score: 0.89, source: 'ai_generated' as const },
  { tag: 'Analytics', category: 'feature', confidence_score: 0.87, source: 'ai_generated' as const },
  { tag: 'Intermediate Level', category: 'difficulty', confidence_score: 0.85, source: 'ai_generated' as const }
];

const DEMO_CHAPTERS = [
  {
    id: 'chapter-1',
    title: 'Introduction & Setup',
    description: 'Overview of the tutorial and project setup',
    start_time: 0,
    end_time: 120,
    chapter_order: 1
  },
  {
    id: 'chapter-2',
    title: 'Basic Video Integration',
    description: 'Implementing HTML5 video element with React',
    start_time: 120,
    end_time: 380,
    chapter_order: 2
  },
  {
    id: 'chapter-3',
    title: 'Custom Controls',
    description: 'Building play/pause, progress, and volume controls',
    start_time: 380,
    end_time: 720,
    chapter_order: 3
  },
  {
    id: 'chapter-4',
    title: 'Advanced Features',
    description: 'Fullscreen, keyboard shortcuts, and optimization',
    start_time: 720,
    end_time: 980,
    chapter_order: 4
  },
  {
    id: 'chapter-5',
    title: 'Analytics & Deployment',
    description: 'Adding tracking and deploying the player',
    start_time: 980,
    end_time: 1247,
    chapter_order: 5
  }
];

const DEMO_AI_DATA = {
  transcription: DEMO_TRANSCRIPTION,
  analysis: DEMO_ANALYSIS,
  tags: DEMO_TAGS,
  chapters: DEMO_CHAPTERS,
  status: {
    overall: 'completed' as const,
    startedAt: '2024-01-15T10:05:00Z',
    completedAt: '2024-01-15T10:12:00Z',
    features: {
      transcription: true,
      analysis: true,
      tags: true,
      chapters: true
    }
  }
};

export default function AIDemoPage() {
  const [activeFeature, setActiveFeature] = useState('overview');
  const [demoProgress, setDemoProgress] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate AI processing
  const simulateProcessing = async () => {
    setIsSimulating(true);
    setDemoProgress(0);

    const steps = [
      { name: 'Extracting audio...', duration: 1000 },
      { name: 'Transcribing speech...', duration: 2000 },
      { name: 'Analyzing content...', duration: 1500 },
      { name: 'Generating tags...', duration: 1000 },
      { name: 'Creating chapters...', duration: 1200 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      setDemoProgress(((i + 1) / steps.length) * 100);
    }

    setIsSimulating(false);
  };

  const handleSeekTo = (timestamp: number) => {
    console.log(`Seeking to timestamp: ${timestamp}s`);
    // In a real implementation, this would control the video player
  };

  const features = [
    {
      id: 'transcription',
      title: 'AI Transcription',
      description: 'Automatic speech-to-text conversion with OpenAI Whisper',
      icon: Volume2,
      color: 'blue'
    },
    {
      id: 'analysis',
      title: 'Content Analysis',
      description: 'AI-powered insights and content categorization',
      icon: Brain,
      color: 'purple'
    },
    {
      id: 'tagging',
      title: 'Smart Tagging',
      description: 'Automatic tag generation for better discoverability',
      icon: Tag,
      color: 'green'
    },
    {
      id: 'chapters',
      title: 'Auto Chapters',
      description: 'Intelligent video segmentation and chapter creation',
      icon: Clock,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">AI-Powered Video Intelligence</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              FreeFlow <span className="text-yellow-300">AI</span> Demo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Experience the future of video content analysis with automated transcription, 
              intelligent insights, and smart categorization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90"
                onClick={() => setActiveFeature('demo')}
              >
                <Play className="mr-2 h-5 w-5" />
                Try Live Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/video-studio">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Building
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI-Powered Video Intelligence</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your videos with cutting-edge AI technologies that understand, analyze, and enhance your content automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 border-blue-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              orange: 'bg-orange-50 text-orange-600 border-orange-200'
            };

            return (
              <Card key={feature.id} className="h-full hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Processing Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              AI Processing Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                See how our AI processes videos in real-time with multiple concurrent analysis streams.
              </p>
              <Button 
                onClick={simulateProcessing}
                disabled={isSimulating}
                className="flex items-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start AI Processing
                  </>
                )}
              </Button>
              
              {(isSimulating || demoProgress > 0) && (
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(demoProgress)}%</span>
                  </div>
                  <Progress value={demoProgress} className="h-2" />
                  {isSimulating && (
                    <p className="text-sm text-blue-600">
                      AI is analyzing audio, extracting insights, and generating metadata...
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Interactive AI Demo</h2>
            <p className="text-lg text-gray-600">
              Explore real AI-generated results from our video analysis pipeline.
            </p>
          </div>

          <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transcription">Transcription</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="demo">Full Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <div className="text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
                          <h3 className="text-xl font-semibold">{DEMO_VIDEO.title}</h3>
                          <p className="text-blue-100 mt-2">{Math.floor(DEMO_VIDEO.duration_seconds / 60)} minutes</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Video Details</h4>
                        <p className="text-sm text-gray-600">{DEMO_VIDEO.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">Tutorial</Badge>
                          <Badge variant="secondary">React</Badge>
                          <Badge variant="secondary">JavaScript</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Processing Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Volume2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">✓</div>
                        <div className="text-sm font-medium">Transcription</div>
                        <div className="text-xs text-gray-600">96% accuracy</div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold text-purple-600">✓</div>
                        <div className="text-sm font-medium">Analysis</div>
                        <div className="text-xs text-gray-600">92% confidence</div>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Tag className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">10</div>
                        <div className="text-sm font-medium">Smart Tags</div>
                        <div className="text-xs text-gray-600">Auto-generated</div>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold text-orange-600">5</div>
                        <div className="text-sm font-medium">Chapters</div>
                        <div className="text-xs text-gray-600">AI-detected</div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="text-sm font-medium">Processing Timeline:</div>
                      <div className="text-xs space-y-1 text-gray-600">
                        <div>✓ Audio extraction: 15s</div>
                        <div>✓ Speech transcription: 45s</div>
                        <div>✓ Content analysis: 30s</div>
                        <div>✓ Tag generation: 20s</div>
                        <div>✓ Chapter detection: 25s</div>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Total processing time: 2m 15s
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transcription">
              <TranscriptionViewer
                transcription={DEMO_TRANSCRIPTION}
                onSeekTo={handleSeekTo}
              />
            </TabsContent>

            <TabsContent value="analysis">
              <AIInsightsDashboard
                analysis={DEMO_ANALYSIS}
                tags={DEMO_TAGS}
              />
            </TabsContent>

            <TabsContent value="chapters">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Chapters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DEMO_CHAPTERS.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSeekTo(chapter.start_time)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{chapter.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{chapter.description}</div>
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {Math.floor(chapter.start_time / 60)}:{Math.floor(chapter.start_time % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demo">
              <VideoAIPanel
                videoId={DEMO_VIDEO.id}
                videoTitle={DEMO_VIDEO.title}
                videoDuration={DEMO_VIDEO.duration_seconds}
                aiData={DEMO_AI_DATA}
                onSeekTo={handleSeekTo}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powered by Leading AI Technology</h2>
          <p className="text-lg text-gray-600">
            Our AI pipeline leverages state-of-the-art models and infrastructure for reliable, scalable video analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-blue-600" />
                OpenAI Whisper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                State-of-the-art speech recognition for accurate transcription in 99+ languages.
              </p>
              <ul className="text-sm space-y-1 text-gray-500">
                <li>• 96%+ accuracy rate</li>
                <li>• Multi-language support</li>
                <li>• Noise-robust processing</li>
                <li>• Timestamp precision</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                GPT-4 Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Advanced content understanding for insights, categorization, and recommendations.
              </p>
              <ul className="text-sm space-y-1 text-gray-500">
                <li>• Content summarization</li>
                <li>• Topic extraction</li>
                <li>• Sentiment analysis</li>
                <li>• Actionable insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Real-time Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Optimized pipeline for fast, concurrent processing of multiple AI features.
              </p>
              <ul className="text-sm space-y-1 text-gray-500">
                <li>• Sub-5 minute processing</li>
                <li>• Scalable infrastructure</li>
                <li>• Progress tracking</li>
                <li>• Error recovery</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Videos?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of creators using FreeFlow AI to unlock the full potential of their video content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-white/90"
              asChild
            >
              <Link href="/video-studio">
                <ArrowRight className="mr-2 h-5 w-5" />
                Start Free Trial
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/docs/ai">
                <BookOpen className="mr-2 h-5 w-5" />
                View Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 