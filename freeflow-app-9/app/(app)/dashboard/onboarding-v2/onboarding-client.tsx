'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserPlus, CheckCircle, Clock, Calendar, Users, BookOpen, FileText, Award } from 'lucide-react'

const onboardingCandidates = [
  { id: 1, name: 'Sarah Mitchell', role: 'Senior Developer', department: 'Engineering', startDate: '2024-02-01', progress: 85, status: 'in-progress', tasksCompleted: 17, totalTasks: 20, buddy: 'John Smith' },
  { id: 2, name: 'Michael Chen', role: 'Product Manager', department: 'Product', startDate: '2024-02-05', progress: 45, status: 'in-progress', tasksCompleted: 9, totalTasks: 20, buddy: 'Emma Wilson' },
  { id: 3, name: 'Emily Rodriguez', role: 'UX Designer', department: 'Design', startDate: '2024-02-10', progress: 100, status: 'completed', tasksCompleted: 20, totalTasks: 20, buddy: 'Alex Johnson' },
  { id: 4, name: 'David Park', role: 'Data Analyst', department: 'Analytics', startDate: '2024-02-12', progress: 30, status: 'in-progress', tasksCompleted: 6, totalTasks: 20, buddy: 'Lisa Brown' },
  { id: 5, name: 'Jessica Lee', role: 'Marketing Manager', department: 'Marketing', startDate: '2024-02-15', progress: 15, status: 'not-started', tasksCompleted: 3, totalTasks: 20, buddy: 'Mark Davis' },
]

const onboardingTasks = [
  { category: 'Pre-boarding', tasks: ['Sign employment contract', 'Complete tax forms', 'Submit emergency contacts', 'Review employee handbook'], completion: 100 },
  { category: 'Day 1', tasks: ['IT setup & equipment', 'Office tour', 'Meet the team', 'HR orientation'], completion: 75 },
  { category: 'Week 1', tasks: ['Department introduction', 'Training sessions', 'Set up accounts', 'Review goals'], completion: 60 },
  { category: 'Month 1', tasks: ['Complete training modules', 'First project assignment', '30-day check-in', 'Feedback session'], completion: 40 },
]

const upcomingStarts = [
  { name: 'Robert Williams', role: 'DevOps Engineer', date: '2024-02-20', daysUntil: 5 },
  { name: 'Amanda Taylor', role: 'Sales Executive', date: '2024-02-25', daysUntil: 10 },
  { name: 'Chris Anderson', role: 'QA Engineer', date: '2024-03-01', daysUntil: 15 },
]

export default function OnboardingClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    total: onboardingCandidates.length,
    inProgress: onboardingCandidates.filter(c => c.status === 'in-progress').length,
    completed: onboardingCandidates.filter(c => c.status === 'completed').length,
    avgProgress: Math.round(onboardingCandidates.reduce((sum, c) => sum + c.progress, 0) / onboardingCandidates.length),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'not-started': 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredCandidates = useMemo(() => {
    if (filter === 'all') return onboardingCandidates
    return onboardingCandidates.filter(c => c.status === filter)
  }, [filter])

  const insights = [
    { icon: Users, title: `${stats.total}`, description: 'Active onboarding' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.completed}`, description: 'Completed' },
    { icon: Award, title: `${stats.avgProgress}%`, description: 'Avg completion' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UserPlus className="h-8 w-8 text-primary" />Employee Onboarding</h1>
          <p className="text-muted-foreground mt-1">Manage new hire onboarding process</p>
        </div>
        <Button><UserPlus className="h-4 w-4 mr-2" />Add New Hire</Button>
      </div>

      <CollapsibleInsightsPanel title="Onboarding Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Hires</h3>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'in-progress' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('in-progress')}>In Progress</Button>
                <Button variant={filter === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`} />
                          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{candidate.name}</h4>
                          <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.department}</p>
                        </div>
                      </div>
                      {getStatusBadge(candidate.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{candidate.progress}% ({candidate.tasksCompleted}/{candidate.totalTasks} tasks)</span>
                      </div>
                      <Progress value={candidate.progress} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{candidate.startDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Onboarding Buddy</p>
                          <p className="font-medium">{candidate.buddy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                      <Button size="sm" variant="outline" className="flex-1">Send Message</Button>
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
                Upcoming Starts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingStarts.map((hire, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{hire.name}</p>
                        <p className="text-xs text-muted-foreground">{hire.role}</p>
                      </div>
                      <Badge variant="outline">{hire.daysUntil}d</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{hire.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Onboarding Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingTasks.map((task, index) => (
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
        </div>
      </div>
    </div>
  )
}
