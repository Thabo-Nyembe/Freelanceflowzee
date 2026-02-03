'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { CalendarCheck, Plus, Search, Clock, MapPin, Users, Video, Phone, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'

const appointments = [
  { id: 1, title: 'Project Kickoff', client: 'TechCorp', type: 'video', date: '2024-01-16', time: '10:00 AM', duration: '1 hour', status: 'confirmed', attendees: ['Sarah', 'Mike', 'Emily'] },
  { id: 2, title: 'Design Review', client: 'StartupXYZ', type: 'in-person', date: '2024-01-16', time: '2:00 PM', duration: '30 min', status: 'pending', attendees: ['Tom'] },
  { id: 3, title: 'Sales Demo', client: 'GlobalCo', type: 'video', date: '2024-01-17', time: '11:00 AM', duration: '45 min', status: 'confirmed', attendees: ['Lisa', 'James'] },
  { id: 4, title: 'Client Check-in', client: 'DataFlow', type: 'phone', date: '2024-01-17', time: '3:30 PM', duration: '15 min', status: 'confirmed', attendees: ['Sarah'] },
  { id: 5, title: 'Strategy Meeting', client: 'Internal', type: 'in-person', date: '2024-01-18', time: '9:00 AM', duration: '2 hours', status: 'cancelled', attendees: ['All Team'] },
]

export default function AppointmentsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')

  const stats = useMemo(() => ({
    total: appointments.length,
    today: appointments.filter(a => a.date === '2024-01-16').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
  }), [])

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = { video: Video, phone: Phone, 'in-person': Users }
    return icons[type] || Users
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-700' }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredAppointments = useMemo(() => appointments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.client.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery])

  const insights = [
    { icon: CalendarCheck, title: `${stats.total}`, description: 'Total appointments' },
    { icon: Clock, title: `${stats.today}`, description: 'Today' },
    { icon: CheckCircle, title: `${stats.confirmed}`, description: 'Confirmed' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><CalendarCheck className="h-8 w-8 text-primary" />Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your scheduled meetings</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Appointment</Button>
      </div>

      <CollapsibleInsightsPanel title="Appointment Stats" insights={insights} defaultExpanded={true} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredAppointments.map((apt) => {
                  const TypeIcon = getTypeIcon(apt.type)
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><TypeIcon className="h-5 w-5 text-primary" /></div>
                        <div>
                          <h4 className="font-medium">{apt.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{apt.client}</span>
                            <span>•</span>
                            <span>{apt.date} at {apt.time}</span>
                            <span>•</span>
                            <span>{apt.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {apt.attendees.slice(0, 3).map((a, i) => <Avatar key={i} className="h-6 w-6 border-2 border-white"><AvatarFallback className="text-xs">{a[0]}</AvatarFallback></Avatar>)}
                        </div>
                        {getStatusBadge(apt.status)}
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
