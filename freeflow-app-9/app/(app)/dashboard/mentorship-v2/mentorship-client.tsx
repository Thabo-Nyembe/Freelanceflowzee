'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Users, Plus, Search, Star, Calendar, MessageSquare, Award, TrendingUp } from 'lucide-react'

const mentors = [
  { id: 1, name: 'Sarah Chen', role: 'Senior Engineer', expertise: ['Leadership', 'Technical Skills', 'Career Growth'], rating: 4.8, mentees: 5, available: true },
  { id: 2, name: 'Mike Johnson', role: 'Product Manager', expertise: ['Product Strategy', 'Stakeholder Management'], rating: 4.9, mentees: 3, available: true },
  { id: 3, name: 'Emily Davis', role: 'Design Lead', expertise: ['UX Design', 'Team Building', 'Creativity'], rating: 4.7, mentees: 4, available: false },
  { id: 4, name: 'Tom Wilson', role: 'VP Engineering', expertise: ['Architecture', 'Leadership', 'Strategy'], rating: 5.0, mentees: 2, available: true },
]

const myMentorship = {
  role: 'mentee',
  mentor: {
    name: 'Sarah Chen',
    role: 'Senior Engineer',
    since: '2024-01-15',
    sessions: 8,
    nextSession: '2024-02-10 2:00 PM',
  },
}

const sessions = [
  { id: 1, date: '2024-02-10', time: '2:00 PM', topic: 'Career Planning', type: 'upcoming', with: 'Sarah Chen' },
  { id: 2, date: '2024-01-28', time: '3:00 PM', topic: 'Technical Skills Review', type: 'completed', with: 'Sarah Chen', notes: 'Discussed Python best practices' },
  { id: 3, date: '2024-01-15', time: '2:00 PM', topic: 'Goal Setting', type: 'completed', with: 'Sarah Chen', notes: 'Set quarterly objectives' },
]

const resources = [
  { id: 1, title: 'Leadership Fundamentals', type: 'Course', duration: '4 weeks' },
  { id: 2, title: 'Effective 1-on-1 Meetings', type: 'Guide', duration: '15 min read' },
  { id: 3, title: 'Mentorship Best Practices', type: 'Article', duration: '10 min read' },
]

export default function MentorshipClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalMentors: mentors.length,
    available: mentors.filter(m => m.available).length,
    sessionsCompleted: sessions.filter(s => s.type === 'completed').length,
    upcomingSessions: sessions.filter(s => s.type === 'upcoming').length,
  }), [])

  const getSessionBadge = (type: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[type]}>{type}</Badge>
  }

  const insights = [
    { icon: Users, title: `${stats.totalMentors}`, description: 'Available mentors' },
    { icon: Calendar, title: `${stats.sessionsCompleted}`, description: 'Sessions completed' },
    { icon: TrendingUp, title: `${stats.upcomingSessions}`, description: 'Upcoming sessions' },
    { icon: Star, title: '4.8', description: 'Avg mentor rating' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8 text-primary" />Mentorship Program</h1>
          <p className="text-muted-foreground mt-1">Connect with mentors and grow your career</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Request Mentor</Button>
      </div>

      <CollapsibleInsightsPanel title="Mentorship Overview" insights={insights} defaultExpanded={true} />

      {myMentorship.role === 'mentee' && myMentorship.mentor && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">My Mentor</h3>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{myMentorship.mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{myMentorship.mentor.name}</h4>
                  <p className="text-sm text-muted-foreground">{myMentorship.mentor.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mentoring since {myMentorship.mentor.since} • {myMentorship.mentor.sessions} sessions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Next Session</p>
                <p className="text-sm">{myMentorship.mentor.nextSession}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="mentors">
        <TabsList>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search mentors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className={!mentor.available ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{mentor.name}</h4>
                      <p className="text-sm text-muted-foreground">{mentor.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{mentor.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{mentor.mentees} mentees</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-2">Expertise:</p>
                    <div className="flex gap-2 flex-wrap">
                      {mentor.expertise.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" disabled={!mentor.available}>
                    {mentor.available ? 'Request as Mentor' : 'Currently Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{session.topic}</h4>
                        {getSessionBadge(session.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">With {session.with}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {session.date} at {session.time}
                      </p>
                      {session.notes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">{session.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">{resource.type}</Badge>
                  <h4 className="font-medium mb-2">{resource.title}</h4>
                  <p className="text-sm text-muted-foreground">{resource.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
