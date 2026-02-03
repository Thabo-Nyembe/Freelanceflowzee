'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Archive, Plus, Search, Package, MapPin, User, Calendar, HardDrive } from 'lucide-react'

const storageUnits = [
  { id: 1, unit: 'A-101', location: 'Warehouse A', size: 'Small', status: 'occupied', assignedTo: 'IT Department', items: 'Old computers, cables', occupancy: 85 },
  { id: 2, unit: 'A-102', location: 'Warehouse A', size: 'Medium', status: 'available', assignedTo: null, items: null, occupancy: 0 },
  { id: 3, unit: 'B-201', location: 'Warehouse B', size: 'Large', status: 'occupied', assignedTo: 'Marketing Team', items: 'Event materials, banners', occupancy: 60 },
  { id: 4, unit: 'B-202', location: 'Warehouse B', size: 'Small', status: 'occupied', assignedTo: 'Finance Team', items: 'Archived documents', occupancy: 95 },
  { id: 5, unit: 'C-301', location: 'Warehouse C', size: 'Large', status: 'available', assignedTo: null, items: null, occupancy: 0 },
  { id: 6, unit: 'C-302', location: 'Warehouse C', size: 'Medium', status: 'maintenance', assignedTo: null, items: null, occupancy: 0 },
]

const inventory = [
  { id: 1, item: 'Office Chairs (50 units)', location: 'A-101', category: 'Furniture', addedDate: '2024-01-15', condition: 'Good' },
  { id: 2, item: 'Laptops - Old Models (25 units)', location: 'A-101', category: 'Electronics', addedDate: '2024-01-10', condition: 'Fair' },
  { id: 3, item: 'Marketing Banners', location: 'B-201', category: 'Materials', addedDate: '2023-12-20', condition: 'Excellent' },
  { id: 4, item: 'Financial Records 2020-2022', location: 'B-202', category: 'Documents', addedDate: '2023-01-05', condition: 'Good' },
]

export default function StorageClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')

  const stats = useMemo(() => ({
    totalUnits: storageUnits.length,
    occupied: storageUnits.filter(u => u.status === 'occupied').length,
    available: storageUnits.filter(u => u.status === 'available').length,
    totalItems: inventory.length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      occupied: 'bg-blue-100 text-blue-700',
      available: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getSizeBadge = (size: string) => {
    const styles: Record<string, string> = {
      Small: 'bg-blue-100 text-blue-700',
      Medium: 'bg-purple-100 text-purple-700',
      Large: 'bg-orange-100 text-orange-700',
    }
    return <Badge variant="outline" className={styles[size]}>{size}</Badge>
  }

  const locations = ['all', ...new Set(storageUnits.map(u => u.location))]

  const filteredUnits = useMemo(() => storageUnits.filter(u =>
    (locationFilter === 'all' || u.location === locationFilter) &&
    (u.unit.toLowerCase().includes(searchQuery.toLowerCase()) || (u.assignedTo && u.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())))
  ), [searchQuery, locationFilter])

  const insights = [
    { icon: Archive, title: `${stats.totalUnits}`, description: 'Storage units' },
    { icon: Package, title: `${stats.occupied}`, description: 'Units occupied' },
    { icon: HardDrive, title: `${stats.available}`, description: 'Units available' },
    { icon: Package, title: `${stats.totalItems}`, description: 'Inventory items' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Archive className="h-8 w-8 text-primary" />Storage & Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage storage units and inventory</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Request Storage</Button>
      </div>

      <CollapsibleInsightsPanel title="Storage Overview" insights={insights} defaultExpanded={true} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Storage Units</h3>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search units..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 py-2" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            {locations.map(loc => <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className={`hover:shadow-md transition-shadow ${unit.status === 'available' ? 'border-green-200' : unit.status === 'occupied' ? 'border-blue-200' : 'border-yellow-200'}`}>
              <CardContent className="p-3 text-center">
                <div className="font-bold text-lg mb-1">{unit.unit}</div>
                <div className="text-xs text-muted-foreground mb-2">{unit.location}</div>
                {getStatusBadge(unit.status)}
                <div className="mt-2">{getSizeBadge(unit.size)}</div>

                {unit.assignedTo && (
                  <div className="mt-3 text-xs">
                    <p className="font-medium text-muted-foreground">Assigned to:</p>
                    <p className="truncate">{unit.assignedTo}</p>
                    {unit.items && <p className="text-muted-foreground mt-1 truncate">{unit.items}</p>}

                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Occupancy</span>
                        <span>{unit.occupancy}%</span>
                      </div>
                      <Progress value={unit.occupancy} className="h-1" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Inventory</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {inventory.map((item) => (
                <div key={item.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.item}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">{item.condition}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />Unit {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />Added {item.addedDate}
                    </span>
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
