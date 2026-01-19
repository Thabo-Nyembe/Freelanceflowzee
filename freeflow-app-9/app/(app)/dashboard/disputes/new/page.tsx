/**
 * New Dispute Page - FreeFlow A+++ Implementation
 * Create a new dispute for an order
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateDisputeForm } from '@/components/disputes';

interface OrderDetails {
  id: string;
  package_name: string;
  total: number;
  currency: string;
}

function NewDisputeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required to open a dispute');
      setLoading(false);
      return;
    }

    // Fetch order details
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrder({
          id: data.order.id,
          package_name: data.order.package_name || 'Order',
          total: data.order.total,
          currency: data.order.currency || 'USD',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-semibold mb-2">Cannot Open Dispute</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'Order information is required to open a dispute.'}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Open a Dispute</h1>
          <p className="text-muted-foreground">
            Report an issue with your order
          </p>
        </div>
      </div>

      <CreateDisputeForm
        orderId={order.id}
        orderTotal={order.total}
        orderTitle={order.package_name}
        currency={order.currency}
        onSuccess={(disputeId) => {
          router.push(`/dashboard/disputes/${disputeId}`);
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function NewDisputePage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <NewDisputeContent />
      </Suspense>
    </div>
  );
}
