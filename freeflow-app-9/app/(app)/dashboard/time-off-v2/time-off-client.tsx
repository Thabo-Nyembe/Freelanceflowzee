'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  CalendarDays, Umbrella, Plane, Heart, Users, Clock, CheckCircle,
  XCircle, MoreHorizontal, Plus, TrendingUp, AlertCircle, Sun,
  Coffee, Baby, Briefcase
} from 'lucide-react'

const leaveRequests = [
  {
    id: 1,
    employee: 'John Smith',
    avatar: '/avatars/john.jpg',
    type: 'vacation',
    startDate: '2024-01-22',
    endDate: '2024-01-26',
    days: 5,
    status: 'pending',
    reason: 'Family vacation',
    department: 'Engineering'
  },
  {
    id: 2,
    employee: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    type: 'sick',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    days: 1,
    status: 'approved',
    reason: 'Medical appointment',
    department: 'Marketing'
  },
  {
    id: 3,
    employee: 'Mike Chen',
    avatar: '/avatars/mike.jpg',
    type: 'personal',
    startDate: '2024-01-18',
    endDate: '2024-01-19',
    days: 2,
    status: 'approved',
    reason: 'Personal matters',
    department: 'Design'
  },
  {
    id: 4,
    employee: 'Emily Davis',
    avatar: '/avatars/emily.jpg',
    type: 'vacation',
    startDate: '2024-02-01',
    endDate: '2024-02-14',
    days: 10,
    status: 'pending',
    reason: 'Extended holiday',
    department: 'Sales'
  },
  {
    id: 5,
    employee: 'Tom Wilson',
    avatar: '/avatars/tom.jpg',
    type: 'parental',
    startDate: '2024-01-29',
    endDate: '2024-03-29',
    days: 60,
    status: 'approved',
    reason: 'Parental leave',
    department: 'Operations'
  },
]

const myBalance = {
  vacation: { total: 20, used: 8, pending: 5 },
  sick: { total: 10, used: 2, pending: 0 },
  personal: { total: 5, used: 1, pending: 0 },
}

const upcomingOOO = [
  { name: 'John Smith', dates: 'Jan 22-26', type: 'Vacation' },
  { name: 'Tom Wilson', dates: 'Jan 29 - Mar 29', type: 'Parental' },
  { name: 'Emily Davis', dates: 'Feb 1-14', type: 'Vacation' },
]

export default function TimeOffClient() {
  const [activeTab, setActiveTab] = useState('requests')
  const [date, setDate] = useState<Date | undefined>(new Date())

  const stats = useMemo(() => ({
    pendingRequests: leaveRequests.filter(r => r.status === 'pending').length,
    approvedThisMonth: leaveRequests.filter(r => r.status === 'approved').length,
    teamOOO: upcomingOOO.length,
    availablePTO: myBalance.vacation.total - myBalance.vacation.used - myBalance.vacation.pending
  }), [])

  const getTypeBadge = (type: string) => {
    const styles = {
      vacation: { bg: 'bg-blue-100 text-blue-700', icon: Plane },
      sick: { bg: 'bg-red-100 text-red-700', icon: Heart },
      personal: { bg: 'bg-purple-100 text-purple-700', icon: Coffee },
      parental: { bg: 'bg-green-100 text-green-700', icon: Baby },
      bereavement: { bg: 'bg-gray-100 text-gray-700', icon: Heart },
    }
    const config = styles[type as keyof typeof styles] || styles.personal
    return (
      <Badge variant="outline" className={config.bg}>
        <config.icon className="h-3 w-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const insights = [
    { icon: CalendarDays, title: `${stats.availablePTO} Days`, description: 'PTO available' },
    { icon: Clock, title: `${stats.pendingRequests} Pending`, description: 'Requests to review' },
    { icon: Users, title: `${stats.teamOOO} Team OOO`, description: 'Upcoming absences' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Umbrella className="h-8 w-8 text-primary" />
            Time Off
          </h1>
          <p className="text-muted-foreground mt-1">Manage PTO, sick leave, and time off requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Time Off
        </Button>
      </div>

      <CollapsibleInsightsPanel
        title="Time Off Overview"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(myBalance).map(([type, balance]) => {
          const icons = { vacation: Plane, sick: Heart, personal: Coffee }
          const colors = { vacation: 'blue', sick: 'red', personal: 'purple' }
          const Icon = icons[type as keyof typeof icons]
          const color = colors[type as keyof typeof colors]
          const available = balance.total - balance.used - balance.pending

          return (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{type}</p>
                      <p className="text-sm text-muted-foreground">{balance.total} days total</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{available}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {balance.used}</span>
                    <span>Pending: {balance.pending}</span>
                  </div>
                  <Progress value={(balance.used / balance.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="team">Team Calendar</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                  <CardDescription>Manage time off requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaveRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{request.employee.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{request.employee}</p>
                              {getTypeBadge(request.type)}
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-medium">{request.startDate} - {request.endDate}</p>
                            <p className="text-sm text-muted-foreground">{request.days} day(s)</p>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Availability</CardTitle>
                  <CardDescription>View team members' time off schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingOOO.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{member.dates}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Time Off Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Vacation Policy', description: '20 days annual PTO, accrued monthly' },
                    { title: 'Sick Leave Policy', description: '10 days sick leave, no carryover' },
                    { title: 'Parental Leave', description: 'Up to 12 weeks paid leave' },
                    { title: 'Bereavement Leave', description: 'Up to 5 days for immediate family' },
                  ].map((policy, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{policy.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Time Off</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingOOO.slice(0, 3).map((ooo, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ooo.name}</p>
                      <p className="text-xs text-muted-foreground">{ooo.dates}</p>
                    </div>
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
