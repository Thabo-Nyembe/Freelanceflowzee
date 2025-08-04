'use client'

import { VideoAnalysisData } from '@/lib/types/ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, BarChart2, Tag } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AIVideoAnalysisProps {
  data?: VideoAnalysisData
  isLoading?: boolean
}

export function AIVideoAnalysis({ data, isLoading }: AIVideoAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Content Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quality</span>
                <span>{Math.round(data.quality)}%</span>
              </div>
              <Progress value={data.quality} className="bg-blue-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engagement</span>
                <span>{Math.round(data.engagement)}%</span>
              </div>
              <Progress value={data.engagement} className="bg-green-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Clarity</span>
                <span>{Math.round(data.clarity)}%</span>
              </div>
              <Progress value={data.clarity} className="bg-purple-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pacing</span>
                <span>{Math.round(data.pacing)}%</span>
              </div>
              <Progress value={data.pacing} className="bg-orange-100" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Content Tags</h3>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recommendations</h3>
            <div className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 