'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { MessageSquare, Plus, TrendingUp, Users, Star, CheckCircle } from 'lucide-react'

const surveys = [
  { id: 'SUR-001', name: 'Product Satisfaction Q1', status: 'active', responses: 245, target: 500, avgScore: 4.2, created: '2024-01-15', expires: '2024-03-31' },
  { id: 'SUR-002', name: 'Customer Support Experience', status: 'active', responses: 189, target: 300, avgScore: 4.5, created: '2024-02-01', expires: '2024-04-30' },
  { id: 'SUR-003', name: 'Feature Request Survey', status: 'completed', responses: 420, target: 400, avgScore: 3.9, created: '2023-12-01', expires: '2024-01-31' },
]

const recentFeedback = [
  { customer: 'John Smith', survey: 'Product Satisfaction Q1', score: 5, comment: 'Excellent product, very satisfied!', date: '2024-02-01' },
  { customer: 'Sarah Johnson', survey: 'Customer Support', score: 4, comment: 'Good support, quick response time', date: '2024-02-01' },
]

export default function FeedbackSurveysClient() {
  const stats = useMemo(() => ({
    total: surveys.length,
    active: surveys.filter(s => s.status === 'active').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responses, 0),
    avgScore: (surveys.reduce((sum, s) => sum + s.avgScore, 0) / surveys.length).toFixed(1),
  }), [])

  const insights = [
    { icon: MessageSquare, title: `${stats.total}`, description: 'Total surveys' },
    { icon: CheckCircle, title: `${stats.active}`, description: 'Active' },
    { icon: Users, title: `${stats.totalResponses}`, description: 'Total responses' },
    { icon: Star, title: `${stats.avgScore}`, description: 'Avg satisfaction' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MessageSquare className="h-8 w-8 text-primary" />Feedback & Surveys</h1>
          <p className="text-muted-foreground mt-1">Collect and analyze customer feedback</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Survey</Button>
      </div>

      <CollapsibleInsightsPanel title="Survey Overview" insights={insights} defaultExpanded={true} />

      <div className="space-y-3">
        {surveys.map((survey) => (
          <Card key={survey.id}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{survey.id}</Badge>
                    <h4 className="font-semibold">{survey.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Created: {survey.created} • Expires: {survey.expires}</p>
                </div>
                <Badge className={survey.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {survey.status}
                </Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-medium">{survey.responses} / {survey.target}</span>
                </div>
                <Progress value={(survey.responses / survey.target) * 100} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Responses</p>
                  <p className="font-bold">{survey.responses}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-muted-foreground">Avg Score</p>
                    <p className="font-bold">{survey.avgScore}/5.0</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Recent Feedback</h3>
          <div className="space-y-3">
            {recentFeedback.map((f, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold">{f.customer}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{f.score}</span>
                  </div>
                </div>
                <p className="text-sm mb-2">{f.comment}</p>
                <p className="text-xs text-muted-foreground">{f.survey} • {f.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
