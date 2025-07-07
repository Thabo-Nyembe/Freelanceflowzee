'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface AIVideoAnalysisProps {
  isLoading?: boolean
  data?: {
    quality: number
    engagement: number
    clarity: number
    pacing: number
    tags: string[]
    summary: string
    recommendations: string[]
  }
}

export function AIVideoAnalysis({ isLoading, data }: AIVideoAnalysisProps) {
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

  const {
    quality,
    engagement,
    clarity,
    pacing,
    tags,
    summary,
    recommendations
  } = data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quality</span>
              <span>{quality}%</span>
            </div>
            <Progress value={quality} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Engagement</span>
              <span>{engagement}%</span>
            </div>
            <Progress value={engagement} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Clarity</span>
              <span>{clarity}%</span>
            </div>
            <Progress value={clarity} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pacing</span>
              <span>{pacing}%</span>
            </div>
            <Progress value={pacing} />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Recommendations</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 