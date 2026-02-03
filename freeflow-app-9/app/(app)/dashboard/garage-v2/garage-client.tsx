'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Wrench, Plus, Search, Car, Calendar, Clock, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react'

const vehicles = [
  { id: 1, name: 'Company Van #1', plate: 'CV-001', type: 'Van', status: 'operational', nextService: '2024-03-15', mileage: 45200, lastService: '2024-01-15' },
  { id: 2, name: 'Delivery Truck #1', plate: 'DT-001', type: 'Truck', status: 'in-service', nextService: '2024-02-10', mileage: 82100, lastService: '2024-01-05' },
  { id: 3, name: 'Executive Car #1', plate: 'EC-001', type: 'Sedan', status: 'operational', nextService: '2024-04-01', mileage: 25800, lastService: '2024-01-20' },
]

const serviceRecords = [
  { id: 1, vehicle: 'Company Van #1', service: 'Oil Change & Inspection', date: '2024-01-15', cost: 120, mechanic: 'Auto Shop A', status: 'completed' },
  { id: 2, vehicle: 'Delivery Truck #1', service: 'Brake Replacement', date: '2024-02-10', cost: 450, mechanic: 'Auto Shop B', status: 'in-progress' },
  { id: 3, vehicle: 'Executive Car #1', service: 'Tire Rotation', date: '2024-01-20', cost: 80, mechanic: 'Auto Shop A', status: 'completed' },
]

const maintenanceSchedule = [
  { id: 1, vehicle: 'Company Van #1', service: 'Regular Maintenance', dueDate: '2024-03-15', status: 'upcoming' },
  { id: 2, vehicle: 'Delivery Truck #1', service: 'Tire Replacement', dueDate: '2024-02-20', status: 'overdue' },
  { id: 3, vehicle: 'Executive Car #1', service: 'Oil Change', dueDate: '2024-04-01', status: 'upcoming' },
]

export default function GarageClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalVehicles: vehicles.length,
    operational: vehicles.filter(v => v.status === 'operational').length,
    inService: vehicles.filter(v => v.status === 'in-service').length,
    totalCost: serviceRecords.reduce((sum, r) => sum + r.cost, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      operational: 'bg-green-100 text-green-700',
      'in-service': 'bg-yellow-100 text-yellow-700',
      'out-of-service': 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      scheduled: 'bg-gray-100 text-gray-700',
      upcoming: 'bg-blue-100 text-blue-700',
      overdue: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Car, title: `${stats.totalVehicles}`, description: 'Fleet vehicles' },
    { icon: CheckCircle, title: `${stats.operational}`, description: 'Operational' },
    { icon: Wrench, title: `${stats.inService}`, description: 'In service' },
    { icon: DollarSign, title: `$${stats.totalCost}`, description: 'Maintenance cost (YTD)' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Wrench className="h-8 w-8 text-primary" />Garage & Maintenance</h1>
          <p className="text-muted-foreground mt-1">Manage vehicle maintenance and service</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Schedule Service</Button>
      </div>

      <CollapsibleInsightsPanel title="Garage Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="vehicles">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="service">Service Records</TabsTrigger>
          <TabsTrigger value="schedule">Maintenance Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vehicles..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{vehicle.name}</h4>
                      <p className="text-sm text-muted-foreground">{vehicle.type} • {vehicle.plate}</p>
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mileage:</span>
                      <span>{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Service:</span>
                      <span>{vehicle.lastService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Service:</span>
                      <span>{vehicle.nextService}</span>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full mt-3">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {serviceRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{record.service}</h4>
                          {getStatusBadge(record.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{record.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${record.cost}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{record.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wrench className="h-3 w-3" />{record.mechanic}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <div className="space-y-3">
            {maintenanceSchedule.map((item) => (
              <Card key={item.id} className={item.status === 'overdue' ? 'border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.service}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.vehicle}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />Due: {item.dueDate}
                      </p>
                    </div>
                    {item.status === 'overdue' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
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
