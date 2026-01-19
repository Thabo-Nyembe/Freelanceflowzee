'use client';

/**
 * Order Card - FreeFlow A+++ Implementation
 * Display order summary for lists
 */

import Link from 'next/link';
import Image from 'next/image';
import { Clock, MessageSquare, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ServiceOrder, ORDER_STATUSES } from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: ServiceOrder;
  role: 'buyer' | 'seller';
}

export function OrderCard({ order, role }: OrderCardProps) {
  const statusInfo = ORDER_STATUSES[order.status];
  const otherParty = role === 'buyer' ? order.seller : order.buyer;
  const dueDate = new Date(order.current_due_date);
  const isOverdue = dueDate < new Date() && !['completed', 'cancelled', 'refunded'].includes(order.status);

  // Calculate progress
  const getProgress = () => {
    switch (order.status) {
      case 'pending': return 10;
      case 'requirements_submitted': return 25;
      case 'in_progress': return 50;
      case 'delivered': return 80;
      case 'revision_requested': return 60;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/orders/${order.id}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Listing Image */}
            <div className="relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              {order.listing?.images?.[0] ? (
                <Image
                  src={order.listing.images[0]}
                  alt={order.listing?.title || ''}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">
                    {order.listing?.title || 'Order'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Order #{order.order_number}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className={cn(
                    'flex-shrink-0',
                    order.status === 'completed' && 'bg-green-100 text-green-800',
                    order.status === 'cancelled' && 'bg-red-100 text-red-800',
                    order.status === 'delivered' && 'bg-cyan-100 text-cyan-800',
                    order.status === 'in_progress' && 'bg-purple-100 text-purple-800',
                    isOverdue && 'bg-red-100 text-red-800'
                  )}
                >
                  {isOverdue ? 'Overdue' : statusInfo.label}
                </Badge>
              </div>

              {/* Progress */}
              <Progress value={getProgress()} className="h-1.5 mt-2" />

              {/* Details Row */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                {/* Other Party */}
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={otherParty?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {otherParty?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate max-w-24">
                    {otherParty?.name || 'Unknown'}
                  </span>
                </div>

                {/* Due Date */}
                <div className={cn(
                  'flex items-center gap-1',
                  isOverdue ? 'text-red-600' : 'text-muted-foreground'
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {order.status === 'completed'
                      ? `Completed ${formatDistanceToNow(new Date(order.completed_at!), { addSuffix: true })}`
                      : isOverdue
                        ? `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`
                        : `Due ${dueDate.toLocaleDateString()}`
                    }
                  </span>
                </div>

                {/* Price */}
                <span className="font-semibold ml-auto">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
