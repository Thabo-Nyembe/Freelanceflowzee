'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Map, Target, TrendingUp, CheckCircle } from 'lucide-react'

const roadmapItems = [
  { quarter: 'Q1 2024', initiative: 'Mobile App Launch', status: 'in-progress', completion: 75, theme: 'Mobile' },
  { quarter: 'Q2 2024', initiative: 'AI Features', status: 'planned', completion: 0, theme: 'Innovation' },
  { quarter: 'Q2 2024', initiative: 'Enterprise APIs', status: 'planned', completion: 0, theme: 'Integration' },
]

export default function RoadmapClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Map className="h-8 w-8" />Product Roadmap</h1>
      <CollapsibleInsightsPanel title="Roadmap Overview" insights={[
        { icon: Target, title: '12', description: 'Total initiatives' },
        { icon: TrendingUp, title: '5', description: 'In progress' },
        { icon: CheckCircle, title: '7', description: 'Completed' },
        { icon: Map, title: '4', description: 'Themes' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {roadmapItems.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{item.initiative}</h4>
                  <p className="text-sm text-muted-foreground">{item.quarter}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{item.theme}</Badge>
                  <Badge className={item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Completion</p><p className="font-bold">{item.completion}%</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{item.status.replace('-', ' ')}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
