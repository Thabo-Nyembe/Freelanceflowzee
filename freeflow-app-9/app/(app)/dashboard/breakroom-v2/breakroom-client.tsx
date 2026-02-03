'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Coffee, MapPin, Users, Calendar, CheckCircle, Package, Utensils } from 'lucide-react'

const breakrooms = [
  { id: 1, name: '2nd Floor Break Room', capacity: 15, currentOccupancy: 8, amenities: ['Coffee Machine', 'Microwave', 'Fridge', 'Sink'], status: 'available' },
  { id: 2, name: '3rd Floor Lounge', capacity: 20, currentOccupancy: 18, amenities: ['Coffee Machine', 'Vending Machine', 'TV', 'Couch'], status: 'busy' },
  { id: 3, name: '1st Floor Cafeteria', capacity: 50, currentOccupancy: 12, amenities: ['Kitchen', 'Tables', 'Fridge', 'Coffee Bar'], status: 'available' },
  { id: 4, name: '4th Floor Commons', capacity: 25, currentOccupancy: 5, amenities: ['Microwave', 'Fridge', 'Sink', 'Games Area'], status: 'available' },
]

const supplies = [
  { id: 1, item: 'Coffee Pods', stock: 45, threshold: 20, status: 'good' },
  { id: 2, item: 'Paper Cups', stock: 150, threshold: 50, status: 'good' },
  { id: 3, item: 'Sugar Packets', stock: 12, threshold: 20, status: 'low' },
  { id: 4, item: 'Creamer', stock: 8, threshold: 10, status: 'low' },
  { id: 5, item: 'Paper Towels', stock: 25, threshold: 15, status: 'good' },
  { id: 6, item: 'Dish Soap', stock: 3, threshold: 5, status: 'low' },
]

const bookings = [
  { id: 1, room: '3rd Floor Lounge', team: 'Marketing', purpose: 'Team Lunch', time: '12:00 PM - 1:00 PM', date: '2024-02-10' },
  { id: 2, room: '1st Floor Cafeteria', team: 'Engineering', purpose: 'Birthday Celebration', time: '3:00 PM - 4:00 PM', date: '2024-02-12' },
  { id: 3, room: '4th Floor Commons', team: 'Sales', purpose: 'Game Night', time: '5:00 PM - 7:00 PM', date: '2024-02-15' },
]

export default function BreakroomClient() {
  const stats = useMemo(() => ({
    totalRooms: breakrooms.length,
    available: breakrooms.filter(r => r.status === 'available').length,
    totalCapacity: breakrooms.reduce((sum, r) => sum + r.capacity, 0),
    lowSupplies: supplies.filter(s => s.status === 'low').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-700',
      busy: 'bg-yellow-100 text-yellow-700',
      maintenance: 'bg-red-100 text-red-700',
      good: 'bg-green-100 text-green-700',
      low: 'bg-yellow-100 text-yellow-700',
      out: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Coffee, title: `${stats.totalRooms}`, description: 'Break rooms' },
    { icon: Users, title: `${stats.totalCapacity}`, description: 'Total capacity' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available now' },
    { icon: Package, title: `${stats.lowSupplies}`, description: 'Low supplies' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Coffee className="h-8 w-8 text-primary" />Break Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage break room facilities and supplies</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Break Room Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="supplies">Supplies</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakrooms.map((room) => (
              <Card key={room.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{room.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />Capacity: {room.capacity} people
                      </p>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Current Occupancy</span>
                      <span>{room.currentOccupancy}/{room.capacity}</span>
                    </div>
                    <Progress value={room.currentOccupancy/room.capacity*100} className="h-2" />
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-2">Amenities:</p>
                    <div className="flex gap-2 flex-wrap">
                      {room.amenities.map((amenity, idx) => (
                        <Badge key={idx} variant="outline">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supplies" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {supplies.map((supply) => (
                  <div key={supply.id} className={`p-4 hover:bg-muted/50 ${supply.status === 'low' ? 'bg-yellow-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{supply.item}</h4>
                        <p className="text-sm text-muted-foreground">
                          Stock: {supply.stock} • Threshold: {supply.threshold}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(supply.status)}
                        {supply.status === 'low' && (
                          <Button size="sm" variant="outline" className="mt-2">Reorder</Button>
                        )}
                      </div>
                    </div>
                    <Progress value={supply.stock/supply.threshold*100} className="h-1 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{booking.purpose}</h4>
                      <p className="text-sm text-muted-foreground">{booking.team}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{booking.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{booking.date}
                        </span>
                        <span>{booking.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
