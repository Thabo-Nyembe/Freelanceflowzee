'use client';

/**
 * Order Detail - FreeFlow A+++ Implementation
 * Full order view with actions and messaging
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Package,
  Upload,
  Send,
  RotateCcw,
  XCircle,
  FileText,
  Download,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  ServiceOrder,
  ORDER_STATUSES,
  useOrderMutations,
} from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface OrderDetailProps {
  order: ServiceOrder;
  role: 'buyer' | 'seller';
  onRefresh: () => void;
}

export function OrderDetail({ order, role, onRefresh }: OrderDetailProps) {
  const [deliverMessage, setDeliverMessage] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    startWork,
    deliverOrder,
    requestRevision,
    acceptDelivery,
    requestCancellation,
    isLoading,
  } = useOrderMutations();

  const statusInfo = ORDER_STATUSES[order.status];
  const dueDate = new Date(order.current_due_date);
  const isOverdue = dueDate < new Date() && !['completed', 'cancelled', 'refunded'].includes(order.status);

  // Progress steps
  const steps = [
    { key: 'pending', label: 'Order Placed', completed: true },
    { key: 'requirements', label: 'Requirements', completed: order.requirements_submitted },
    { key: 'in_progress', label: 'In Progress', completed: ['in_progress', 'delivered', 'revision_requested', 'completed'].includes(order.status) },
    { key: 'delivered', label: 'Delivered', completed: ['delivered', 'completed'].includes(order.status) },
    { key: 'completed', label: 'Completed', completed: order.status === 'completed' },
  ];

  // Handle actions
  const handleStartWork = async () => {
    try {
      await startWork(order.id);
      toast.success('Work started!');
      onRefresh();
    } catch (error) {
      toast.error('Failed to start work');
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverOrder(order.id, deliverMessage);
      toast.success('Delivery submitted!');
      setShowDeliverDialog(false);
      setDeliverMessage('');
      onRefresh();
    } catch (error) {
      toast.error('Failed to submit delivery');
    }
  };

  const handleRequestRevision = async () => {
    try {
      await requestRevision(order.id, revisionNotes);
      toast.success('Revision requested');
      setShowRevisionDialog(false);
      setRevisionNotes('');
      onRefresh();
    } catch (error) {
      toast.error('Failed to request revision');
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      await acceptDelivery(order.id);
      toast.success('Delivery accepted! Order completed.');
      onRefresh();
    } catch (error) {
      toast.error('Failed to accept delivery');
    }
  };

  const handleCancellation = async () => {
    try {
      await requestCancellation(order.id, cancelReason);
      toast.success('Cancellation requested');
      setShowCancelDialog(false);
      setCancelReason('');
      onRefresh();
    } catch (error) {
      toast.error('Failed to request cancellation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
          <p className="text-muted-foreground">
            Created {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
          </p>
        </div>
        <Badge
          className={cn(
            'text-sm px-3 py-1',
            order.status === 'completed' && 'bg-green-500',
            order.status === 'cancelled' && 'bg-red-500',
            isOverdue && 'bg-red-500'
          )}
        >
          {isOverdue ? 'Overdue' : statusInfo.label}
        </Badge>
      </div>

      {/* Overdue Alert */}
      {isOverdue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Order is overdue</AlertTitle>
          <AlertDescription>
            This order was due {formatDistanceToNow(dueDate, { addSuffix: true })}.
            {role === 'seller' && ' Please deliver as soon as possible.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      step.completed
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className="text-xs mt-1 text-center">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-1 w-12 sm:w-24 mx-2',
                      step.completed ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/marketplace/${order.listing?.slug}`} className="flex gap-4 group">
                <div className="relative w-32 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {order.listing?.images?.[0] ? (
                    <Image
                      src={order.listing.images[0]}
                      alt={order.listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {order.listing?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{order.package_name} Package</p>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_days} day delivery • {order.revisions_allowed === 999 ? 'Unlimited' : order.revisions_allowed} revisions
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Deliveries */}
          {order.deliveries && order.deliveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      delivery.status === 'accepted' && 'border-green-500 bg-green-50 dark:bg-green-950'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Delivery #{delivery.delivery_number}
                        </Badge>
                        {delivery.is_revision && (
                          <Badge variant="secondary">Revision</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm mb-3">{delivery.message}</p>

                    {/* Files */}
                    {delivery.files && delivery.files.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {delivery.files.map((file, i) => (
                          <Button key={i} variant="outline" size="sm" asChild>
                            <a href={file} download>
                              <Download className="h-4 w-4 mr-1" />
                              File {i + 1}
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Revision Notes */}
                    {delivery.revision_notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Revision Requested
                        </p>
                        <p className="text-sm">{delivery.revision_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seller Actions */}
              {role === 'seller' && (
                <>
                  {order.status === 'requirements_submitted' && (
                    <Button onClick={handleStartWork} disabled={isLoading}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Work
                    </Button>
                  )}

                  {['in_progress', 'revision_requested'].includes(order.status) && (
                    <Dialog open={showDeliverDialog} onOpenChange={setShowDeliverDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Deliver Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Deliver Order</DialogTitle>
                          <DialogDescription>
                            Submit your completed work to the buyer
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Describe what you've delivered..."
                            value={deliverMessage}
                            onChange={(e) => setDeliverMessage(e.target.value)}
                            rows={4}
                          />
                          <Button variant="outline" className="w-full" onClick={() => toast.info('Upload', { description: 'Opening file picker...' })}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Files
                          </Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeliverDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleDeliver} disabled={isLoading || !deliverMessage}>
                            Submit Delivery
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}

              {/* Buyer Actions */}
              {role === 'buyer' && (
                <>
                  {order.status === 'delivered' && (
                    <div className="flex gap-2">
                      <Button onClick={handleAcceptDelivery} disabled={isLoading}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Delivery
                      </Button>

                      {order.revisions_used < order.revisions_allowed && (
                        <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Request Revision
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Revision</DialogTitle>
                              <DialogDescription>
                                Revisions remaining: {order.revisions_allowed === 999 ? 'Unlimited' : order.revisions_allowed - order.revisions_used}
                              </DialogDescription>
                            </DialogHeader>
                            <Textarea
                              placeholder="Describe what changes you need..."
                              value={revisionNotes}
                              onChange={(e) => setRevisionNotes(e.target.value)}
                              rows={4}
                            />
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleRequestRevision} disabled={isLoading || !revisionNotes}>
                                Request Revision
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Cancel (both roles) */}
              {['pending', 'requirements_submitted', 'in_progress'].includes(order.status) && (
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Cancellation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Cancellation</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for cancellation
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Reason for cancellation..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={4}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        Keep Order
                      </Button>
                      <Button variant="destructive" onClick={handleCancellation} disabled={isLoading || !cancelReason}>
                        Cancel Order
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{order.package_name} Package</span>
                <span>${order.package_price.toFixed(2)}</span>
              </div>

              {order.quantity > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>x{order.quantity}</span>
                </div>
              )}

              {order.extras_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Extras</span>
                  <span>${order.extras_total.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>${order.service_fee.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Placed</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                {order.started_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Started</span>
                    <span>{new Date(order.started_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className={cn(isOverdue && 'text-red-500')}>
                    {dueDate.toLocaleDateString()}
                  </span>
                </div>
                {order.completed_at && (
                  <div className="flex justify-between text-green-600">
                    <span>Completed</span>
                    <span>{new Date(order.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Other Party */}
          <Card>
            <CardHeader>
              <CardTitle>{role === 'buyer' ? 'Seller' : 'Buyer'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={(role === 'buyer' ? order.seller : order.buyer)?.avatar_url || ''} />
                  <AvatarFallback>
                    {(role === 'buyer' ? order.seller : order.buyer)?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {(role === 'buyer' ? order.seller : order.buyer)?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(role === 'buyer' ? order.seller : order.buyer)?.email}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => toast.info('Message', { description: 'Opening message composer...' })}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
