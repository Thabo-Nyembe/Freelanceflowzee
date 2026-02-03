'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Building2, Plus, Search, Phone, Mail, MapPin, Star, Package, DollarSign, MoreHorizontal } from 'lucide-react'

const suppliers = [
  { id: 1, name: 'TechParts Inc', contact: 'John Smith', email: 'john@techparts.com', phone: '+1 555-0123', location: 'New York, USA', category: 'Electronics', rating: 4.8, orders: 156, totalSpend: 245000, status: 'active' },
  { id: 2, name: 'GlobalSupply Co', contact: 'Sarah Lee', email: 'sarah@globalsupply.com', phone: '+1 555-0456', location: 'Los Angeles, USA', category: 'Components', rating: 4.5, orders: 89, totalSpend: 178000, status: 'active' },
  { id: 3, name: 'QuickShip Ltd', contact: 'Mike Chen', email: 'mike@quickship.com', phone: '+1 555-0789', location: 'Chicago, USA', category: 'Logistics', rating: 4.2, orders: 234, totalSpend: 89000, status: 'active' },
  { id: 4, name: 'RawMaterials Corp', contact: 'Emily Davis', email: 'emily@rawmat.com', phone: '+1 555-0147', location: 'Houston, USA', category: 'Materials', rating: 4.6, orders: 67, totalSpend: 456000, status: 'inactive' },
  { id: 5, name: 'PackagePro', contact: 'Tom Wilson', email: 'tom@packagepro.com', phone: '+1 555-0258', location: 'Seattle, USA', category: 'Packaging', rating: 4.9, orders: 312, totalSpend: 67000, status: 'active' },
]

export default function SuppliersClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    totalSpend: suppliers.reduce((sum, s) => sum + s.totalSpend, 0),
    avgRating: (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1),
  }), [])

  const filteredSuppliers = useMemo(() => suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery])

  const insights = [
    { icon: Building2, title: `${stats.total}`, description: 'Total suppliers' },
    { icon: DollarSign, title: `$${(stats.totalSpend / 1000).toFixed(0)}K`, description: 'Total spend' },
    { icon: Star, title: `${stats.avgRating}`, description: 'Avg rating' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Suppliers
          </h1>
          <p className="text-muted-foreground mt-1">Manage your supplier relationships</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
      </div>

      <CollapsibleInsightsPanel title="Supplier Overview" insights={insights} defaultExpanded={true} />

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search suppliers..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12"><AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <h4 className="font-semibold">{supplier.name}</h4>
                    <Badge variant="secondary">{supplier.category}</Badge>
                  </div>
                </div>
                <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{supplier.status}</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{supplier.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{supplier.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{supplier.location}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /><span className="font-medium">{supplier.rating}</span></div>
                <div className="flex items-center gap-1"><Package className="h-4 w-4 text-muted-foreground" /><span>{supplier.orders} orders</span></div>
                <span className="font-bold text-green-600">${(supplier.totalSpend / 1000).toFixed(0)}K</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
