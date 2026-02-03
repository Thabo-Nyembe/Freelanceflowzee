'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Laptop, Plus, Search, Wrench, CheckCircle, AlertTriangle, XCircle, Calendar, User, Settings, Package } from 'lucide-react'

const equipment = [
  { id: 1, name: 'MacBook Pro 16"', category: 'Laptop', serialNumber: 'MBP-2024-001', status: 'assigned', assignedTo: 'Sarah Chen', condition: 'excellent', purchaseDate: '2024-01-15', warranty: '2027-01-15' },
  { id: 2, name: 'Dell Monitor 27"', category: 'Monitor', serialNumber: 'DEL-2024-045', status: 'available', assignedTo: null, condition: 'good', purchaseDate: '2023-06-20', warranty: '2026-06-20' },
  { id: 3, name: 'iPhone 15 Pro', category: 'Mobile', serialNumber: 'IPH-2024-012', status: 'assigned', assignedTo: 'Mike Johnson', condition: 'excellent', purchaseDate: '2024-02-10', warranty: '2025-02-10' },
  { id: 4, name: 'Standing Desk', category: 'Furniture', serialNumber: 'DSK-2023-089', status: 'maintenance', assignedTo: 'Tom Wilson', condition: 'needs repair', purchaseDate: '2023-03-15', warranty: '2028-03-15' },
  { id: 5, name: 'Projector Epson', category: 'AV Equipment', serialNumber: 'PRJ-2022-005', status: 'available', assignedTo: null, condition: 'good', purchaseDate: '2022-11-01', warranty: '2025-11-01' },
  { id: 6, name: 'Webcam Logitech', category: 'Accessories', serialNumber: 'WEB-2024-078', status: 'retired', assignedTo: null, condition: 'poor', purchaseDate: '2021-01-20', warranty: 'Expired' },
]

export default function EquipmentClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    total: equipment.length,
    assigned: equipment.filter(e => e.status === 'assigned').length,
    available: equipment.filter(e => e.status === 'available').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-700',
      available: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      retired: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      excellent: 'bg-green-100 text-green-700',
      good: 'bg-blue-100 text-blue-700',
      'needs repair': 'bg-yellow-100 text-yellow-700',
      poor: 'bg-red-100 text-red-700',
    }
    return <Badge variant="outline" className={styles[condition]}>{condition}</Badge>
  }

  const categories = ['all', ...new Set(equipment.map(e => e.category))]

  const filteredEquipment = useMemo(() => equipment.filter(e =>
    (categoryFilter === 'all' || e.category === categoryFilter) &&
    (e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, categoryFilter])

  const insights = [
    { icon: Package, title: `${stats.total}`, description: 'Total equipment' },
    { icon: User, title: `${stats.assigned}`, description: 'Assigned' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available' },
    { icon: Wrench, title: `${stats.maintenance}`, description: 'In maintenance' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Laptop className="h-8 w-8 text-primary" />Equipment</h1>
          <p className="text-muted-foreground mt-1">Manage company equipment and assets</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Equipment</Button>
      </div>

      <CollapsibleInsightsPanel title="Equipment Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serial:</span>
                  <span className="font-mono">{item.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  {getConditionBadge(item.condition)}
                </div>
                {item.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span>{item.assignedTo}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warranty:</span>
                  <span>{item.warranty}</span>
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
