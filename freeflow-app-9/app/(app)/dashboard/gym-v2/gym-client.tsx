'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Dumbbell, Plus, Search, Users, Clock, TrendingUp, Calendar, Activity, UserCheck } from 'lucide-react'

const members = [
  { id: 1, name: 'Sarah Chen', status: 'active', joinDate: '2024-01-10', visits: 45, lastVisit: 'Today 8:00 AM' },
  { id: 2, name: 'Mike Johnson', status: 'active', joinDate: '2024-01-15', visits: 38, lastVisit: 'Yesterday 6:30 PM' },
  { id: 3, name: 'Emily Davis', status: 'inactive', joinDate: '2023-12-01', visits: 12, lastVisit: '2024-01-20' },
  { id: 4, name: 'Tom Wilson', status: 'active', joinDate: '2024-01-05', visits: 52, lastVisit: 'Today 7:00 AM' },
]

const classes = [
  { id: 1, name: 'Yoga Flow', instructor: 'Lisa Park', time: '7:00 AM', capacity: 20, enrolled: 18, day: 'Monday' },
  { id: 2, name: 'HIIT Training', instructor: 'James Brown', time: '6:00 PM', capacity: 15, enrolled: 15, day: 'Monday' },
  { id: 3, name: 'Spin Class', instructor: 'Anna Lee', time: '12:00 PM', capacity: 25, enrolled: 22, day: 'Wednesday' },
  { id: 4, name: 'Pilates', instructor: 'Maria Garcia', time: '8:00 AM', capacity: 12, enrolled: 10, day: 'Friday' },
]

const equipment = [
  { id: 1, name: 'Treadmill #1', type: 'Cardio', status: 'available', lastMaintenance: '2024-01-10' },
  { id: 2, name: 'Bike #3', type: 'Cardio', status: 'in-use', lastMaintenance: '2024-01-12' },
  { id: 3, name: 'Bench Press', type: 'Strength', status: 'available', lastMaintenance: '2024-01-08' },
  { id: 4, name: 'Rowing Machine #2', type: 'Cardio', status: 'maintenance', lastMaintenance: '2024-01-15' },
]

export default function GymClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    todayVisits: 12,
    classesThisWeek: classes.length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      available: 'bg-green-100 text-green-700',
      'in-use': 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Users, title: `${stats.totalMembers}`, description: 'Total members' },
    { icon: UserCheck, title: `${stats.activeMembers}`, description: 'Active members' },
    { icon: Activity, title: `${stats.todayVisits}`, description: 'Visits today' },
    { icon: Calendar, title: `${stats.classesThisWeek}`, description: 'Classes this week' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Dumbbell className="h-8 w-8 text-primary" />Gym & Fitness</h1>
          <p className="text-muted-foreground mt-1">Manage gym memberships and classes</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Member</Button>
      </div>

      <CollapsibleInsightsPanel title="Gym Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">Joined: {member.joinDate} • {member.visits} visits</p>
                      <p className="text-xs text-muted-foreground">Last visit: {member.lastVisit}</p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">Instructor: {cls.instructor}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />{cls.day} at {cls.time}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Enrollment</span>
                      <span>{cls.enrolled}/{cls.capacity}</span>
                    </div>
                    <Progress value={cls.enrolled/cls.capacity*100} className="h-2" />
                  </div>
                  <Button className="w-full mt-3" disabled={cls.enrolled >= cls.capacity}>
                    {cls.enrolled >= cls.capacity ? 'Class Full' : 'Book Class'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">Last maintenance: {item.lastMaintenance}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
