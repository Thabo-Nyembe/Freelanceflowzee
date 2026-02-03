'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Truck, Plus, Search, Fuel, MapPin, User, Gauge, Calendar, Wrench, Settings, Navigation } from 'lucide-react'

const vehicles = [
  { id: 1, name: 'Delivery Van #1', type: 'Van', plate: 'DV-001', status: 'on-trip', driver: 'John Smith', fuel: 75, mileage: 45230, lastService: '2024-01-10', location: 'Downtown Route' },
  { id: 2, name: 'Cargo Truck #1', type: 'Truck', plate: 'CT-001', status: 'available', driver: null, fuel: 90, mileage: 82100, lastService: '2024-01-05', location: 'Depot' },
  { id: 3, name: 'Delivery Van #2', type: 'Van', plate: 'DV-002', status: 'on-trip', driver: 'Sarah Chen', fuel: 45, mileage: 38450, lastService: '2024-01-12', location: 'Suburb Route' },
  { id: 4, name: 'Executive Car #1', type: 'Sedan', plate: 'EC-001', status: 'maintenance', driver: null, fuel: 30, mileage: 25800, lastService: '2024-01-08', location: 'Service Center' },
  { id: 5, name: 'Pickup Truck #1', type: 'Pickup', plate: 'PT-001', status: 'available', driver: null, fuel: 85, mileage: 56700, lastService: '2024-01-15', location: 'Depot' },
  { id: 6, name: 'Delivery Van #3', type: 'Van', plate: 'DV-003', status: 'on-trip', driver: 'Mike Wilson', fuel: 60, mileage: 41200, lastService: '2024-01-11', location: 'Industrial Area' },
]

export default function FleetClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: vehicles.length,
    onTrip: vehicles.filter(v => v.status === 'on-trip').length,
    available: vehicles.filter(v => v.status === 'available').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'on-trip': 'bg-blue-100 text-blue-700',
      available: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getFuelColor = (fuel: number) => {
    if (fuel >= 70) return 'text-green-600'
    if (fuel >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredVehicles = useMemo(() => vehicles.filter(v =>
    (statusFilter === 'all' || v.status === statusFilter) &&
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.plate.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, statusFilter])

  const insights = [
    { icon: Truck, title: `${stats.total}`, description: 'Total vehicles' },
    { icon: Navigation, title: `${stats.onTrip}`, description: 'On trip' },
    { icon: MapPin, title: `${stats.available}`, description: 'Available' },
    { icon: Wrench, title: `${stats.maintenance}`, description: 'Maintenance' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Truck className="h-8 w-8 text-primary" />Fleet Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage company vehicles</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>
      </div>

      <CollapsibleInsightsPanel title="Fleet Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vehicles..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="on-trip">On Trip</option>
          <option value="available">Available</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{vehicle.name}</h4>
                  <p className="text-sm text-muted-foreground">{vehicle.type} • {vehicle.plate}</p>
                </div>
                {getStatusBadge(vehicle.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.location}</span>
                </div>

                {vehicle.driver && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicle.driver}</span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1"><Fuel className="h-4 w-4" />Fuel</span>
                    <span className={getFuelColor(vehicle.fuel)}>{vehicle.fuel}%</span>
                  </div>
                  <Progress value={vehicle.fuel} className="h-2" />
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{vehicle.mileage.toLocaleString()} km</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{vehicle.lastService}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">Track</Button>
                <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
