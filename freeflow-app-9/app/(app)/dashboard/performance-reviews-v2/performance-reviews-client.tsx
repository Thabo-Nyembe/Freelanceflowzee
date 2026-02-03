'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Star, TrendingUp, Calendar, Users } from 'lucide-react'

const reviews = [
  { employee: 'John Doe', department: 'Engineering', rating: 4.5, period: 'Q4 2023', status: 'completed', reviewDate: '2024-01-15' },
  { employee: 'Sarah Kim', department: 'Marketing', rating: 4.8, period: 'Q4 2023', status: 'completed', reviewDate: '2024-01-12' },
  { employee: 'Mike Roberts', department: 'Sales', rating: 4.2, period: 'Q4 2023', status: 'pending', reviewDate: '2024-02-01' },
]

export default function PerformanceReviewsClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Star className="h-8 w-8" />Performance Reviews</h1>
      <CollapsibleInsightsPanel title="Reviews Overview" insights={[
        { icon: Users, title: '85', description: 'Total reviews' },
        { icon: Star, title: '4.3', description: 'Avg rating' },
        { icon: TrendingUp, title: '78%', description: 'Completed' },
        { icon: Calendar, title: 'Q4 2023', description: 'Current period' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {reviews.map((review, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{review.employee}</h4>
                  <p className="text-sm text-muted-foreground">{review.department}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700">{review.rating} ⭐</Badge>
                  <Badge className={review.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {review.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Period</p><p className="font-medium">{review.period}</p></div>
                <div><p className="text-muted-foreground">Review Date</p><p className="font-medium">{review.reviewDate}</p></div>
                <div><p className="text-muted-foreground">Rating</p><p className="font-bold text-yellow-600">{review.rating}/5.0</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
