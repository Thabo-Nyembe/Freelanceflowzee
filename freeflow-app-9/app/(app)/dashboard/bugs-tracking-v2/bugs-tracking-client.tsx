'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Bug, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const bugs = [
  { title: 'Login timeout issue', severity: 'critical', priority: 'high', status: 'in-progress', assignee: 'John D.' },
  { title: 'UI alignment on mobile', severity: 'minor', priority: 'medium', status: 'open', assignee: 'Sarah K.' },
  { title: 'API rate limit error', severity: 'major', priority: 'high', status: 'testing', assignee: 'Mike R.' },
]

export default function BugsTrackingClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Bug className="h-8 w-8" />Bug Tracking</h1>
      <CollapsibleInsightsPanel title="Bugs Overview" insights={[
        { icon: Bug, title: '28', description: 'Total bugs' },
        { icon: AlertCircle, title: '5', description: 'Critical' },
        { icon: Clock, title: '12', description: 'In progress' },
        { icon: CheckCircle, title: '156', description: 'Resolved' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {bugs.map((bug, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{bug.title}</h4>
                <div className="flex gap-2">
                  <Badge className={
                    bug.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    bug.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>{bug.severity}</Badge>
                  <Badge className={
                    bug.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    bug.status === 'testing' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }>{bug.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Priority</p><p className="font-bold capitalize">{bug.priority}</p></div>
                <div><p className="text-muted-foreground">Assignee</p><p className="font-medium">{bug.assignee}</p></div>
                <div><p className="text-muted-foreground">Severity</p><p className="font-medium capitalize">{bug.severity}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
