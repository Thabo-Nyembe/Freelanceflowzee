'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { List, AlertCircle, TrendingUp, Archive } from 'lucide-react'

const features = [
  { title: 'Dark Mode Support', priority: 'high', points: 8, status: 'ready', category: 'UX' },
  { title: 'Real-time Notifications', priority: 'high', points: 13, status: 'in-development', category: 'Features' },
  { title: 'Advanced Search', priority: 'medium', points: 5, status: 'backlog', category: 'Features' },
  { title: 'Export to PDF', priority: 'low', points: 3, status: 'backlog', category: 'Tools' },
]

export default function FeaturesBacklogClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><List className="h-8 w-8" />Features Backlog</h1>
      <CollapsibleInsightsPanel title="Backlog Overview" insights={[
        { icon: List, title: '47', description: 'Total features' },
        { icon: AlertCircle, title: '12', description: 'High priority' },
        { icon: TrendingUp, title: '8', description: 'In development' },
        { icon: Archive, title: '89', description: 'Story points' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {features.map((f, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{f.title}</h4>
                <div className="flex gap-2">
                  <Badge className={
                    f.priority === 'high' ? 'bg-red-100 text-red-700' :
                    f.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }>{f.priority}</Badge>
                  <Badge>{f.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Story Points</p><p className="font-bold">{f.points}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{f.category}</p></div>
                <div><p className="text-muted-foreground">Priority</p><p className="font-medium capitalize">{f.priority}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
