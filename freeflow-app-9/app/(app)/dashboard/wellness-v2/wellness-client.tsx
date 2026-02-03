'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Heart, Plus, Search, Activity, TrendingUp, Award, Calendar, Clock, Users } from 'lucide-react'

const programs = [
  { id: 1, name: 'Meditation Sessions', category: 'Mental Health', schedule: 'Mon, Wed, Fri 8:00 AM', participants: 45, capacity: 50, instructor: 'Lisa Park' },
  { id: 2, name: 'Yoga Classes', category: 'Fitness', schedule: 'Tue, Thu 6:00 PM', participants: 38, capacity: 40, instructor: 'Anna Lee' },
  { id: 3, name: 'Nutrition Workshop', category: 'Nutrition', schedule: 'Every Saturday 10:00 AM', participants: 25, capacity: 30, instructor: 'Dr. Sarah Chen' },
  { id: 4, name: 'Stress Management', category: 'Mental Health', schedule: 'Every Thursday 5:00 PM', participants: 20, capacity: 25, instructor: 'Mike Johnson' },
]

const challenges = [
  { id: 1, name: '10K Steps Daily', type: 'fitness', duration: '30 days', participants: 120, startDate: '2024-02-01', endDate: '2024-03-02', status: 'active' },
  { id: 2, name: 'Hydration Challenge', type: 'health', duration: '14 days', participants: 85, startDate: '2024-02-10', endDate: '2024-02-24', status: 'active' },
  { id: 3, name: 'Mindful Minutes', type: 'mental', duration: '21 days', participants: 95, startDate: '2024-01-20', endDate: '2024-02-10', status: 'completed' },
]

const resources = [
  { id: 1, title: 'Mental Health First Aid Guide', type: 'article', category: 'Mental Health', views: 245 },
  { id: 2, title: 'Healthy Eating on a Budget', type: 'video', category: 'Nutrition', views: 180 },
  { id: 3, title: 'Desk Exercises for Office Workers', type: 'video', category: 'Fitness', views: 320 },
  { id: 4, title: 'Sleep Hygiene Best Practices', type: 'article', category: 'Sleep', views: 195 },
]

export default function WellnessClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalPrograms: programs.length,
    activeParticipants: programs.reduce((sum, p) => sum + p.participants, 0),
    activeChallenges: challenges.filter(c => c.status === 'active').length,
    totalResources: resources.length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      upcoming: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      article: 'bg-blue-100 text-blue-700',
      video: 'bg-purple-100 text-purple-700',
      podcast: 'bg-green-100 text-green-700',
    }
    return <Badge variant="outline" className={styles[type]}>{type}</Badge>
  }

  const insights = [
    { icon: Heart, title: `${stats.totalPrograms}`, description: 'Wellness programs' },
    { icon: Users, title: `${stats.activeParticipants}`, description: 'Active participants' },
    { icon: Award, title: `${stats.activeChallenges}`, description: 'Active challenges' },
    { icon: Activity, title: `${stats.totalResources}`, description: 'Resources available' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="h-8 w-8 text-primary" />Wellness Programs</h1>
          <p className="text-muted-foreground mt-1">Employee health and wellness initiatives</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Program</Button>
      </div>

      <CollapsibleInsightsPanel title="Wellness Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{program.name}</h4>
                      <Badge variant="outline" className="mt-1">{program.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />{program.schedule}
                    </p>
                    <p>Instructor: {program.instructor}</p>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Enrollment</span>
                      <span>{program.participants}/{program.capacity}</span>
                    </div>
                    <Progress value={program.participants/program.capacity*100} className="h-2" />
                  </div>

                  <Button className="w-full mt-3" disabled={program.participants >= program.capacity}>
                    {program.participants >= program.capacity ? 'Program Full' : 'Enroll Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{challenge.name}</h4>
                      <p className="text-sm text-muted-foreground">{challenge.duration} • {challenge.type}</p>
                    </div>
                    {getStatusBadge(challenge.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{challenge.startDate} to {challenge.endDate}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-3" disabled={challenge.status === 'completed'}>
                    {challenge.status === 'completed' ? 'Challenge Ended' : 'Join Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium flex-1">{resource.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {getTypeBadge(resource.type)}
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{resource.views} views</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
