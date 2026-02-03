'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UtensilsCrossed, Plus, Search, Clock, DollarSign, Users, TrendingUp, Star, ShoppingCart } from 'lucide-react'

const menuItems = [
  { id: 1, name: 'Grilled Chicken Sandwich', category: 'Main Course', price: 8.99, availability: 'available', rating: 4.5, orders: 45 },
  { id: 2, name: 'Caesar Salad', category: 'Salad', price: 6.99, availability: 'available', rating: 4.2, orders: 32 },
  { id: 3, name: 'Vegetable Pasta', category: 'Main Course', price: 9.99, availability: 'sold-out', rating: 4.7, orders: 0 },
  { id: 4, name: 'Fresh Fruit Bowl', category: 'Dessert', price: 4.99, availability: 'available', rating: 4.8, orders: 28 },
  { id: 5, name: 'Coffee', category: 'Beverage', price: 2.99, availability: 'available', rating: 4.3, orders: 67 },
  { id: 6, name: 'Club Sandwich', category: 'Main Course', price: 7.99, availability: 'available', rating: 4.4, orders: 38 },
]

const orders = [
  { id: 1, employee: 'Sarah Chen', items: ['Grilled Chicken Sandwich', 'Coffee'], total: 11.98, time: '12:30 PM', status: 'completed' },
  { id: 2, employee: 'Mike Johnson', items: ['Caesar Salad', 'Fresh Fruit Bowl'], total: 11.98, time: '12:45 PM', status: 'preparing' },
  { id: 3, employee: 'Emily Davis', items: ['Club Sandwich', 'Coffee'], total: 10.98, time: '1:00 PM', status: 'pending' },
]

export default function CafeteriaClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    todayOrders: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
    popularItem: menuItems.reduce((max, item) => item.orders > max.orders ? item : max, menuItems[0]),
  }), [])

  const getAvailabilityBadge = (availability: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-700',
      'sold-out': 'bg-red-100 text-red-700',
      'coming-soon': 'bg-blue-100 text-blue-700',
    }
    return <Badge className={styles[availability]}>{availability.replace('-', ' ')}</Badge>
  }

  const getOrderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const categories = ['all', ...new Set(menuItems.map(m => m.category))]

  const filteredMenu = useMemo(() => menuItems.filter(m =>
    (categoryFilter === 'all' || m.category === categoryFilter) &&
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter])

  const insights = [
    { icon: ShoppingCart, title: `${stats.todayOrders}`, description: "Today's orders" },
    { icon: DollarSign, title: `$${stats.revenue.toFixed(2)}`, description: "Today's revenue" },
    { icon: TrendingUp, title: `$${stats.avgOrderValue.toFixed(2)}`, description: 'Avg order value' },
    { icon: Star, title: stats.popularItem.name, description: 'Most popular' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UtensilsCrossed className="h-8 w-8 text-primary" />Cafeteria</h1>
          <p className="text-muted-foreground mt-1">Manage cafeteria menu and orders</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Menu Item</Button>
      </div>

      <CollapsibleInsightsPanel title="Cafeteria Stats" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="menu">
        <TabsList>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search menu..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    {getAvailabilityBadge(item.availability)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${item.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.orders} orders today</p>
                  </div>
                  <Button className="w-full mt-3" disabled={item.availability === 'sold-out'}>
                    {item.availability === 'sold-out' ? 'Sold Out' : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div>
                      <h4 className="font-medium">{order.employee}</h4>
                      <p className="text-sm text-muted-foreground">{order.items.join(', ')}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{order.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">${order.total.toFixed(2)}</span>
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
