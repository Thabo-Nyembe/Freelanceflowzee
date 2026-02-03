'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Sparkles, Plus, Search, Clock, CheckCircle, AlertCircle, User, Calendar, MessageSquare } from 'lucide-react'

const requests = [
  { id: 1, employee: 'Sarah Chen', service: 'Restaurant Reservation', details: 'Table for 4 at The Grill, 7:00 PM', status: 'completed', priority: 'normal', created: '2024-02-01 10:00 AM', completed: '2024-02-01 10:30 AM' },
  { id: 2, employee: 'Mike Johnson', service: 'Event Tickets', details: 'Concert tickets for Feb 15', status: 'in-progress', priority: 'high', created: '2024-02-01 11:30 AM', completed: null },
  { id: 3, employee: 'Emily Davis', service: 'Travel Arrangements', details: 'Flight and hotel for NYC trip', status: 'pending', priority: 'urgent', created: '2024-02-01 2:00 PM', completed: null },
  { id: 4, employee: 'Tom Wilson', service: 'Package Delivery', details: 'Pickup dry cleaning', status: 'in-progress', priority: 'normal', created: '2024-02-01 9:00 AM', completed: null },
]

const services = [
  { id: 1, name: 'Restaurant Reservations', description: 'Book tables at top restaurants', icon: '🍽️', available: true },
  { id: 2, name: 'Event Tickets', description: 'Concert, sports, theater tickets', icon: '🎫', available: true },
  { id: 3, name: 'Travel Planning', description: 'Flights, hotels, car rentals', icon: '✈️', available: true },
  { id: 4, name: 'Package Services', description: 'Pickup and delivery', icon: '📦', available: true },
  { id: 5, name: 'Personal Shopping', description: 'Gift and personal shopping', icon: '🛍️', available: true },
  { id: 6, name: 'Home Services', description: 'Cleaning, repairs, maintenance', icon: '🏠', available: false },
]

export default function ConciergeClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalRequests: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      normal: 'bg-gray-100 text-gray-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    }
    return <Badge variant="outline" className={styles[priority]}>{priority}</Badge>
  }

  const insights = [
    { icon: MessageSquare, title: `${stats.totalRequests}`, description: 'Total requests' },
    { icon: Clock, title: `${stats.pending}`, description: 'Pending' },
    { icon: AlertCircle, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.completed}`, description: 'Completed' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-8 w-8 text-primary" />Concierge Services</h1>
          <p className="text-muted-foreground mt-1">Request personal assistance and services</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Request</Button>
      </div>

      <CollapsibleInsightsPanel title="Service Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="services">Available Services</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{request.service}</h4>
                          {getPriorityBadge(request.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">{request.details}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />{request.employee}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />Created: {request.created}
                      </span>
                      {request.completed && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />Completed: {request.completed}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className={`hover:shadow-md transition-shadow ${!service.available ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h4 className="font-semibold mb-2">{service.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <Button className="w-full" disabled={!service.available}>
                    {service.available ? 'Request Service' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
