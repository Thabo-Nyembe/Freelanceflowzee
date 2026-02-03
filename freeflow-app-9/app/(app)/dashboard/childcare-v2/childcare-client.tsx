'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Baby, Plus, Search, Users, Clock, Heart, Calendar, User } from 'lucide-react'

const children = [
  { id: 1, name: 'Emma Chen', age: 3, parent: 'Sarah Chen', status: 'checked-in', checkIn: '8:30 AM', checkOut: null, room: 'Toddlers', allergies: 'None' },
  { id: 2, name: 'Noah Johnson', age: 4, parent: 'Mike Johnson', status: 'checked-in', checkIn: '9:00 AM', checkOut: null, room: 'Preschool', allergies: 'Peanuts' },
  { id: 3, name: 'Olivia Davis', age: 2, parent: 'Emily Davis', status: 'checked-out', checkIn: '8:00 AM', checkOut: '4:30 PM', room: 'Infants', allergies: 'None' },
  { id: 4, name: 'Liam Wilson', age: 5, parent: 'Tom Wilson', status: 'checked-in', checkIn: '7:45 AM', checkOut: null, room: 'Kindergarten', allergies: 'Dairy' },
]

const staff = [
  { id: 1, name: 'Lisa Park', role: 'Lead Teacher', room: 'Toddlers', status: 'on-duty', shift: '8:00 AM - 4:00 PM' },
  { id: 2, name: 'Anna Lee', role: 'Assistant', room: 'Preschool', status: 'on-duty', shift: '9:00 AM - 5:00 PM' },
  { id: 3, name: 'Maria Garcia', role: 'Teacher', room: 'Infants', status: 'on-break', shift: '7:00 AM - 3:00 PM' },
]

const activities = [
  { id: 1, name: 'Story Time', room: 'Toddlers', time: '10:00 AM', duration: '30 min', participants: 8 },
  { id: 2, name: 'Art & Crafts', room: 'Preschool', time: '11:00 AM', duration: '45 min', participants: 12 },
  { id: 3, name: 'Music Class', room: 'Kindergarten', time: '2:00 PM', duration: '30 min', participants: 10 },
]

export default function ChildcareClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalChildren: children.length,
    checkedIn: children.filter(c => c.status === 'checked-in').length,
    staffOnDuty: staff.filter(s => s.status === 'on-duty').length,
    activitiesToday: activities.length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'checked-in': 'bg-green-100 text-green-700',
      'checked-out': 'bg-gray-100 text-gray-700',
      'on-duty': 'bg-green-100 text-green-700',
      'on-break': 'bg-yellow-100 text-yellow-700',
      'off-duty': 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Baby, title: `${stats.totalChildren}`, description: 'Total enrolled' },
    { icon: Heart, title: `${stats.checkedIn}`, description: 'Currently here' },
    { icon: Users, title: `${stats.staffOnDuty}`, description: 'Staff on duty' },
    { icon: Calendar, title: `${stats.activitiesToday}`, description: 'Activities today' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Baby className="h-8 w-8 text-primary" />Childcare Center</h1>
          <p className="text-muted-foreground mt-1">Manage childcare enrollment and activities</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Enroll Child</Button>
      </div>

      <CollapsibleInsightsPanel title="Childcare Overview" insights={insights} defaultExpanded={true} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Children</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{child.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{child.name}</h4>
                      <p className="text-sm text-muted-foreground">Age {child.age} • Parent: {child.parent}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{child.room}</span>
                        {child.allergies !== 'None' && <Badge variant="outline" className="bg-red-50 text-red-700">Allergy: {child.allergies}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(child.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      In: {child.checkIn} {child.checkOut && `• Out: ${child.checkOut}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Staff</h3>
          <div className="space-y-2">
            {staff.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role} • {member.room}</p>
                      <p className="text-xs text-muted-foreground">{member.shift}</p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Today's Activities</h3>
          <div className="space-y-2">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-3">
                  <h4 className="font-medium">{activity.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.duration}</span>
                    <span>•</span>
                    <span>{activity.room}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.participants} participants</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
