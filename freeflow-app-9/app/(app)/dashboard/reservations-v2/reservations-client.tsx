'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Bookmark, Plus, Search, Calendar, Clock, DollarSign, Users, CheckCircle, XCircle, MoreHorizontal, MapPin } from 'lucide-react'

const reservations = [
  { id: 1, name: 'Conference Room A', guest: 'Sarah Chen', date: '2024-01-16', time: '10:00 AM - 12:00 PM', status: 'confirmed', type: 'meeting-room' },
  { id: 2, name: 'Workspace #5', guest: 'Mike Johnson', date: '2024-01-16', time: '9:00 AM - 5:00 PM', status: 'checked-in', type: 'desk' },
  { id: 3, name: 'Conference Room B', guest: 'Emily Davis', date: '2024-01-17', time: '2:00 PM - 4:00 PM', status: 'pending', type: 'meeting-room' },
  { id: 4, name: 'Parking Spot #12', guest: 'Tom Wilson', date: '2024-01-16', time: 'All Day', status: 'confirmed', type: 'parking' },
  { id: 5, name: 'Phone Booth', guest: 'Lisa Park', date: '2024-01-18', time: '11:00 AM - 11:30 AM', status: 'cancelled', type: 'phone-booth' },
]

export default function ReservationsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const stats = useMemo(() => ({
    total: reservations.length,
    today: reservations.filter(r => r.date === '2024-01-16').length,
    confirmed: reservations.filter(r => r.status === 'confirmed' || r.status === 'checked-in').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { confirmed: 'bg-blue-100 text-blue-700', 'checked-in': 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-700' }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredReservations = useMemo(() => reservations.filter(r =>
    (activeTab === 'all' || r.type === activeTab) &&
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.guest.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, activeTab])

  const insights = [
    { icon: Bookmark, title: `${stats.total}`, description: 'Total reservations' },
    { icon: Calendar, title: `${stats.today}`, description: 'Today' },
    { icon: CheckCircle, title: `${stats.confirmed}`, description: 'Confirmed' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Bookmark className="h-8 w-8 text-primary" />Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage resource reservations</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Reservation</Button>
      </div>

      <CollapsibleInsightsPanel title="Reservation Stats" insights={insights} defaultExpanded={true} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="meeting-room">Meeting Rooms</TabsTrigger>
            <TabsTrigger value="desk">Desks</TabsTrigger>
            <TabsTrigger value="parking">Parking</TabsTrigger>
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
                {filteredReservations.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-primary" /></div>
                      <div>
                        <h4 className="font-medium">{res.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" /><span>{res.guest}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" /><span>{res.date}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" /><span>{res.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(res.status)}
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
