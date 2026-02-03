'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Bus, Plus, Search, MapPin, Clock, Users, Navigation, CheckCircle } from 'lucide-react'

const shuttles = [
  { id: 1, route: 'Downtown Loop', number: 'S-01', status: 'active', capacity: 15, passengers: 12, driver: 'John Smith', eta: '5 min', currentStop: 'Main Office' },
  { id: 2, route: 'Tech Park Route', number: 'S-02', status: 'active', capacity: 20, passengers: 8, driver: 'Sarah Lee', eta: '12 min', currentStop: 'Station A' },
  { id: 3, route: 'Airport Express', number: 'S-03', status: 'inactive', capacity: 12, passengers: 0, driver: null, eta: null, currentStop: 'Depot' },
  { id: 4, route: 'Campus Route', number: 'S-04', status: 'active', capacity: 18, passengers: 15, driver: 'Mike Chen', eta: '8 min', currentStop: 'West Gate' },
]

const routes = [
  { id: 1, name: 'Downtown Loop', stops: 8, duration: '45 min', frequency: 'Every 30 min', active: true },
  { id: 2, name: 'Tech Park Route', stops: 6, duration: '30 min', frequency: 'Every 20 min', active: true },
  { id: 3, name: 'Airport Express', stops: 4, duration: '60 min', frequency: 'Every 2 hours', active: false },
  { id: 4, name: 'Campus Route', stops: 10, duration: '50 min', frequency: 'Every 15 min', active: true },
]

const bookings = [
  { id: 1, passenger: 'Sarah Chen', route: 'Downtown Loop', pickup: 'Main Office', dropoff: 'Station 5', time: '9:00 AM', status: 'confirmed' },
  { id: 2, passenger: 'Mike Johnson', route: 'Airport Express', pickup: 'Office', dropoff: 'Airport', time: '2:00 PM', status: 'pending' },
  { id: 3, passenger: 'Emily Davis', route: 'Tech Park Route', pickup: 'Station A', dropoff: 'Tech Hub', time: '10:30 AM', status: 'completed' },
]

export default function ShuttleClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalShuttles: shuttles.length,
    activeShuttles: shuttles.filter(s => s.status === 'active').length,
    totalPassengers: shuttles.reduce((sum, s) => sum + s.passengers, 0),
    todayBookings: bookings.length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Bus, title: `${stats.totalShuttles}`, description: 'Total shuttles' },
    { icon: Navigation, title: `${stats.activeShuttles}`, description: 'Active now' },
    { icon: Users, title: `${stats.totalPassengers}`, description: 'Current passengers' },
    { icon: CheckCircle, title: `${stats.todayBookings}`, description: "Today's bookings" },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Bus className="h-8 w-8 text-primary" />Shuttle Service</h1>
          <p className="text-muted-foreground mt-1">Track shuttles and manage bookings</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Book Shuttle</Button>
      </div>

      <CollapsibleInsightsPanel title="Shuttle Overview" insights={insights} defaultExpanded={true} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Active Shuttles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuttles.map((shuttle) => (
            <Card key={shuttle.id} className={`${shuttle.status === 'active' ? 'border-green-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{shuttle.route}</h4>
                    <p className="text-sm text-muted-foreground">Shuttle {shuttle.number}</p>
                  </div>
                  {getStatusBadge(shuttle.status)}
                </div>

                {shuttle.status === 'active' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Capacity</span>
                        <span>{shuttle.passengers}/{shuttle.capacity} passengers</span>
                      </div>
                      <Progress value={shuttle.passengers/shuttle.capacity*100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{shuttle.currentStop}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>ETA: {shuttle.eta}</span>
                      </div>
                    </div>

                    {shuttle.driver && (
                      <p className="text-sm text-muted-foreground">Driver: {shuttle.driver}</p>
                    )}
                  </div>
                )}

                {shuttle.status === 'inactive' && (
                  <p className="text-sm text-muted-foreground">Currently at {shuttle.currentStop}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Routes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{route.name}</h4>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>{route.stops} stops • {route.duration}</p>
                      <p>Frequency: {route.frequency}</p>
                    </div>
                  </div>
                  {getStatusBadge(route.active ? 'active' : 'inactive')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">{booking.passenger}</h4>
                    <p className="text-sm text-muted-foreground">{booking.route}</p>
                    <p className="text-xs text-muted-foreground">{booking.pickup} → {booking.dropoff}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{booking.time}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
