'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserMinus, CheckCircle, Clock, Calendar, AlertTriangle, FileText, Key, Box } from 'lucide-react'

const offboardingCases = [
  { id: 1, name: 'John Doe', role: 'Senior Developer', department: 'Engineering', lastDay: '2024-03-01', reason: 'Resignation', progress: 85, status: 'in-progress', tasksCompleted: 17, totalTasks: 20 },
  { id: 2, name: 'Jane Smith', role: 'Product Manager', department: 'Product', lastDay: '2024-03-05', reason: 'New Opportunity', progress: 45, status: 'in-progress', tasksCompleted: 9, totalTasks: 20 },
  { id: 3, name: 'Bob Wilson', role: 'Marketing Lead', department: 'Marketing', lastDay: '2024-02-25', reason: 'Resignation', progress: 100, status: 'completed', tasksCompleted: 20, totalTasks: 20 },
  { id: 4, name: 'Alice Johnson', role: 'Designer', department: 'Design', lastDay: '2024-03-10', reason: 'Relocation', progress: 30, status: 'in-progress', tasksCompleted: 6, totalTasks: 20 },
  { id: 5, name: 'Tom Brown', role: 'DevOps Engineer', department: 'Engineering', lastDay: '2024-03-15', reason: 'Performance', progress: 15, status: 'scheduled', tasksCompleted: 3, totalTasks: 20 },
]

const offboardingTasks = [
  { category: 'Knowledge Transfer', tasks: ['Document current projects', 'Train replacement', 'Share credentials', 'Final handover'], completion: 75 },
  { category: 'IT & Access', tasks: ['Return laptop & equipment', 'Revoke system access', 'Clear email account', 'Remove from Slack'], completion: 60 },
  { category: 'HR & Admin', tasks: ['Exit interview', 'Final paycheck', 'Benefits termination', 'Return badge/keys'], completion: 80 },
  { category: 'Final Steps', tasks: ['Forward contacts', 'LinkedIn update', 'Reference letter', 'Alumni network'], completion: 40 },
]

const upcomingDepartures = [
  { name: 'Sarah Connor', role: 'Sales Manager', date: '2024-03-20', daysUntil: 15 },
  { name: 'Mike Ross', role: 'Legal Counsel', date: '2024-03-25', daysUntil: 20 },
  { name: 'Rachel Green', role: 'HR Manager', date: '2024-04-01', daysUntil: 27 },
]

const departmentImpact = [
  { department: 'Engineering', departures: 3, critical: 1 },
  { department: 'Product', departures: 2, critical: 0 },
  { department: 'Marketing', departures: 1, critical: 0 },
  { department: 'Design', departures: 1, critical: 1 },
]

export default function OffboardingClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    total: offboardingCases.length,
    inProgress: offboardingCases.filter(c => c.status === 'in-progress').length,
    completed: offboardingCases.filter(c => c.status === 'completed').length,
    avgProgress: Math.round(offboardingCases.reduce((sum, c) => sum + c.progress, 0) / offboardingCases.length),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'scheduled': 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredCases = useMemo(() => {
    if (filter === 'all') return offboardingCases
    return offboardingCases.filter(c => c.status === filter)
  }, [filter])

  const insights = [
    { icon: UserMinus, title: `${stats.total}`, description: 'Active offboarding' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.completed}`, description: 'Completed' },
    { icon: AlertTriangle, title: `${stats.avgProgress}%`, description: 'Avg completion' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UserMinus className="h-8 w-8 text-primary" />Employee Offboarding</h1>
          <p className="text-muted-foreground mt-1">Manage employee departures and transitions</p>
        </div>
        <Button><UserMinus className="h-4 w-4 mr-2" />Start Offboarding</Button>
      </div>

      <CollapsibleInsightsPanel title="Offboarding Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Departing Employees</h3>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'in-progress' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('in-progress')}>In Progress</Button>
                <Button variant={filter === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCases.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} />
                          <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.role} • {employee.department}</p>
                        </div>
                      </div>
                      {getStatusBadge(employee.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{employee.progress}% ({employee.tasksCompleted}/{employee.totalTasks} tasks)</span>
                      </div>
                      <Progress value={employee.progress} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground">Last Day</p>
                          <p className="font-medium">{employee.lastDay}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reason</p>
                          <p className="font-medium">{employee.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                      <Button size="sm" variant="outline" className="flex-1">Exit Interview</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Departures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDepartures.map((departure, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{departure.name}</p>
                        <p className="text-xs text-muted-foreground">{departure.role}</p>
                      </div>
                      <Badge variant="outline">{departure.daysUntil}d</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{departure.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Offboarding Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offboardingTasks.map((task, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">{task.category}</span>
                      <span className="text-sm text-muted-foreground">{task.completion}%</span>
                    </div>
                    <Progress value={task.completion} className="h-2 mb-2" />
                    <ul className="space-y-1">
                      {task.tasks.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Department Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentImpact.map((dept, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <p className="font-medium">{dept.department}</p>
                      <Badge variant="outline">{dept.departures} leaving</Badge>
                    </div>
                    {dept.critical > 0 && (
                      <p className="text-xs text-red-600">{dept.critical} critical role(s)</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
