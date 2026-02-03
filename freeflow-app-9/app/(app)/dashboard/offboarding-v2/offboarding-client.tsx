'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserMinus, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const offboarding = [
  { employee: 'Alex Johnson', department: 'Sales', lastDay: '2024-02-15', progress: 85, status: 'in-progress', tasksCompleted: 17, totalTasks: 20 },
  { employee: 'Maria Garcia', department: 'Support', lastDay: '2024-02-28', progress: 45, status: 'scheduled', tasksCompleted: 9, totalTasks: 20 },
  { employee: 'David Chen', department: 'Engineering', lastDay: '2024-01-31', progress: 100, status: 'completed', tasksCompleted: 20, totalTasks: 20 },
]

export default function OffboardingClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><UserMinus className="h-8 w-8" />Offboarding</h1>
      <CollapsibleInsightsPanel title="Offboarding Overview" insights={[
        { icon: UserMinus, title: '12', description: 'Total this year' },
        { icon: Clock, title: '3', description: 'In progress' },
        { icon: CheckCircle, title: '9', description: 'Completed' },
        { icon: AlertTriangle, title: '2', description: 'Pending' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {offboarding.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{item.employee}</h4>
                  <p className="text-sm text-muted-foreground">{item.department}</p>
                </div>
                <Badge className={
                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                  item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }>{item.status}</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress: {item.tasksCompleted}/{item.totalTasks} tasks</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Last Day</p><p className="font-medium">{item.lastDay}</p></div>
                <div><p className="text-muted-foreground">Department</p><p className="font-medium">{item.department}</p></div>
                <div><p className="text-muted-foreground">Completion</p><p className="font-bold text-blue-600">{item.progress}%</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
