'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Building2, Plus, Search, Users, Thermometer, Zap, Droplets, CheckCircle, AlertTriangle, Settings, MapPin } from 'lucide-react'

const facilities = [
  { id: 1, name: 'Main Office Building', type: 'Office', floors: 5, capacity: 500, occupancy: 420, status: 'operational', location: 'Downtown', utilities: { power: 85, water: 72, hvac: 90 } },
  { id: 2, name: 'Warehouse A', type: 'Warehouse', floors: 1, capacity: 50, occupancy: 35, status: 'operational', location: 'Industrial Park', utilities: { power: 65, water: 40, hvac: 55 } },
  { id: 3, name: 'Tech Hub', type: 'Office', floors: 3, capacity: 200, occupancy: 180, status: 'operational', location: 'Tech District', utilities: { power: 92, water: 68, hvac: 88 } },
  { id: 4, name: 'Conference Center', type: 'Event Space', floors: 2, capacity: 300, occupancy: 0, status: 'maintenance', location: 'Downtown', utilities: { power: 0, water: 30, hvac: 0 } },
  { id: 5, name: 'Parking Structure', type: 'Parking', floors: 4, capacity: 400, occupancy: 320, status: 'operational', location: 'Downtown', utilities: { power: 45, water: 20, hvac: 0 } },
]

export default function FacilitiesClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const stats = useMemo(() => ({
    total: facilities.length,
    operational: facilities.filter(f => f.status === 'operational').length,
    totalCapacity: facilities.reduce((sum, f) => sum + f.capacity, 0),
    totalOccupancy: facilities.reduce((sum, f) => sum + f.occupancy, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      operational: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      offline: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const types = ['all', ...new Set(facilities.map(f => f.type))]

  const filteredFacilities = useMemo(() => facilities.filter(f =>
    (typeFilter === 'all' || f.type === typeFilter) &&
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, typeFilter])

  const insights = [
    { icon: Building2, title: `${stats.total}`, description: 'Total facilities' },
    { icon: CheckCircle, title: `${stats.operational}`, description: 'Operational' },
    { icon: Users, title: `${stats.totalOccupancy}`, description: 'Total occupancy' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="h-8 w-8 text-primary" />Facilities</h1>
          <p className="text-muted-foreground mt-1">Manage buildings and facility operations</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Facility</Button>
      </div>

      <CollapsibleInsightsPanel title="Facilities Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search facilities..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {types.map(type => <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{facility.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" /><span>{facility.location}</span>
                    <span>•</span>
                    <span>{facility.type}</span>
                    <span>•</span>
                    <span>{facility.floors} floor(s)</span>
                  </div>
                </div>
                {getStatusBadge(facility.status)}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span>{facility.occupancy}/{facility.capacity} ({Math.round(facility.occupancy/facility.capacity*100)}%)</span>
                  </div>
                  <Progress value={facility.occupancy/facility.capacity*100} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{facility.utilities.power}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{facility.utilities.water}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span>{facility.utilities.hvac}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
