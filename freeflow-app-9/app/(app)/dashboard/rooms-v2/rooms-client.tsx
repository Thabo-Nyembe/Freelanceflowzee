'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { DoorOpen, Plus, Search, Users, Monitor, Wifi, Coffee, Video, CheckCircle, Clock, Settings } from 'lucide-react'

const rooms = [
  { id: 1, name: 'Conference Room A', capacity: 12, status: 'available', floor: '1st Floor', amenities: ['video', 'whiteboard', 'screen'], currentBooking: null },
  { id: 2, name: 'Meeting Room 1', capacity: 6, status: 'occupied', floor: '1st Floor', amenities: ['video', 'screen'], currentBooking: { title: 'Team Sync', until: '11:00 AM' } },
  { id: 3, name: 'Conference Room B', capacity: 20, status: 'available', floor: '2nd Floor', amenities: ['video', 'whiteboard', 'screen', 'audio'], currentBooking: null },
  { id: 4, name: 'Huddle Space', capacity: 4, status: 'occupied', floor: '1st Floor', amenities: ['screen'], currentBooking: { title: 'Client Call', until: '10:30 AM' } },
  { id: 5, name: 'Board Room', capacity: 16, status: 'maintenance', floor: '3rd Floor', amenities: ['video', 'whiteboard', 'screen', 'audio', 'catering'], currentBooking: null },
  { id: 6, name: 'Phone Booth 1', capacity: 1, status: 'available', floor: '1st Floor', amenities: ['screen'], currentBooking: null },
]

export default function RoomsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('all')

  const stats = useMemo(() => ({
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { available: 'bg-green-100 text-green-700', occupied: 'bg-red-100 text-red-700', maintenance: 'bg-yellow-100 text-yellow-700' }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredRooms = useMemo(() => rooms.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (capacityFilter === 'all' || (capacityFilter === 'small' && r.capacity <= 4) || (capacityFilter === 'medium' && r.capacity > 4 && r.capacity <= 10) || (capacityFilter === 'large' && r.capacity > 10))
  ), [searchQuery, capacityFilter])

  const insights = [
    { icon: DoorOpen, title: `${stats.total}`, description: 'Total rooms' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available' },
    { icon: Clock, title: `${stats.occupied}`, description: 'Occupied' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><DoorOpen className="h-8 w-8 text-primary" />Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage meeting rooms and spaces</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Room</Button>
      </div>

      <CollapsibleInsightsPanel title="Room Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)}>
          <option value="all">All Sizes</option>
          <option value="small">Small (1-4)</option>
          <option value="medium">Medium (5-10)</option>
          <option value="large">Large (10+)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{room.name}</h4>
                  <p className="text-sm text-muted-foreground">{room.floor}</p>
                </div>
                {getStatusBadge(room.status)}
              </div>
              {room.currentBooking && (
                <div className="p-2 rounded bg-red-50 text-red-700 text-sm mb-3">
                  <p className="font-medium">{room.currentBooking.title}</p>
                  <p className="text-xs">Until {room.currentBooking.until}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Users className="h-4 w-4" /><span>Capacity: {room.capacity}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {room.amenities.map(a => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" disabled={room.status !== 'available'}>Book Now</Button>
                <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
