'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Car, Plus, Search, Clock, CheckCircle, XCircle, MapPin, User, Ticket, Settings } from 'lucide-react'

const parkingSpots = [
  { id: 1, spot: 'A-101', level: 'Level 1', type: 'standard', status: 'occupied', vehicle: 'ABC 123', occupant: 'Sarah Chen', since: '8:30 AM' },
  { id: 2, spot: 'A-102', level: 'Level 1', type: 'standard', status: 'available', vehicle: null, occupant: null, since: null },
  { id: 3, spot: 'B-201', level: 'Level 2', type: 'reserved', status: 'occupied', vehicle: 'XYZ 789', occupant: 'Mike Johnson', since: '7:45 AM' },
  { id: 4, spot: 'B-202', level: 'Level 2', type: 'ev-charging', status: 'occupied', vehicle: 'EV 456', occupant: 'Emily Davis', since: '9:15 AM' },
  { id: 5, spot: 'C-301', level: 'Level 3', type: 'handicap', status: 'available', vehicle: null, occupant: null, since: null },
  { id: 6, spot: 'C-302', level: 'Level 3', type: 'visitor', status: 'occupied', vehicle: 'VIS 001', occupant: 'Guest - John Smith', since: '10:00 AM' },
  { id: 7, spot: 'D-401', level: 'Level 4', type: 'standard', status: 'maintenance', vehicle: null, occupant: null, since: null },
  { id: 8, spot: 'D-402', level: 'Level 4', type: 'standard', status: 'available', vehicle: null, occupant: null, since: null },
]

const levels = [
  { name: 'Level 1', total: 50, occupied: 42 },
  { name: 'Level 2', total: 50, occupied: 48 },
  { name: 'Level 3', total: 40, occupied: 25 },
  { name: 'Level 4', total: 40, occupied: 30 },
]

export default function ParkingClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const stats = useMemo(() => ({
    total: parkingSpots.length,
    available: parkingSpots.filter(p => p.status === 'available').length,
    occupied: parkingSpots.filter(p => p.status === 'occupied').length,
    occupancyRate: Math.round(parkingSpots.filter(p => p.status === 'occupied').length / parkingSpots.length * 100),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-700',
      occupied: 'bg-red-100 text-red-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      standard: 'bg-gray-100 text-gray-700',
      reserved: 'bg-blue-100 text-blue-700',
      'ev-charging': 'bg-green-100 text-green-700',
      handicap: 'bg-purple-100 text-purple-700',
      visitor: 'bg-orange-100 text-orange-700',
    }
    return <Badge variant="outline" className={styles[type]}>{type.replace('-', ' ')}</Badge>
  }

  const filteredSpots = useMemo(() => parkingSpots.filter(p =>
    (levelFilter === 'all' || p.level === levelFilter) &&
    (p.spot.toLowerCase().includes(searchQuery.toLowerCase()) || (p.occupant && p.occupant.toLowerCase().includes(searchQuery.toLowerCase())))
  ), [searchQuery, levelFilter])

  const insights = [
    { icon: Car, title: `${stats.total}`, description: 'Total spots' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available' },
    { icon: XCircle, title: `${stats.occupied}`, description: 'Occupied' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Car className="h-8 w-8 text-primary" />Parking</h1>
          <p className="text-muted-foreground mt-1">Manage parking spots and reservations</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Reserve Spot</Button>
      </div>

      <CollapsibleInsightsPanel title="Parking Overview" insights={insights} defaultExpanded={true} />

      {/* Level Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {levels.map((level) => (
          <Card key={level.name}>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">{level.name}</h4>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Occupancy</span>
                <span>{level.occupied}/{level.total}</span>
              </div>
              <Progress value={level.occupied/level.total*100} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search spots or occupants..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="all">All Levels</option>
          {levels.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSpots.map((spot) => (
          <Card key={spot.id} className={`hover:shadow-md transition-shadow ${spot.status === 'available' ? 'border-green-200' : spot.status === 'occupied' ? 'border-red-200' : 'border-yellow-200'}`}>
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg mb-1">{spot.spot}</div>
              <div className="text-xs text-muted-foreground mb-2">{spot.level}</div>
              {getStatusBadge(spot.status)}
              <div className="mt-2">{getTypeBadge(spot.type)}</div>
              {spot.vehicle && (
                <div className="mt-2 text-xs">
                  <p className="font-mono">{spot.vehicle}</p>
                  <p className="text-muted-foreground truncate">{spot.occupant}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
