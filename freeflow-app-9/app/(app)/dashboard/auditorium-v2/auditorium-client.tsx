'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Theater, Plus, Search, Users, Clock, Calendar, Settings, CheckCircle } from 'lucide-react'

const bookings = [
  { id: 1, event: 'All-Hands Meeting', organizer: 'Leadership Team', date: '2024-02-10', time: '10:00 AM - 12:00 PM', attendees: 250, setup: 'Theater', status: 'confirmed', equipment: ['Projector', 'Microphone', 'Sound System'] },
  { id: 2, event: 'Product Launch', organizer: 'Marketing Team', date: '2024-02-15', time: '2:00 PM - 5:00 PM', attendees: 180, setup: 'Presentation', status: 'confirmed', equipment: ['Projector', 'Stage Lighting', 'Sound System'] },
  { id: 3, event: 'Training Workshop', organizer: 'HR Team', date: '2024-02-20', time: '9:00 AM - 4:00 PM', attendees: 120, setup: 'Classroom', status: 'pending', equipment: ['Projector', 'Whiteboard'] },
  { id: 4, event: 'Town Hall Q&A', organizer: 'Executive Team', date: '2024-02-08', time: '3:00 PM - 4:30 PM', attendees: 300, setup: 'Theater', status: 'confirmed', equipment: ['Projector', 'Microphone', 'Sound System', 'Recording'] },
]

const equipment = [
  { id: 1, name: 'Projector', status: 'available', lastMaintenance: '2024-01-15' },
  { id: 2, name: 'Sound System', status: 'available', lastMaintenance: '2024-01-20' },
  { id: 3, name: 'Stage Lighting', status: 'available', lastMaintenance: '2024-01-10' },
  { id: 4, name: 'Microphone (Wireless)', status: 'in-use', lastMaintenance: '2024-01-25' },
  { id: 5, name: 'Recording Equipment', status: 'available', lastMaintenance: '2024-01-18' },
]

const layouts = [
  { id: 1, name: 'Theater', capacity: 300, description: 'Rows facing stage' },
  { id: 2, name: 'Classroom', capacity: 150, description: 'Tables and chairs' },
  { id: 3, name: 'Presentation', capacity: 200, description: 'Open floor with stage' },
  { id: 4, name: 'Banquet', capacity: 180, description: 'Round tables' },
]

export default function AuditoriumClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed').length,
    capacity: 300,
    availableEquipment: equipment.filter(e => e.status === 'available').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      available: 'bg-green-100 text-green-700',
      'in-use': 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Theater, title: `${stats.totalBookings}`, description: 'Total bookings' },
    { icon: CheckCircle, title: `${stats.upcoming}`, description: 'Confirmed' },
    { icon: Users, title: `${stats.capacity}`, description: 'Max capacity' },
    { icon: Settings, title: `${stats.availableEquipment}`, description: 'Equipment ready' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Theater className="h-8 w-8 text-primary" />Auditorium</h1>
          <p className="text-muted-foreground mt-1">Manage auditorium bookings and equipment</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Book Auditorium</Button>
      </div>

      <CollapsibleInsightsPanel title="Auditorium Overview" insights={insights} defaultExpanded={true} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Upcoming Bookings</h3>
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{booking.event}</h4>
                    <p className="text-sm text-muted-foreground">Organized by {booking.organizer}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Date & Time</span>
                    </div>
                    <p>{booking.date}</p>
                    <p>{booking.time}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span>Expected Attendees</span>
                    </div>
                    <p>{booking.attendees} people</p>
                    <Progress value={booking.attendees/300*100} className="h-1 mt-1" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Settings className="h-4 w-4" />
                      <span>Setup</span>
                    </div>
                    <p>{booking.setup}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Equipment Needed:</p>
                  <div className="flex gap-2 flex-wrap">
                    {booking.equipment.map((eq, idx) => (
                      <Badge key={idx} variant="outline">{eq}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Layouts</h3>
          <div className="space-y-2">
            {layouts.map((layout) => (
              <Card key={layout.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{layout.name}</h4>
                      <p className="text-xs text-muted-foreground">{layout.description}</p>
                    </div>
                    <Badge variant="outline">{layout.capacity} seats</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Equipment Status</h3>
          <div className="space-y-2">
            {equipment.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">Last maintenance: {item.lastMaintenance}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
