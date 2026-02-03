'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Users, Briefcase, TrendingUp, Calendar, CheckCircle, Clock, FileText, Target } from 'lucide-react'

const openPositions = [
  { id: 1, title: 'Senior Full Stack Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', applicants: 45, interviews: 8, offers: 2, status: 'active', postedDate: '2024-01-15' },
  { id: 2, title: 'Product Manager', department: 'Product', location: 'New York', type: 'Full-time', applicants: 62, interviews: 12, offers: 1, status: 'active', postedDate: '2024-01-20' },
  { id: 3, title: 'UX/UI Designer', department: 'Design', location: 'San Francisco', type: 'Full-time', applicants: 38, interviews: 6, offers: 0, status: 'active', postedDate: '2024-02-01' },
  { id: 4, title: 'Data Analyst', department: 'Analytics', location: 'Remote', type: 'Contract', applicants: 28, interviews: 5, offers: 1, status: 'active', postedDate: '2024-02-05' },
  { id: 5, title: 'DevOps Engineer', department: 'Engineering', location: 'Austin', type: 'Full-time', applicants: 55, interviews: 10, offers: 3, status: 'filled', postedDate: '2024-01-10' },
]

const candidates = [
  { name: 'Alice Johnson', position: 'Senior Developer', stage: 'Final Interview', score: 4.5, experience: '8 years' },
  { name: 'Bob Smith', position: 'Product Manager', stage: 'Technical Interview', score: 4.2, experience: '6 years' },
  { name: 'Carol White', position: 'UX Designer', stage: 'Phone Screen', score: 4.0, experience: '5 years' },
  { name: 'David Lee', position: 'Data Analyst', stage: 'Offer Extended', score: 4.8, experience: '4 years' },
]

const recruitmentMetrics = [
  { metric: 'Time to Hire', value: '28 days', trend: 'down', change: '-5 days' },
  { metric: 'Offer Acceptance Rate', value: '85%', trend: 'up', change: '+10%' },
  { metric: 'Cost per Hire', value: '$4,200', trend: 'down', change: '-$300' },
  { metric: 'Quality of Hire', value: '4.3/5', trend: 'up', change: '+0.3' },
]

const upcomingInterviews = [
  { candidate: 'Emma Wilson', position: 'Senior Developer', date: '2024-03-05', time: '10:00 AM', interviewer: 'John Smith' },
  { candidate: 'Michael Brown', position: 'Product Manager', date: '2024-03-06', time: '2:00 PM', interviewer: 'Sarah Johnson' },
  { candidate: 'Lisa Davis', position: 'UX Designer', date: '2024-03-07', time: '11:00 AM', interviewer: 'Alex Chen' },
]

const sourcingChannels = [
  { channel: 'LinkedIn', applications: 180, hires: 8, color: 'bg-blue-100 text-blue-700' },
  { channel: 'Indeed', applications: 145, hires: 6, color: 'bg-green-100 text-green-700' },
  { channel: 'Referrals', applications: 45, hires: 12, color: 'bg-purple-100 text-purple-700' },
  { channel: 'Company Website', applications: 90, hires: 4, color: 'bg-orange-100 text-orange-700' },
]

export default function RecruitmentClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    totalPositions: openPositions.length,
    activePositions: openPositions.filter(p => p.status === 'active').length,
    totalApplicants: openPositions.reduce((sum, p) => sum + p.applicants, 0),
    totalOffers: openPositions.reduce((sum, p) => sum + p.offers, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-green-100 text-green-700',
      'filled': 'bg-blue-100 text-blue-700',
      'paused': 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredPositions = useMemo(() => {
    if (filter === 'all') return openPositions
    return openPositions.filter(p => p.status === filter)
  }, [filter])

  const insights = [
    { icon: Briefcase, title: `${stats.totalPositions}`, description: 'Open positions' },
    { icon: Users, title: `${stats.totalApplicants}`, description: 'Total applicants' },
    { icon: Target, title: `${stats.activePositions}`, description: 'Active hiring' },
    { icon: CheckCircle, title: `${stats.totalOffers}`, description: 'Offers extended' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Briefcase className="h-8 w-8 text-primary" />Recruitment Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage job postings and candidate pipeline</p>
        </div>
        <Button><Briefcase className="h-4 w-4 mr-2" />Post New Job</Button>
      </div>

      <CollapsibleInsightsPanel title="Recruitment Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sourcingChannels.map((channel) => (
          <Card key={channel.channel} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Badge className={channel.color}>{channel.channel}</Badge>
              <p className="text-2xl font-bold mt-2">{channel.applications}</p>
              <p className="text-xs text-muted-foreground">{channel.hires} hires</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Open Positions</h3>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('active')}>Active</Button>
                <Button variant={filter === 'filled' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('filled')}>Filled</Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredPositions.map((position) => (
                <Card key={position.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{position.title}</h4>
                        <p className="text-sm text-muted-foreground">{position.department} • {position.location} • {position.type}</p>
                      </div>
                      {getStatusBadge(position.status)}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Applicants</p>
                        <p className="font-medium text-lg">{position.applicants}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Interviews</p>
                        <p className="font-medium text-lg text-blue-600">{position.interviews}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Offers</p>
                        <p className="font-medium text-lg text-green-600">{position.offers}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Posted</p>
                        <p className="font-medium text-sm">{position.postedDate}</p>
                      </div>
                    </div>

                    <Progress value={(position.interviews / position.applicants) * 100} className="h-2 mb-3" />

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">View Candidates</Button>
                      <Button size="sm" className="flex-1">Schedule Interview</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`} />
                          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm">{candidate.name}</h4>
                          <p className="text-xs text-muted-foreground">{candidate.position}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{candidate.stage}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Experience: {candidate.experience}</span>
                      <span className="font-medium">Score: {candidate.score}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingInterviews.map((interview, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-medium text-sm">{interview.candidate}</p>
                        <p className="text-xs text-muted-foreground">{interview.position}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{interview.date} at {interview.time}</p>
                    <p className="text-xs text-muted-foreground">With: {interview.interviewer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recruitmentMetrics.map((metric, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium">{metric.metric}</p>
                      <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                        {metric.change}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">{metric.value}</p>
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
