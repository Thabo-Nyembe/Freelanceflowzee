'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Insight {
  category: string
  score: number
  details: string
  recommendations: string[]
}

interface VideoInsightsProps {
  isLoading?: boolean
  data?: {
    insights: Insight[]
    overallScore: number
    topStrengths: string[]
    improvementAreas: string[]
  }
}

export function VideoInsights({ isLoading, data }: VideoInsightsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { insights, overallScore, topStrengths, improvementAreas } = data

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Video Insights</span>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Top Strengths</h4>
            <ul className="space-y-1">
              {topStrengths.map((strength, index) => (
                <li key={index} className="flex items-center text-green-500">
                  <span className="mr-2">✓</span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Areas for Improvement</h4>
            <ul className="space-y-1">
              {improvementAreas.map((area, index) => (
                <li key={index} className="flex items-center text-yellow-500">
                  <span className="mr-2">!</span>
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {insights.map((insight, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>{insight.category}</span>
                  <Badge
                    variant={insight.score >= 70 ? 'default' : 'secondary'}
                    className={getScoreColor(insight.score)}
                  >
                    {insight.score}%
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    {insight.details}
                  </p>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {insight.recommendations.map((rec, recIndex) => (
                        <li key={recIndex}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <Progress value={insight.score} className="mt-2" />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
} 