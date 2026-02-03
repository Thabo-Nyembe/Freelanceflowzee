'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Lock, Plus, Search, CheckCircle, XCircle, User, Key, MapPin, Settings } from 'lucide-react'

const lockers = [
  { id: 1, number: 'L-101', floor: '1st Floor', section: 'A', status: 'occupied', assignedTo: 'Sarah Chen', assignedDate: '2024-01-15', size: 'small' },
  { id: 2, number: 'L-102', floor: '1st Floor', section: 'A', status: 'available', assignedTo: null, assignedDate: null, size: 'small' },
  { id: 3, number: 'L-201', floor: '2nd Floor', section: 'B', status: 'occupied', assignedTo: 'Mike Johnson', assignedDate: '2024-01-10', size: 'medium' },
  { id: 4, number: 'L-202', floor: '2nd Floor', section: 'B', status: 'available', assignedTo: null, assignedDate: null, size: 'medium' },
  { id: 5, number: 'L-301', floor: '3rd Floor', section: 'C', status: 'maintenance', assignedTo: null, assignedDate: null, size: 'large' },
  { id: 6, number: 'L-302', floor: '3rd Floor', section: 'C', status: 'occupied', assignedTo: 'Emily Davis', assignedDate: '2024-01-20', size: 'large' },
  { id: 7, number: 'L-103', floor: '1st Floor', section: 'A', status: 'available', assignedTo: null, assignedDate: null, size: 'small' },
  { id: 8, number: 'L-203', floor: '2nd Floor', section: 'B', status: 'occupied', assignedTo: 'Tom Wilson', assignedDate: '2024-01-12', size: 'medium' },
]

export default function LockersClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')

  const stats = useMemo(() => ({
    total: lockers.length,
    available: lockers.filter(l => l.status === 'available').length,
    occupied: lockers.filter(l => l.status === 'occupied').length,
    maintenance: lockers.filter(l => l.status === 'maintenance').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-700',
      occupied: 'bg-red-100 text-red-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getSizeBadge = (size: string) => {
    const styles: Record<string, string> = {
      small: 'bg-blue-100 text-blue-700',
      medium: 'bg-purple-100 text-purple-700',
      large: 'bg-orange-100 text-orange-700',
    }
    return <Badge variant="outline" className={styles[size]}>{size}</Badge>
  }

  const floors = ['all', ...new Set(lockers.map(l => l.floor))]

  const filteredLockers = useMemo(() => lockers.filter(l =>
    (floorFilter === 'all' || l.floor === floorFilter) &&
    (l.number.toLowerCase().includes(searchQuery.toLowerCase()) || (l.assignedTo && l.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())))
  ), [searchQuery, floorFilter])

  const insights = [
    { icon: Lock, title: `${stats.total}`, description: 'Total lockers' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available' },
    { icon: XCircle, title: `${stats.occupied}`, description: 'Occupied' },
    { icon: Settings, title: `${stats.maintenance}`, description: 'Maintenance' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Lock className="h-8 w-8 text-primary" />Lockers</h1>
          <p className="text-muted-foreground mt-1">Manage employee locker assignments</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Assign Locker</Button>
      </div>

      <CollapsibleInsightsPanel title="Locker Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search lockers..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
          {floors.map(floor => <option key={floor} value={floor}>{floor === 'all' ? 'All Floors' : floor}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredLockers.map((locker) => (
          <Card key={locker.id} className={`hover:shadow-md transition-shadow ${locker.status === 'available' ? 'border-green-200' : locker.status === 'occupied' ? 'border-red-200' : 'border-yellow-200'}`}>
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg mb-1">{locker.number}</div>
              <div className="text-xs text-muted-foreground mb-2">
                <p>{locker.floor}</p>
                <p>Section {locker.section}</p>
              </div>
              {getStatusBadge(locker.status)}
              <div className="mt-2">{getSizeBadge(locker.size)}</div>
              {locker.assignedTo && (
                <div className="mt-2 text-xs">
                  <p className="flex items-center justify-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{locker.assignedTo}</span>
                  </p>
                  <p className="text-muted-foreground">{locker.assignedDate}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
