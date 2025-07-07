'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Users,
  Clock,
  Smile,
  Meh,
  Frown,
  CheckCircle,
  Target,
  Tags,
  Timer
} from 'lucide-react'

interface VideoInsightData {
  topics: string[]
  targetAudience: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  actionItems: string[]
  estimatedWatchTime: number
}

interface VideoInsightsProps {
  data?: VideoInsightData
}

export function VideoInsights({ data }: VideoInsightsProps) {
  if (!data) return null

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Content Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your video content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topics */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-medium">
              <Tags className="h-4 w-4" />
              Main Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.topics.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-medium">
              <Target className="h-4 w-4" />
              Target Audience
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.targetAudience.map((audience, index) => (
                <Badge key={index} variant="outline">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4" />
              Content Sentiment
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Smile className="h-4 w-4 text-green-500" />
                <Progress
                  value={data.sentiment.positive * 100}
                  className="flex-1"
                />
                <span className="w-12 text-sm">
                  {Math.round(data.sentiment.positive * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Meh className="h-4 w-4 text-yellow-500" />
                <Progress
                  value={data.sentiment.neutral * 100}
                  className="flex-1"
                />
                <span className="w-12 text-sm">
                  {Math.round(data.sentiment.neutral * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Frown className="h-4 w-4 text-red-500" />
                <Progress
                  value={data.sentiment.negative * 100}
                  className="flex-1"
                />
                <span className="w-12 text-sm">
                  {Math.round(data.sentiment.negative * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {data.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Estimated Watch Time */}
          <div className="flex items-center gap-2 rounded-lg border p-4">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Estimated Watch Time</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(data.estimatedWatchTime)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 