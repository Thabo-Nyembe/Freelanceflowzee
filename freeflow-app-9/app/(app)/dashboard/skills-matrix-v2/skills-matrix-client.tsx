'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Brain, TrendingUp, Users, Star } from 'lucide-react'

const skills = [
  { skill: 'React Development', department: 'Engineering', proficiency: 85, employees: 12, trend: 'up' },
  { skill: 'Data Analysis', department: 'Analytics', proficiency: 72, employees: 8, trend: 'stable' },
  { skill: 'Project Management', department: 'Operations', proficiency: 90, employees: 15, trend: 'up' },
]

export default function SkillsMatrixClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Brain className="h-8 w-8" />Skills Matrix</h1>
      <CollapsibleInsightsPanel title="Skills Overview" insights={[
        { icon: Brain, title: '124', description: 'Total skills' },
        { icon: Users, title: '85', description: 'Employees' },
        { icon: Star, title: '78%', description: 'Avg proficiency' },
        { icon: TrendingUp, title: '12', description: 'Growing skills' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {skills.map((skill, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{skill.skill}</h4>
                  <p className="text-sm text-muted-foreground">{skill.department}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{skill.employees} employees</Badge>
                  <Badge className={skill.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {skill.trend}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Proficiency</span>
                  <span>{skill.proficiency}%</span>
                </div>
                <Progress value={skill.proficiency} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Department</p><p className="font-medium">{skill.department}</p></div>
                <div><p className="text-muted-foreground">Employees</p><p className="font-bold">{skill.employees}</p></div>
                <div><p className="text-muted-foreground">Trend</p><p className="font-medium capitalize">{skill.trend}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
