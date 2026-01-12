"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Send,
  Grip,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Settings,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Activity,
  ThumbsUp,
  Reply,
  Trash2,
  Pin,
  Search,
  Play,
  Pause,
  Mic,
  Star,
  Share2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

// ============================================================================
// 1. AI INSIGHTS PANEL WITH NLP QUERIES (Like ThoughtSpot/Salesforce Einstein)
// ============================================================================

interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  priority?: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
  confidence?: number
  action?: string
  category?: string
  timestamp?: string | Date
  createdAt?: Date
}

interface AIInsightsPanelProps {
  insights?: AIInsight[]
  onQuery?: (query: string) => Promise<string>
  onInsightAction?: (insight: AIInsight) => void
  title?: string
  className?: string
}

export function AIInsightsPanel({
  insights = [],
  onQuery,
  className
}: AIInsightsPanelProps) {
  const [query, setQuery] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [conversation, setConversation] = React.useState<Array<{
    role: 'user' | 'ai'
    content: string
    timestamp: Date
  }>>([])
  const [isListening, setIsListening] = React.useState(false)

  const suggestedQueries = [
    "What's driving revenue this month?",
    "Show me underperforming campaigns",
    "Which leads should I prioritize?",
    "Predict next quarter's growth",
    "Compare this week vs last week",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isProcessing) return

    const userMessage = query
    setQuery('')
    setConversation(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])

    setIsProcessing(true)

    try {
      // Simulate AI processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      const aiResponse = onQuery
        ? await onQuery(userMessage)
        : generateMockResponse(userMessage)

      setConversation(prev => [...prev, {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('revenue')) {
      return "Based on my analysis, revenue is up 23% this month, primarily driven by: 1) New enterprise clients (+$45K), 2) Upsells from existing accounts (+$28K), 3) Improved conversion rates on paid campaigns (up 2.3%). The top 3 revenue sources are Direct Sales (42%), Marketing Campaigns (31%), and Referrals (27%)."
    }
    if (lowerQuery.includes('campaign') || lowerQuery.includes('underperform')) {
      return "I've identified 3 underperforming campaigns: 1) 'Summer Sale Email' - 12% below target CTR, recommend A/B testing subject lines. 2) 'LinkedIn Ads Q4' - CPA is 34% higher than benchmark, suggest narrowing audience targeting. 3) 'Retargeting Display' - frequency capping needed, showing ad fatigue after 5 impressions."
    }
    if (lowerQuery.includes('lead') || lowerQuery.includes('prioritize')) {
      return "Top 5 leads to prioritize based on AI scoring: 1) Acme Corp (Score: 94) - Visited pricing page 3x this week. 2) TechStart Inc (Score: 91) - Downloaded enterprise whitepaper. 3) Global Systems (Score: 88) - VP requested demo. 4) InnovateCo (Score: 85) - High engagement, budget confirmed. 5) FutureTech (Score: 82) - Multiple stakeholders viewing content."
    }
    if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('growth')) {
      return "Based on historical trends and current pipeline, I predict: Q1 revenue: $1.2M (±8% confidence interval), Growth rate: 18-24% YoY. Key factors: Strong pipeline ($3.2M in qualified opportunities), Seasonal uptick expected in February, 3 enterprise deals likely to close. Risk factors: 2 at-risk renewals totaling $45K."
    }
    if (lowerQuery.includes('compare') || lowerQuery.includes('week')) {
      return "Week-over-week comparison: Revenue: +12% ($89K vs $79K). New leads: +28% (145 vs 113). Conversion rate: +0.8% (4.2% vs 3.4%). Avg deal size: -5% ($12K vs $12.6K). Best performing channel: Organic search (+45%). Area needing attention: Email open rates down 3%."
    }
    return "I analyzed your data and found several interesting patterns. Based on the current trends, I recommend focusing on high-value activities that showed positive ROI last quarter. Would you like me to elaborate on any specific area?"
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-blue-500" />
      case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'opportunity': return <Target className="h-4 w-4 text-green-500" />
      case 'prediction': return <TrendingUp className="h-4 w-4 text-purple-500" />
    }
  }

  const getImpactColor = (impact: AIInsight['impact'] | AIInsight['priority']) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-5 w-5 text-violet-600" />
            </motion.div>
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configure AI preferences</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Ask questions in natural language</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* Conversation Area */}
        <ScrollArea className="h-[300px] p-4">
          {conversation.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                Ask me anything about your data...
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
                {suggestedQueries.map((q, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setQuery(q)}
                    className="block w-full text-left text-sm p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <Search className="h-3 w-3 inline mr-2 text-muted-foreground" />
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <Avatar className="h-8 w-8">
                    {msg.role === 'ai' ? (
                      <>
                        <AvatarFallback className="bg-violet-600 text-white">
                          <Brain className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>U</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={cn(
                    "flex-1 rounded-lg p-3 text-sm",
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-violet-600 text-white">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="h-4 w-4" />
                      </motion.div>
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 mr-12">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-violet-600 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* AI-Generated Insights Cards */}
        {insights.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-3">Latest Insights</p>
            {insights.slice(0, 3).map((insight) => (
              <motion.div
                key={insight.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                whileHover={{ x: 2 }}
              >
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{insight.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{insight.description}</p>
                </div>
                {(insight.impact || insight.priority) && (
                  <Badge variant="outline" className={cn("text-xs", getImpactColor(insight.impact || insight.priority))}>
                    {insight.impact || insight.priority}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t p-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your data..."
                className="pr-10"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7",
                  isListening && "text-red-500"
                )}
                onClick={() => setIsListening(!isListening)}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <Button type="submit" size="icon" disabled={isProcessing || !query.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 2. MICRO-VISUALIZATIONS (Sparklines, Progress Rings, Trend Indicators)
// ============================================================================

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showArea?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "#8b5cf6",
  showArea = true,
  className
}: SparklineProps) {
  if (!data.length) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  const trend = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'flat'

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg width={width} height={height} className="overflow-visible">
        {showArea && (
          <polygon
            points={areaPoints}
            fill={`${color}20`}
          />
        )}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={(data.length - 1) / (data.length - 1) * width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r={3}
          fill={color}
        />
      </svg>
      {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
      {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
      {trend === 'flat' && <Minus className="h-3 w-3 text-gray-500" />}
    </div>
  )
}

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showValue?: boolean
  label?: string
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = "#8b5cf6",
  backgroundColor = "#e5e7eb",
  showValue = true,
  label,
  className
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(value / max, 1)
  const offset = circumference - percentage * circumference

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(percentage * 100)}%</span>
        </div>
      )}
      {label && (
        <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

interface TrendIndicatorProps {
  value: number
  previousValue: number
  format?: 'percent' | 'number' | 'currency'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TrendIndicator({
  value,
  previousValue,
  format = 'percent',
  showIcon = true,
  size = 'md',
  className
}: TrendIndicatorProps) {
  const change = previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0
  const isPositive = change > 0
  const isNeutral = change === 0

  const formatValue = () => {
    const absChange = Math.abs(change)
    switch (format) {
      case 'percent':
        return `${absChange.toFixed(1)}%`
      case 'number':
        return Math.abs(value - previousValue).toLocaleString()
      case 'currency':
        return `$${Math.abs(value - previousValue).toLocaleString()}`
      default:
        return `${absChange.toFixed(1)}%`
    }
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1",
      isPositive ? 'text-green-600' : isNeutral ? 'text-gray-500' : 'text-red-600',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        isPositive ? <ArrowUp className={iconSizes[size]} /> :
        isNeutral ? <Minus className={iconSizes[size]} /> :
        <ArrowDown className={iconSizes[size]} />
      )}
      <span className="font-medium">{isPositive ? '+' : ''}{formatValue()}</span>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  previousValue?: number
  currentValue?: number
  icon?: React.ReactNode
  sparklineData?: number[]
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  onClick?: () => void
  className?: string
}

export function MetricCard({
  title,
  value,
  previousValue,
  currentValue,
  icon,
  sparklineData,
  trend,
  description,
  onClick,
  className
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border bg-card cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {previousValue !== undefined && currentValue !== undefined && (
            <TrendIndicator
              value={currentValue}
              previousValue={previousValue}
              size="sm"
              className="mt-1"
            />
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          {sparklineData && (
            <Sparkline
              data={sparklineData}
              width={60}
              height={20}
              color={trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#8b5cf6'}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// 3. REAL-TIME COLLABORATION INDICATORS
// ============================================================================

interface Collaborator {
  id: string
  name: string
  avatar?: string
  color?: string
  status: 'online' | 'away' | 'offline'
  role?: string
  isTyping?: boolean
  lastSeen?: Date
  lastActive?: string | Date
  cursor?: { x: number; y: number }
}

interface CollaborationIndicatorProps {
  collaborators: Collaborator[]
  maxVisible?: number
  showTyping?: boolean
  className?: string
}

export function CollaborationIndicator({
  collaborators = [],
  maxVisible = 4,
  showTyping = true,
  className
}: CollaborationIndicatorProps) {
  if (!collaborators || collaborators.length === 0) return null

  const visibleCollaborators = collaborators.slice(0, maxVisible)
  const remaining = collaborators.length - maxVisible
  const typingUsers = collaborators.filter(c => c.isTyping)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {visibleCollaborators.map((collaborator) => (
          <TooltipProvider key={collaborator.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background ring-2" style={{ '--tw-ring-color': collaborator.color || '#6366f1' } as React.CSSProperties}>
                    {collaborator.avatar ? (
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                    ) : null}
                    <AvatarFallback style={{ backgroundColor: collaborator.color || '#6366f1' }} className="text-white text-xs">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                    collaborator.status === 'online' ? 'bg-green-500' :
                    collaborator.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  )} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{collaborator.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{collaborator.status}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {remaining > 0 && (
          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
            +{remaining}
          </div>
        )}
      </div>

      {showTyping && typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-muted-foreground rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].name} is typing...`
              : `${typingUsers.length} people typing...`
            }
          </span>
        </motion.div>
      )}
    </div>
  )
}

interface LiveCursorProps {
  collaborator: Collaborator
  className?: string
}

export function LiveCursor({ collaborator, className }: LiveCursorProps) {
  if (!collaborator.cursor) return null

  return (
    <motion.div
      className={cn("absolute pointer-events-none z-50", className)}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: collaborator.cursor.x,
        y: collaborator.cursor.y
      }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.3))` }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.86a.5.5 0 0 0-.85.35Z"
          fill={collaborator.color}
        />
      </svg>
      <div
        className="absolute top-5 left-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: collaborator.color }}
      >
        {collaborator.name}
      </div>
    </motion.div>
  )
}

// ============================================================================
// 4. INLINE COMMENTS & @MENTIONS SYSTEM
// ============================================================================

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  mentions?: string[]
  reactions?: Array<{ emoji: string; count: number; users: string[] }>
  replies?: Comment[]
  createdAt: Date
  isPinned?: boolean
  isResolved?: boolean
}

interface InlineCommentProps {
  comment: Comment
  onReply?: (commentId: string, content: string) => void
  onReact?: (commentId: string, emoji: string) => void
  onResolve?: (commentId: string) => void
  onPin?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  className?: string
}

export function InlineComment({
  comment,
  onReply,
  onReact,
  onResolve,
  onPin,
  onDelete,
  className
}: InlineCommentProps) {
  const [isReplying, setIsReplying] = React.useState(false)
  const [replyContent, setReplyContent] = React.useState('')
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  const quickEmojis = ['👍', '❤️', '🎉', '👀', '🚀', '💡']

  const handleSubmitReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent)
      setReplyContent('')
      setIsReplying(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border bg-card p-3",
        comment.isPinned && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20",
        comment.isResolved && "opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          {comment.author.avatar ? (
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          ) : null}
          <AvatarFallback>
            {comment.author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
            {comment.isPinned && (
              <Badge variant="outline" className="text-xs">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            {comment.isResolved && (
              <Badge variant="outline" className="text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>

          <p className="text-sm mt-1">{comment.content}</p>

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {comment.reactions.map((reaction, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact?.(comment.id, reaction.emoji)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs hover:bg-muted/80"
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                React
              </Button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-full left-0 mt-1 p-1 bg-popover border rounded-lg shadow-lg flex gap-0.5 z-10"
                  >
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact?.(comment.id, emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!comment.isResolved && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-green-600"
                onClick={() => onResolve?.(comment.id)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onPin?.(comment.id)}
            >
              <Pin className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive"
              onClick={() => onDelete?.(comment.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2"
              >
                <Input
                  placeholder="Write a reply... Use @ to mention"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
                />
                <Button size="sm" className="h-8" onClick={handleSubmitReply}>
                  <Send className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 border-l-2 pl-4 space-y-3">
              {comment.replies.map((reply) => (
                <InlineComment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onReact={onReact}
                  onResolve={onResolve}
                  onPin={onPin}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// 5. DRAGGABLE DASHBOARD WIDGETS (Like Monday.com)
// ============================================================================

interface Widget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'list' | 'calendar' | 'activity'
  title: string
  width: 1 | 2 | 3 | 4
  height: 1 | 2
  data?: unknown
}

interface DashboardWidgetProps {
  widget: Widget
  isEditing?: boolean
  onRemove?: (id: string) => void
  onResize?: (id: string, width: number, height: number) => void
  onSettings?: (id: string) => void
  className?: string
  children?: React.ReactNode
}

export function DashboardWidget({
  widget,
  isEditing = false,
  onRemove,
  onResize,
  onSettings,
  className,
  children
}: DashboardWidgetProps) {
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-xl border bg-card overflow-hidden",
        isEditing && "ring-2 ring-primary/20",
        isMaximized && "fixed inset-4 z-50",
        className
      )}
      style={{
        gridColumn: isMaximized ? undefined : `span ${widget.width}`,
        gridRow: isMaximized ? undefined : `span ${widget.height}`,
      }}
    >
      {/* Widget Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b bg-muted/30",
        isEditing && "cursor-grab active:cursor-grabbing"
      )}>
        {isEditing && (
          <Grip className="h-4 w-4 text-muted-foreground mr-2" />
        )}
        <h3 className="text-sm font-medium flex-1 truncate">{widget.title}</h3>

        <AnimatePresence>
          {(isHovered || isEditing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onSettings?.(widget.id)}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsMaximized(!isMaximized)}
                    >
                      {isMaximized ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isMaximized ? 'Minimize' : 'Maximize'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isEditing && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => onRemove?.(widget.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove widget</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Widget Content */}
      <div className="p-4 h-[calc(100%-3rem)] overflow-auto">
        {children}
      </div>

      {/* Resize Handle (when editing) */}
      {isEditing && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-muted-foreground/50" />
        </div>
      )}
    </motion.div>
  )
}

// ============================================================================
// 6. PREDICTIVE ANALYTICS WIDGET
// ============================================================================

interface Prediction {
  id?: string
  label?: string
  title?: string
  prediction?: string
  current?: number
  target?: number
  currentValue?: number
  predictedValue?: number
  predicted?: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe?: string
  impact?: string
  factors?: Array<{ name: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> | string[]
}

interface PredictiveAnalyticsProps {
  predictions: Prediction[]
  onRefresh?: () => void
  title?: string
  className?: string
}

export function PredictiveAnalytics({
  predictions = [],
  onRefresh,
  className
}: PredictiveAnalyticsProps) {
  const [selectedPrediction, setSelectedPrediction] = React.useState<Prediction | null>(null)

  if (!predictions || predictions.length === 0) return null

  const getTrendIcon = (trend: Prediction['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-gray-500'
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Predictive Insights</CardTitle>
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>AI-generated forecasts based on your data</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setSelectedPrediction(
                selectedPrediction?.label === (prediction.label || prediction.title) ? null : prediction
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{prediction.label || prediction.title}</span>
                    {getTrendIcon(prediction.trend)}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-lg font-semibold">{(prediction.currentValue ?? prediction.current ?? 0).toLocaleString()}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Predicted ({prediction.timeframe || 'N/A'})</p>
                      <p className="text-lg font-semibold text-purple-600">{(prediction.predictedValue ?? prediction.predicted ?? prediction.target ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <ProgressRing
                    value={prediction.confidence}
                    size={48}
                    strokeWidth={4}
                    color="#8b5cf6"
                    label="Confidence"
                  />
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedPrediction?.label === (prediction.label || prediction.title) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t"
                  >
                    <p className="text-sm font-medium mb-2">Contributing Factors</p>
                    <div className="space-y-2">
                      {(prediction.factors || []).map((factor, i) => {
                        // Handle both string[] and object[] formats
                        if (typeof factor === 'string') {
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{factor}</span>
                            </div>
                          )
                        }
                        return (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className={getImpactColor(factor.impact)}>{factor.name}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={factor.weight * 100} className="w-24 h-2" />
                              <span className="text-xs text-muted-foreground w-10">
                                {(factor.weight * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 7. DATA STORYTELLING / NARRATIVE ANALYTICS
// ============================================================================

interface StorySegment {
  id: string
  type: 'headline' | 'insight' | 'recommendation' | 'warning' | 'trend'
  title: string
  content: string
  metric?: string
  value?: string | number
  change?: number
  chart?: 'line' | 'bar' | 'pie' | 'sparkline'
  data?: number[]
}

interface DataStoryProps {
  title: string
  subtitle?: string
  segments: StorySegment[]
  generatedAt?: Date
  onExport?: () => void
  onShare?: () => void
  className?: string
}

export function DataStory({
  title,
  subtitle,
  segments,
  generatedAt = new Date(),
  onExport,
  onShare,
  className
}: DataStoryProps) {
  const [currentSegment, setCurrentSegment] = React.useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentSegment(prev => (prev + 1) % segments.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, segments.length])

  const getSegmentIcon = (type: StorySegment['type']) => {
    switch (type) {
      case 'headline': return <Star className="h-5 w-5 text-amber-500" />
      case 'insight': return <Lightbulb className="h-5 w-5 text-blue-500" />
      case 'recommendation': return <Target className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'trend': return <TrendingUp className="h-5 w-5 text-purple-500" />
    }
  }

  const getSegmentBg = (type: StorySegment['type']) => {
    switch (type) {
      case 'headline': return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'
      case 'insight': return 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'
      case 'recommendation': return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
      case 'warning': return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
      case 'trend': return 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20'
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-violet-600/10 to-purple-600/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {title}
            </CardTitle>
            {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-1 mt-4">
          {segments.map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full cursor-pointer transition-colors",
                index === currentSegment ? "bg-primary" : "bg-muted"
              )}
              onClick={() => setCurrentSegment(index)}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSegment}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={cn("p-6", getSegmentBg(segments[currentSegment].type))}
          >
            <div className="flex items-start gap-4">
              {getSegmentIcon(segments[currentSegment].type)}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{segments[currentSegment].title}</h3>
                <p className="text-muted-foreground mt-2">{segments[currentSegment].content}</p>

                {segments[currentSegment].metric && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{segments[currentSegment].metric}</p>
                      <p className="text-2xl font-bold">{segments[currentSegment].value}</p>
                      {segments[currentSegment].change !== undefined && (
                        <TrendIndicator
                          value={segments[currentSegment].change!}
                          previousValue={0}
                          format="percent"
                          size="sm"
                        />
                      )}
                    </div>
                    {segments[currentSegment].data && (
                      <Sparkline
                        data={segments[currentSegment].data!}
                        width={150}
                        height={40}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSegment(prev => Math.max(0, prev - 1))}
            disabled={currentSegment === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentSegment + 1} / {segments.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSegment(prev => Math.min(segments.length - 1, prev + 1))}
            disabled={currentSegment === segments.length - 1}
          >
            Next
          </Button>
        </div>

        <div className="px-4 pb-4 text-xs text-muted-foreground text-center">
          Generated {generatedAt.toLocaleDateString()} at {generatedAt.toLocaleTimeString()} by AI
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  type AIInsight,
  type Collaborator,
  type Comment,
  type Widget,
  type Prediction,
  type StorySegment,
}
