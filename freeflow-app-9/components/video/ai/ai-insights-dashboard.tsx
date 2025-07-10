'use client';

import { useState } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Lightbulb, 
  CheckSquare, 
  Heart,
  BarChart3,
  Tag,
  Clock,
  Star,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AIAnalysis {
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

interface AITag {
  tag: string;
  category?: string;
  confidence_score?: number;
  source: 'ai_generated' | 'manual' | 'imported';
}

interface AIInsightsDashboardProps {
  analysis: AIAnalysis | null;
  tags: AITag[];
  isLoading?: boolean;
  onRegenerate?: () => void;
  onTagEdit?: (tags: AITag[]) => void;
  className?: string;
}

export function AIInsightsDashboard({
  analysis: unknown, tags: unknown, isLoading = false: unknown, onRegenerate: unknown, onTagEdit: unknown, className
}: AIInsightsDashboardProps) {
  const [isRegenerating, setIsRegenerating] = useState<any>(false);

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      education: 'bg-blue-100 text-blue-800',
      tutorial: 'bg-green-100 text-green-800',
      presentation: 'bg-purple-100 text-purple-800',
      demo: 'bg-orange-100 text-orange-800',
      review: 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-pink-100 text-pink-800',
      business: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

  // Difficulty colors
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.beginner;
  };

  // Sentiment colors and icons
  const getSentimentDisplay = (sentiment: string) => {
    const displays: Record<string, { color: string; icon: unknown; label: string }> = {
      positive: { color: 'text-green-600', icon: ThumbsUp, label: 'Positive' },
      neutral: { color: 'text-gray-600', icon: Heart, label: 'Neutral' },
      negative: { color: 'text-red-600', icon: ThumbsDown, label: 'Negative' }
    };
    return displays[sentiment] || displays.neutral;
  };

  // Handle regeneration
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate?.();
    } finally {
      setIsRegenerating(false);
    }
  };

  // Group tags by category
  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, AITag[]>);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-16 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No analysis state
  if (!analysis) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-400" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No AI analysis available</p>
            <p className="text-sm">Start AI processing to generate insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (analysis.processing_status === 'failed') {
    return (
      <Card className={cn("w-full border-red-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Brain className="h-5 w-5" />
            AI Analysis Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p className="text-lg font-medium mb-2">AI analysis failed</p>
            <p className="text-sm mb-4">Please try processing the video again</p>
            <Button variant="outline" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing state
  if (analysis.processing_status === 'processing') {
    return (
      <Card className={cn("w-full border-blue-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Brain className="h-5 w-5 animate-pulse" />
            Analyzing Content...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-blue-500">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Generating AI insights</p>
            <p className="text-sm">This may take a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sentimentDisplay = getSentimentDisplay(analysis.sentiment);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Content Analysis
              {analysis.confidence_score && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {Math.round(analysis.confidence_score * 100)}% confidence
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1"
            >
              <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
              Regenerate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Summary
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BookOpen className="h-4 w-4" />
                Category
              </div>
              <Badge className={getCategoryColor(analysis.category)}>
                {analysis.category}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BarChart3 className="h-4 w-4" />
                Difficulty
              </div>
              <Badge className={getDifficultyColor(analysis.difficulty)}>
                {analysis.difficulty}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <sentimentDisplay.icon className="h-4 w-4" />
                Sentiment
              </div>
              <Badge variant="outline" className={sentimentDisplay.color}>
                {sentimentDisplay.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Watch Time
              </div>
              <p className="text-sm text-gray-600">{analysis.estimated_watch_time}</p>
            </div>
          </div>

          <Separator />

          {/* Target Audience */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </h3>
            <p className="text-sm text-gray-600">{analysis.target_audience}</p>
          </div>

          {/* Main Topics */}
          {analysis.main_topics && analysis.main_topics.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Main Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.main_topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {analysis.key_insights && analysis.key_insights.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Key Insights
              </h3>
              <div className="space-y-2">
                {analysis.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                    <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {analysis.action_items && analysis.action_items.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {analysis.action_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                    <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Tags Card */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Smart Tags
              <Badge variant="outline">{tags.length} tags</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedTags).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedTags).map(([category, categoryTags]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {category === 'other' ? 'General' : category.replace('_', ' ')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryTags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant={tag.source === 'ai_generated' ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {tag.source === 'ai_generated' && <Sparkles className="h-3 w-3" />}
                          {tag.tag}
                          {tag.confidence_score && (
                            <span className="text-xs opacity-75">
                              {Math.round(tag.confidence_score * 100)}%
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No tags generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Content Type</h4>
              <p className="text-lg font-semibold text-blue-800 capitalize">{analysis.content_type}</p>
              <p className="text-xs text-blue-600 mt-1">Based on content analysis</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Language</h4>
              <p className="text-lg font-semibold text-green-800 uppercase">{analysis.detected_language}</p>
              <p className="text-xs text-green-600 mt-1">Auto-detected</p>
            </div>
          </div>

          {analysis.confidence_score && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Analysis Confidence</span>
                <span className="text-sm text-gray-600">{Math.round(analysis.confidence_score * 100)}%</span>
              </div>
              <Progress value={analysis.confidence_score * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AIInsightsDashboard; 