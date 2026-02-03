'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserPlus, Briefcase, Users, TrendingUp } from 'lucide-react'

const positions = [
  { title: 'Senior React Developer', department: 'Engineering', applicants: 45, interviews: 8, status: 'active', posted: '2024-01-15' },
  { title: 'Product Manager', department: 'Product', applicants: 62, interviews: 12, status: 'active', posted: '2024-01-10' },
  { title: 'UX Designer', department: 'Design', applicants: 38, interviews: 5, status: 'filled', posted: '2023-12-20' },
]

export default function RecruitmentClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><UserPlus className="h-8 w-8" />Recruitment</h1>
      <CollapsibleInsightsPanel title="Recruitment Overview" insights={[
        { icon: Briefcase, title: '24', description: 'Open positions' },
        { icon: Users, title: '342', description: 'Total applicants' },
        { icon: TrendingUp, title: '78', description: 'Interviews' },
        { icon: UserPlus, title: '12', description: 'Hired this month' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {positions.map((pos, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{pos.title}</h4>
                  <p className="text-sm text-muted-foreground">{pos.department}</p>
                </div>
                <Badge className={pos.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                  {pos.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Applicants</p><p className="font-bold text-blue-600">{pos.applicants}</p></div>
                <div><p className="text-muted-foreground">Interviews</p><p className="font-bold text-green-600">{pos.interviews}</p></div>
                <div><p className="text-muted-foreground">Posted</p><p className="font-medium">{pos.posted}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
