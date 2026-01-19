'use client';

/**
 * Buyer Dashboard - FreeFlow A+++ Implementation
 * Buyer overview with orders and saved services
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Clock,
  Search,
  Package,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from './order-card';
import { ListingCard } from './listing-card';
import {
  useBuyerStats,
  useServiceOrders,
  useSavedListings,
} from '@/lib/hooks/use-service-marketplace';

export function BuyerDashboard() {
  const [ordersTab, setOrdersTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const { stats, isLoading: statsLoading } = useBuyerStats();
  const { orders, isLoading: ordersLoading } = useServiceOrders({
    role: 'buyer',
    status: ordersTab,
  });
  const { listings: savedListings, isLoading: savedLoading } = useSavedListings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">
            Track your orders and manage saved services
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace">
            <Search className="h-4 w-4 mr-2" />
            Browse Services
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active Orders
            </CardDescription>
            <CardTitle className="text-3xl">{stats.activeOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Orders in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Completed
            </CardDescription>
            <CardTitle className="text-3xl">{stats.completedOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardDescription>
            <CardTitle className="text-3xl">
              ${stats.totalSpent.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Lifetime spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved Services
            </CardDescription>
            <CardTitle className="text-3xl">{stats.savedListings}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Services in wishlist
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/marketplace">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Find Services</h3>
                <p className="text-sm text-muted-foreground">Browse marketplace</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/buyer/orders">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Order History</h3>
                <p className="text-sm text-muted-foreground">View all orders</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/buyer/saved">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Saved Services</h3>
                <p className="text-sm text-muted-foreground">View wishlist</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Orders</CardTitle>
            <Link href="/buyer/orders" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={ordersTab} onValueChange={(v) => setOrdersTab(v as typeof ordersTab)}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={ordersTab} className="mt-4">
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-24" />
                    </Card>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No {ordersTab} orders</h3>
                  <p className="text-muted-foreground mb-4">
                    {ordersTab === 'active'
                      ? 'Browse the marketplace to find services'
                      : ordersTab === 'completed'
                        ? 'Your completed orders will appear here'
                        : 'Cancelled orders will appear here'}
                  </p>
                  {ordersTab === 'active' && (
                    <Button asChild>
                      <Link href="/marketplace">
                        <Search className="h-4 w-4 mr-2" />
                        Browse Services
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <OrderCard key={order.id} order={order} role="buyer" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Saved Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Saved Services ({savedListings.length})</CardTitle>
            <Link href="/buyer/saved" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {savedLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : savedListings.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved services</h3>
              <p className="text-muted-foreground mb-4">
                Save services you&apos;re interested in for later
              </p>
              <Button asChild>
                <Link href="/marketplace">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Services
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedListings.slice(0, 6).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
