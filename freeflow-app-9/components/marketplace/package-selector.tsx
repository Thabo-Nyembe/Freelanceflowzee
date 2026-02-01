'use client';

/**
 * Package Selector - FreeFlow A+++ Implementation
 * Interactive package selection with extras for service orders
 */

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Check, Clock, RotateCcw, Plus, Minus, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ServicePackage, ServiceExtra, ServiceListing } from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';

interface PackageSelectorProps {
  listing: ServiceListing;
  onOrder: (data: {
    package_name: ServicePackage['name'];
    extras: string[];
    quantity: number;
  }) => void;
  isOrdering?: boolean;
}

export function PackageSelector({
  listing,
  onOrder,
  isOrdering,
}: PackageSelectorProps) {
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage['name']>('Basic');
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [showOrderSheet, setShowOrderSheet] = useState(false);

  const packages = listing.packages || [];
  const extras = listing.extras || [];

  // Find current package
  const currentPackage = packages.find(p => p.name === selectedPackage) || packages[0];

  // Calculate totals
  const { subtotal, extrasTotal, serviceFee, total, deliveryDays } = useMemo(() => {
    if (!currentPackage) {
      return { subtotal: 0, extrasTotal: 0, serviceFee: 0, total: 0, deliveryDays: 0 };
    }

    const packagePrice = currentPackage.price * quantity;
    let extrasTotal = 0;
    let deliveryModifier = 0;

    selectedExtras.forEach(extraId => {
      const extra = extras.find(e => e.id === extraId);
      if (extra) {
        extrasTotal += extra.price;
        if (extra.delivery_days_modifier) {
          deliveryModifier += extra.delivery_days_modifier;
        }
      }
    });

    const subtotal = packagePrice + extrasTotal;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + serviceFee;
    const deliveryDays = Math.max(1, currentPackage.delivery_days + deliveryModifier);

    return { subtotal, extrasTotal, serviceFee, total, deliveryDays };
  }, [currentPackage, selectedExtras, extras, quantity]);

  // Toggle extra
  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => {
      const next = new Set(prev);
      if (next.has(extraId)) {
        next.delete(extraId);
      } else {
        next.add(extraId);
      }
      return next;
    });
  };

  // Handle order
  const handleOrder = () => {
    onOrder({
      package_name: selectedPackage,
      extras: Array.from(selectedExtras),
      quantity,
    });
  };

  if (!currentPackage) {
    return null;
  }

  return (
    <Card className="sticky top-4">
      {/* Package Tabs */}
      <Tabs value={selectedPackage} onValueChange={(v) => setSelectedPackage(v as ServicePackage['name'])}>
        <CardHeader className="pb-0">
          <TabsList className="grid w-full grid-cols-3">
            {packages.map(pkg => (
              <TabsTrigger key={pkg.name} value={pkg.name}>
                {pkg.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>

        {packages.map(pkg => (
          <TabsContent key={pkg.name} value={pkg.name}>
            <CardContent className="space-y-4 pt-4">
              {/* Package Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{pkg.title}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${pkg.price}</p>
                </div>
              </div>

              {/* Delivery & Revisions */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.delivery_days} day{pkg.delivery_days !== 1 ? 's' : ''} delivery</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {typeof pkg.revisions === 'number' ? `${pkg.revisions} revisions` : 'Unlimited revisions'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What&apos;s included:</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>

      {/* Extras Section */}
      {extras.length > 0 && (
        <CardContent className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">Add extras:</h4>
          <div className="space-y-3">
            {extras.map(extra => (
              <div
                key={extra.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedExtras.has(extra.id) && 'border-primary bg-primary/5'
                )}
                onClick={() => toggleExtra(extra.id)}
              >
                <Checkbox
                  checked={selectedExtras.has(extra.id)}
                  onCheckedChange={() => toggleExtra(extra.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{extra.title}</span>
                    <span className="font-semibold text-sm">+${extra.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{extra.description}</p>
                  {extra.delivery_days_modifier > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      +{extra.delivery_days_modifier} day{extra.delivery_days_modifier !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Quantity */}
      <CardContent className="border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium text-sm">Quantity:</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={quantity >= 10}
              onClick={() => setQuantity(q => Math.min(10, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Order Summary & CTA */}
      <CardContent className="border-t pt-4 space-y-4">
        {/* Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {currentPackage.name} Package x {quantity}
            </span>
            <span>${(currentPackage.price * quantity).toFixed(2)}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Extras</span>
              <span>${extrasTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">Delivery in {deliveryDays} day{deliveryDays !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Order Button */}
        <Sheet open={showOrderSheet} onOpenChange={setShowOrderSheet}>
          <SheetTrigger asChild>
            <Button className="w-full" size="lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continue (${total.toFixed(2)})
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Order Summary</SheetTitle>
              <SheetDescription>
                Review your order before proceeding
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Service */}
              <div>
                <h4 className="font-medium mb-2">Service</h4>
                <p className="text-sm text-muted-foreground">{listing.title}</p>
              </div>

              {/* Package */}
              <div>
                <h4 className="font-medium mb-2">Package</h4>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{currentPackage.name}</p>
                      <p className="text-sm text-muted-foreground">{currentPackage.title}</p>
                    </div>
                    <p className="font-semibold">${currentPackage.price} x {quantity}</p>
                  </div>
                </div>
              </div>

              {/* Extras */}
              {selectedExtras.size > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Extras</h4>
                  <div className="space-y-2">
                    {extras
                      .filter(e => selectedExtras.has(e.id))
                      .map(extra => (
                        <div key={extra.id} className="flex justify-between text-sm">
                          <span>{extra.title}</span>
                          <span>+${extra.price}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Service fee (5%)</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Delivery by {new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleOrder}
                disabled={isOrdering}
              >
                {isOrdering ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Confirm & Pay ${total.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your payment is securely held until you approve the delivery
              </p>
            </div>
          </SheetContent>
        </Sheet>

        {/* Contact Seller */}
        <Button variant="outline" className="w-full" onClick={() => toast.info('Coming Soon', { description: 'Direct messaging with sellers is coming soon' })}>
          Contact Seller
        </Button>
      </CardContent>
    </Card>
  );
}
