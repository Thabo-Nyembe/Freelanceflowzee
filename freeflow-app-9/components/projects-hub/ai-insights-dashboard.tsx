"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Icons
import {
  Brain,
  TrendingUp,
  BarChart3,
  Clock,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Target,
  Lightbulb,
  Zap,
  Star,
  ArrowRight,
  RefreshCw,
  Download,
  Eye,
  ThumbsDown,
  Meh,
  Smile,
  Heart,
  Sparkles
} from "lucide-react"

// Types
import { Comment } from "./universal-pinpoint-feedback-system-enhanced"
import {
  AICommentAnalysis,
  CommentInsights,
  SmartRecommendation,
  commentAnalysisService
} from "@/lib/ai/comment-analysis-service"

interface AIInsightsDashboardProps {
  comments: Comment[]
  projectId: string
  onRecommendationApply: (recommendation: SmartRecommendation) => void
  onCommentSelect: (commentId: string) => void
  className?: string
}

export function AIInsightsDashboard({
  comments,
  projectId,
  onRecommendationApply,
  onCommentSelect,
  className
}: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<CommentInsights | null>(null)
  const [analyses, setAnalyses] = useState<AICommentAnalysis[]>([])
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AICommentAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Load AI insights
  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true)
      try {
        // Analyze all comments
        const commentAnalyses = await commentAnalysisService.analyzeComments(comments)
        setAnalyses(commentAnalyses)

        // Get project insights
        const projectInsights = await commentAnalysisService.getProjectInsights(projectId, comments)
        setInsights(projectInsights)

        // Get smart recommendations
        const smartRecommendations = await commentAnalysisService.getSmartRecommendations(comments, commentAnalyses)
        setRecommendations(smartRecommendations)
      } catch (error) {
        console.error("Error loading AI insights:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (comments.length > 0) {
      loadInsights()
    }
  }, [comments, projectId])

  // Calculate sentiment distribution
  const sentimentDistribution = useMemo(() => {
    if (!analyses.length) return null

    const distribution = analyses.reduce((acc, analysis) => {
      acc[analysis.sentiment] = (acc[analysis.sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = analyses.length
    return {
      positive: Math.round(((distribution.positive || 0) / total) * 100),
      constructive: Math.round(((distribution.constructive || 0) / total) * 100),
      neutral: Math.round(((distribution.neutral || 0) / total) * 100),
      negative: Math.round(((distribution.negative || 0) / total) * 100)
    }
  }, [analyses])

  // Get sentiment icon and color
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <Smile className="w-4 h-4 text-green-500" />
      case "constructive": return <Lightbulb className="w-4 h-4 text-blue-500" />
      case "neutral": return <Meh className="w-4 h-4 text-gray-500" />
      case "negative": return <ThumbsDown className="w-4 h-4 text-red-500" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-500"
      case "high": return "text-orange-500"
      case "medium": return "text-yellow-500"
      case "low": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  // Refresh insights
  const refreshInsights = async () => {
    // Clear cache and reload
    await loadInsights()
  }

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Analyzing comments...</span>
        </div>
      </Card>
    )
  }

  if (!insights || !analyses.length) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No AI Insights Available</h3>
        <p className="text-muted-foreground mb-4">
          Add some comments to get AI-powered insights and recommendations.
        </p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">AI Insights</h2>
          <Badge variant="secondary" className="ml-2">
            {analyses.length} comments analyzed
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={refreshInsights}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Total Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.totalComments}</div>
                <p className="text-xs text-muted-foreground">
                  {insights.engagementMetrics.averageReplies.toFixed(1)} avg replies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Avg Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.averageSentiment > 0 ? "+" : ""}{insights.averageSentiment.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {insights.averageSentiment > 0 ? "Positive" : insights.averageSentiment < 0 ? "Negative" : "Neutral"} overall
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Resolution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.timeToResolution.average}d</div>
                <p className="text-xs text-muted-foreground">
                  {insights.timeToResolution.median}d median
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Resolution Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((insights.statusDistribution.resolved / insights.totalComments) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {insights.statusDistribution.resolved} resolved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top Themes
              </CardTitle>
              <CardDescription>
                Most discussed topics in feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.topThemes.map((theme, index) => (
                  <div key={theme.theme} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{theme.theme}</span>
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(theme.sentiment > 0 ? "positive" : theme.sentiment < 0 ? "negative" : "neutral")}
                          <span className="text-sm text-muted-foreground">{theme.count}</span>
                        </div>
                      </div>
                      <Progress value={(theme.count / insights.totalComments) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority & Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(insights.priorityDistribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium capitalize", getPriorityColor(priority))}>
                        {priority}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-current"
                            style={{ width: `${(count / insights.totalComments) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(insights.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {status.replace("_", " ")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(count / insights.totalComments) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          {/* Sentiment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Sentiment Analysis
              </CardTitle>
              <CardDescription>
                AI-powered sentiment breakdown of all comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentimentDistribution && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Smile className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold text-green-500">{sentimentDistribution.positive}%</div>
                    <div className="text-sm text-muted-foreground">Positive</div>
                  </div>
                  <div className="text-center">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-blue-500">{sentimentDistribution.constructive}%</div>
                    <div className="text-sm text-muted-foreground">Constructive</div>
                  </div>
                  <div className="text-center">
                    <Meh className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <div className="text-2xl font-bold text-gray-500">{sentimentDistribution.neutral}%</div>
                    <div className="text-sm text-muted-foreground">Neutral</div>
                  </div>
                  <div className="text-center">
                    <ThumbsDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold text-red-500">{sentimentDistribution.negative}%</div>
                    <div className="text-sm text-muted-foreground">Negative</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Comment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Comment Analysis</CardTitle>
              <CardDescription>
                Detailed AI analysis for each comment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const comment = comments.find(c => c.id === analysis.commentId)
                    if (!comment) return null

                    return (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSentimentIcon(analysis.sentiment)}
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(analysis.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onCommentSelect(comment.id)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {comment.content}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {analysis.themes.map((theme) => (
                            <Badge key={theme} variant="secondary" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Category: {analysis.category}</span>
                          <span>Effort: {analysis.estimatedEffort}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated suggestions to improve your feedback process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recommendations available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>

                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span className="text-xs">Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <Badge variant={rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "default" : "secondary"}>
                              {rec.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {rec.effort} effort
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <div className="mb-1">Reasoning:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {rec.reasoning.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => onRecommendationApply(rec)}
                          className="ml-4"
                        >
                          Apply
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trend Analysis
              </CardTitle>
              <CardDescription>
                Comment and resolution trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Weekly Comment Trend */}
                <div>
                  <h4 className="font-medium mb-3">Weekly Comments</h4>
                  <div className="flex items-end space-x-2 h-32">
                    {insights.trendAnalysis.weeklyComments.map((count, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${(count / Math.max(...insights.trendAnalysis.weeklyComments)) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">W{index + 1}</span>
                        <span className="text-xs font-mono">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Satisfaction Trend */}
                <div>
                  <h4 className="font-medium mb-3">Satisfaction Trend</h4>
                  <div className="flex items-center space-x-4">
                    {insights.trendAnalysis.satisfactionTrend.map((score, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-mono mb-1">{(score * 100).toFixed(0)}%</div>
                        <div className="w-4 h-4 rounded-full bg-green-500" style={{ opacity: score }} />
                        <div className="text-xs text-muted-foreground mt-1">W{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Detail Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Analysis Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown of AI analysis for this comment
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getSentimentIcon(selectedAnalysis.sentiment)}
                <span className="font-medium capitalize">{selectedAnalysis.sentiment} Sentiment</span>
                <Badge>{(selectedAnalysis.confidence * 100).toFixed(0)}% confidence</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAnalysis.themes.map((theme) => (
                    <Badge key={theme} variant="secondary">{theme}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAnalysis.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>

              {selectedAnalysis.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Suggested Actions</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.actionItems.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{action.description}</span>
                        <Badge variant={action.priority === "high" ? "destructive" : "secondary"}>
                          {action.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">AI Suggestions</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-muted rounded">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">{suggestion.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {(suggestion.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <p className="text-sm">{suggestion.content}</p>
                        {suggestion.reasoning && (
                          <p className="text-xs text-muted-foreground mt-1">{suggestion.reasoning}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}