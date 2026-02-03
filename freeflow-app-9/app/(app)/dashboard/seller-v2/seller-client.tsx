'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Store, Plus, Search, DollarSign, Package, TrendingUp, ShoppingCart, Users, Star } from 'lucide-react'

const products = [
  { id: 1, name: 'Premium Wireless Headphones', price: 199.99, stock: 45, sold: 234, rating: 4.5, status: 'active', category: 'Electronics' },
  { id: 2, name: 'Smart Watch Series 5', price: 299.99, stock: 12, sold: 156, rating: 4.8, status: 'low-stock', category: 'Electronics' },
  { id: 3, name: 'Organic Cotton T-Shirt', price: 29.99, stock: 0, sold: 89, rating: 4.2, status: 'out-of-stock', category: 'Apparel' },
  { id: 4, name: 'Leather Messenger Bag', price: 149.99, stock: 28, sold: 67, rating: 4.6, status: 'active', category: 'Accessories' },
  { id: 5, name: 'Portable Bluetooth Speaker', price: 79.99, stock: 56, sold: 312, rating: 4.7, status: 'active', category: 'Electronics' },
]

const orders = [
  { id: 1, orderNumber: 'ORD-2024-001', customer: 'John Smith', items: 2, total: 379.98, status: 'processing', date: '2024-02-03' },
  { id: 2, orderNumber: 'ORD-2024-002', customer: 'Sarah Chen', items: 1, total: 199.99, status: 'shipped', date: '2024-02-02' },
  { id: 3, orderNumber: 'ORD-2024-003', customer: 'Mike Johnson', items: 3, total: 509.97, status: 'delivered', date: '2024-02-01' },
  { id: 4, orderNumber: 'ORD-2024-004', customer: 'Emily Davis', items: 1, total: 79.99, status: 'processing', date: '2024-02-03' },
]

const reviews = [
  { id: 1, product: 'Premium Wireless Headphones', customer: 'Alex K.', rating: 5, comment: 'Excellent sound quality!', date: '2024-02-01' },
  { id: 2, product: 'Smart Watch Series 5', customer: 'Maria G.', rating: 4, comment: 'Great features, battery could be better', date: '2024-01-30' },
  { id: 3, product: 'Portable Bluetooth Speaker', customer: 'David P.', rating: 5, comment: 'Amazing value for money', date: '2024-01-28' },
]

export default function SellerClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    totalProducts: products.length,
    activeListings: products.filter(p => p.status === 'active').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'processing').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      'low-stock': 'bg-yellow-100 text-yellow-700',
      'out-of-stock': 'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filteredProducts = useMemo(() => products.filter(p =>
    (categoryFilter === 'all' || p.category === categoryFilter) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter])

  const insights = [
    { icon: Store, title: `${stats.totalProducts}`, description: 'Total products' },
    { icon: Package, title: `${stats.activeListings}`, description: 'Active listings' },
    { icon: DollarSign, title: `$${stats.totalRevenue.toFixed(2)}`, description: 'Revenue (Week)' },
    { icon: ShoppingCart, title: `${stats.pendingOrders}`, description: 'Pending orders' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Store className="h-8 w-8 text-primary" />Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your products and sales</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <CollapsibleInsightsPanel title="Sales Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={product.status === 'out-of-stock' ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge variant="outline" className="mt-1">{product.category}</Badge>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-bold text-lg">${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={product.stock < 15 ? 'text-red-600' : ''}>{product.stock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sold:</span>
                      <span>{product.sold} units</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
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
                  <div key={order.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{order.orderNumber}</h4>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />{order.customer}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items} items • {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                        <Button size="sm" variant="ghost" className="mt-1">View Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{review.product}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        By {review.customer} • {review.date}
                      </p>
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
