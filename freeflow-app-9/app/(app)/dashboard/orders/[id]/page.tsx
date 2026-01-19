'use client';

/**
 * Order Detail Page - FreeFlow A+++ Implementation
 * View and manage individual order
 */

import { useParams } from 'next/navigation';
import { OrderDetail } from '@/components/marketplace';
import { useServiceOrder } from '@/lib/hooks/use-service-marketplace';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const { order, isLoading, refresh } = useServiceOrder(orderId);

  // Determine user role (in real app, compare with auth user)
  const role = order?.buyer_id ? 'buyer' : 'seller';

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <Card>
          <CardContent className="h-40" />
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="h-60" /></Card>
            <Card><CardContent className="h-60" /></Card>
          </div>
          <div className="space-y-6">
            <Card><CardContent className="h-60" /></Card>
            <Card><CardContent className="h-40" /></Card>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground">
              This order does not exist or you don&apos;t have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <OrderDetail
        order={order}
        role={role}
        onRefresh={refresh}
      />
    </div>
  );
}
