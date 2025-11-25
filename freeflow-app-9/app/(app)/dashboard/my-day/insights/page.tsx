'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, TrendingUp, Calendar, Activity, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// MY DAY UTILITIES
import { mockAIInsights } from '@/lib/my-day-utils'

export default function InsightsPage() {
  const handleApplyAISuggestion = (insightId: string) => {
    const insight = mockAIInsights.find(i => i.id === insightId)
    toast.success('AI Suggestion Applied', {
      description: `${insight?.title} - ${insight?.type} optimization applied`
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">AI Insights</h2>
        <p className="text-gray-600">
          Personalized recommendations to optimize your workflow
        </p>
      </div>

      <div className="grid gap-6">
        {mockAIInsights.map(insight => (
          <Card key={insight.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  insight.type === 'productivity' ? 'bg-purple-100' :
                  insight.type === 'schedule' ? 'bg-blue-100' :
                  insight.type === 'health' ? 'bg-green-100' : 'bg-orange-100'
                )}>
                  {insight.type === 'productivity' && <TrendingUp className="h-6 w-6 text-purple-600" />}
                  {insight.type === 'schedule' && <Calendar className="h-6 w-6 text-blue-600" />}
                  {insight.type === 'health' && <Activity className="h-6 w-6 text-green-600" />}
                  {insight.type === 'optimization' && <Zap className="h-6 w-6 text-orange-600" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        insight.priority === 'high' ? 'border-red-300 text-red-700' :
                        insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' : 'border-green-300 text-green-700'
                      )}
                    >
                      {insight.priority} priority
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{insight.description}</p>

                  {insight.actionable && (
                    <Button
                      data-testid="apply-suggestion-btn"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleApplyAISuggestion(insight.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Apply Suggestion
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
