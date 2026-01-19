'use client';

/**
 * Seller Dashboard - FreeFlow A+++ Implementation
 * Complete seller overview with stats, orders, and listings
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  Star,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from './order-card';
import { ListingCard } from './listing-card';
import {
  useSellerProfile,
  useSellerStats,
  useMyListings,
  useServiceOrders,
  SELLER_LEVELS,
} from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';

export function SellerDashboard() {
  const [ordersTab, setOrdersTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const { profile, isLoading: profileLoading } = useSellerProfile();
  const { stats, isLoading: statsLoading } = useSellerStats();
  const { listings, isLoading: listingsLoading } = useMyListings();
  const { orders, isLoading: ordersLoading } = useServiceOrders({
    role: 'seller',
    status: ordersTab,
  });

  const levelInfo = profile ? SELLER_LEVELS[profile.level] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your services and track your performance
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Gig
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Available Balance
            </CardDescription>
            <CardTitle className="text-3xl">
              ${stats.availableBalance.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              ${stats.pendingClearance.toLocaleString()} pending clearance
            </p>
          </CardContent>
        </Card>

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
              {stats.completedOrders} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating
            </CardDescription>
            <CardTitle className="text-3xl">
              {stats.averageRating.toFixed(1)}
              <span className="text-lg text-muted-foreground">/{stats.totalReviews}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= Math.round(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Response Rate
            </CardDescription>
            <CardTitle className="text-3xl">{stats.responseRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.onTimeDelivery}% on-time delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {profile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {levelInfo?.label}
                  {profile.is_pro && <Badge className="bg-green-500">PRO</Badge>}
                </CardTitle>
                <CardDescription>
                  {profile.level_progress}% progress to next level
                </CardDescription>
              </div>
              <Link href="/seller/level" className="text-sm text-primary hover:underline">
                View Level Details
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={profile.level_progress} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Current: {levelInfo?.label}</span>
              <span>
                Next: {profile.level === 'top_rated' ? 'PRO' :
                  profile.level === 'level_2' ? 'Top Rated' :
                  profile.level === 'level_1' ? 'Level 2' : 'Level 1'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/seller/analytics">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">View detailed stats</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/seller/profile">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Edit Profile</h3>
                <p className="text-sm text-muted-foreground">Update your info</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/seller/earnings">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Earnings</h3>
                <p className="text-sm text-muted-foreground">Manage payouts</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <Link href="/seller/orders" className="text-sm text-primary hover:underline">
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
                <div className="text-center py-8 text-muted-foreground">
                  No {ordersTab} orders
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <OrderCard key={order.id} order={order} role="seller" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Gigs ({listings.length})</CardTitle>
            <Link href="/seller/listings" className="text-sm text-primary hover:underline">
              Manage All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {listingsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No gigs yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first gig to start selling
              </p>
              <Button asChild>
                <Link href="/seller/listings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Gig
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 6).map(listing => (
                <ListingCard key={listing.id} listing={listing} showSeller={false} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
