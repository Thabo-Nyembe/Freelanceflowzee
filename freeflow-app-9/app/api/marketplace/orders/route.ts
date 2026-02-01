/**
 * Marketplace Orders API - FreeFlow A+++ Implementation
 * Complete order management for buyers and sellers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { stripeConnectService } from '@/lib/stripe/stripe-connect-service';
import { notificationService } from '@/lib/realtime/notification-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('marketplace-orders');

const createOrderSchema = z.object({
  listing_id: z.string().uuid(),
  package_name: z.enum(['Basic', 'Standard', 'Premium']),
  extras: z.array(z.string()).optional(), // Extra IDs
  quantity: z.number().min(1).max(10).default(1),
  requirements_answers: z.record(z.string(), z.any()).optional(),
});

const updateOrderSchema = z.object({
  id: z.string().uuid(),
  action: z.enum([
    'submit_requirements',
    'start_work',
    'deliver',
    'request_revision',
    'accept_delivery',
    'request_cancellation',
    'approve_cancellation',
    'reject_cancellation',
  ]),
  data: z.any().optional(),
});

// GET - List orders
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer'; // buyer or seller
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const orderId = searchParams.get('id');

    // Single order
    if (orderId) {
      const { data: order, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          listing:service_listings (
            id, title, slug, images, packages
          ),
          buyer:users!buyer_id (id, name, email, avatar_url),
          seller:users!seller_id (id, name, email, avatar_url),
          seller_profile:seller_profiles!seller_id (display_name, profile_image, level),
          deliveries:order_deliveries (*),
          messages:order_messages (*)
        `)
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Verify access
      if (order.buyer_id !== user.id && order.seller_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({ order });
    }

    // List orders
    const userColumn = role === 'seller' ? 'seller_id' : 'buyer_id';

    let query = supabase
      .from('service_orders')
      .select(`
        *,
        listing:service_listings (id, title, slug, images),
        buyer:users!buyer_id (id, name, avatar_url),
        seller:users!seller_id (id, name, avatar_url)
      `, { count: 'exact' })
      .eq(userColumn, user.id)
      .order('created_at', { ascending: false });

    if (status) {
      if (status === 'active') {
        query = query.in('status', ['pending', 'requirements_submitted', 'in_progress', 'delivered', 'revision_requested']);
      } else if (status === 'completed') {
        query = query.eq('status', 'completed');
      } else if (status === 'cancelled') {
        query = query.in('status', ['cancelled', 'refunded']);
      } else {
        query = query.eq('status', status);
      }
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Orders GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('service_listings')
      .select(`
        *,
        seller:seller_profiles!seller_profile_id (user_id)
      `)
      .eq('id', validatedData.listing_id)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Can't buy from yourself
    if (listing.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot order your own service' }, { status: 400 });
    }

    // Check seller availability
    if (listing.vacation_mode) {
      return NextResponse.json({ error: 'Seller is currently unavailable' }, { status: 400 });
    }

    // Find selected package
    const packages = listing.packages as unknown[];
    const selectedPackage = packages.find(
      (p: any) => p.name === validatedData.package_name
    );

    if (!selectedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 400 });
    }

    // Calculate extras
    let extrasTotal = 0;
    const selectedExtras: any[] = [];
    let deliveryModifier = 0;

    if (validatedData.extras && listing.extras) {
      const listingExtras = listing.extras as unknown[];
      for (const extraId of validatedData.extras) {
        const extra = listingExtras.find((e: any) => e.id === extraId);
        if (extra) {
          selectedExtras.push(extra);
          extrasTotal += extra.price;
          if (extra.delivery_days_modifier) {
            deliveryModifier += extra.delivery_days_modifier;
          }
        }
      }
    }

    // Calculate totals
    const quantity = validatedData.quantity || 1;
    const subtotal = (selectedPackage.price * quantity) + extrasTotal;
    const serviceFeeRate = 0.05; // 5% platform fee
    const serviceFee = subtotal * serviceFeeRate;
    const total = subtotal + serviceFee;

    // Calculate delivery date
    const deliveryDays = Math.max(1, selectedPackage.delivery_days + deliveryModifier);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + deliveryDays);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.user_id,
        package_name: selectedPackage.name,
        package_price: selectedPackage.price,
        package_details: selectedPackage,
        extras: selectedExtras,
        extras_total: extrasTotal,
        quantity,
        subtotal,
        service_fee: serviceFee,
        service_fee_rate: serviceFeeRate,
        total,
        currency: 'USD',
        delivery_days: deliveryDays,
        original_due_date: dueDate.toISOString(),
        current_due_date: dueDate.toISOString(),
        revisions_allowed: typeof selectedPackage.revisions === 'number'
          ? selectedPackage.revisions
          : 999, // unlimited
        status: 'pending',
        payment_status: 'pending',
        requirements_answers: validatedData.requirements_answers || {},
        requirements_submitted: !!validatedData.requirements_answers,
      })
      .select()
      .single();

    if (orderError) {
      logger.error('Create order error', { error: orderError });
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // If requirements already submitted, mark order
    if (validatedData.requirements_answers) {
      await supabase
        .from('service_orders')
        .update({
          status: 'requirements_submitted',
          requirements_submitted: true,
        })
        .eq('id', order.id);
    }

    // Get seller's Stripe account
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('stripe_account_id')
      .eq('user_id', listing.user_id)
      .single();

    // Process payment with Stripe Connect
    const paymentResult = await stripeConnectService.createMarketplacePayment({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      buyerId: user.id,
      sellerId: listing.user_id,
      sellerStripeAccountId: sellerProfile?.stripe_account_id || 'acct_pending',
      orderId: order.id,
      listingTitle: listing.title,
      platformFeePercent: serviceFeeRate * 100,
    });

    if (!paymentResult.success) {
      // Delete the order if payment fails
      await supabase.from('service_orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Payment processing failed' }, { status: 400 });
    }

    // Update order with payment info
    await supabase
      .from('service_orders')
      .update({
        payment_status: 'held',
        payment_intent_id: paymentResult.paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // Send notification to seller
    await notificationService.send({
      userId: listing.user_id,
      title: 'New Order Received!',
      message: `You have a new order for "${listing.title}" (${selectedPackage.name}) worth $${(total / 100).toFixed(2)}`,
      type: 'success',
      category: 'payment',
      priority: 'high',
      actionUrl: `/dashboard/orders?id=${order.id}`,
      actionLabel: 'View Order',
      data: {
        orderId: order.id,
        listingId: listing.id,
        amount: total,
        packageName: selectedPackage.name
      }
    });

    return NextResponse.json({
      order,
      clientSecret: paymentResult.clientSecret
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Orders POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update order (actions)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, data } = updateOrderSchema.parse(body);

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify access
    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let updates: Record<string, any> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'submit_requirements':
        if (!isBuyer) {
          return NextResponse.json({ error: 'Only buyer can submit requirements' }, { status: 403 });
        }
        if (order.status !== 'pending') {
          return NextResponse.json({ error: 'Requirements already submitted' }, { status: 400 });
        }
        updates = {
          ...updates,
          requirements_answers: data.answers || {},
          requirements_files: data.files || [],
          requirements_submitted: true,
          status: 'requirements_submitted',
        };
        break;

      case 'start_work':
        if (!isSeller) {
          return NextResponse.json({ error: 'Only seller can start work' }, { status: 403 });
        }
        if (order.status !== 'requirements_submitted') {
          return NextResponse.json({ error: 'Cannot start work yet' }, { status: 400 });
        }
        updates = {
          ...updates,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        };
        break;

      case 'deliver':
        if (!isSeller) {
          return NextResponse.json({ error: 'Only seller can deliver' }, { status: 403 });
        }
        if (!['in_progress', 'revision_requested'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot deliver in current status' }, { status: 400 });
        }

        // Create delivery record
        const deliveryNumber = order.status === 'revision_requested'
          ? order.revisions_used + 1
          : 1;

        const autoAcceptDate = new Date();
        autoAcceptDate.setDate(autoAcceptDate.getDate() + 3);

        await supabase
          .from('order_deliveries')
          .insert({
            order_id: id,
            message: data.message,
            files: data.files || [],
            delivery_number: deliveryNumber,
            is_revision: order.status === 'revision_requested',
            auto_accept_at: autoAcceptDate.toISOString(),
          });

        updates = {
          ...updates,
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        };
        break;

      case 'request_revision':
        if (!isBuyer) {
          return NextResponse.json({ error: 'Only buyer can request revision' }, { status: 403 });
        }
        if (order.status !== 'delivered') {
          return NextResponse.json({ error: 'No delivery to revise' }, { status: 400 });
        }
        if (order.revisions_used >= order.revisions_allowed && order.revisions_allowed < 999) {
          return NextResponse.json({ error: 'No revisions remaining' }, { status: 400 });
        }

        // Update latest delivery
        await supabase
          .from('order_deliveries')
          .update({
            status: 'revision_requested',
            revision_notes: data.notes,
            revision_requested_at: new Date().toISOString(),
          })
          .eq('order_id', id)
          .order('delivery_number', { ascending: false })
          .limit(1);

        updates = {
          ...updates,
          status: 'revision_requested',
          revisions_used: order.revisions_used + 1,
        };
        break;

      case 'accept_delivery':
        if (!isBuyer) {
          return NextResponse.json({ error: 'Only buyer can accept' }, { status: 403 });
        }
        if (order.status !== 'delivered') {
          return NextResponse.json({ error: 'No delivery to accept' }, { status: 400 });
        }

        // Accept latest delivery
        await supabase
          .from('order_deliveries')
          .update({ status: 'accepted' })
          .eq('order_id', id)
          .order('delivery_number', { ascending: false })
          .limit(1);

        updates = {
          ...updates,
          status: 'completed',
          completed_at: new Date().toISOString(),
          payment_status: 'released',
          released_at: new Date().toISOString(),
        };

        // Release payment to seller - capture the held payment
        if (order.payment_intent_id) {
          const captureResult = await stripeConnectService.capturePayment(order.payment_intent_id);
          if (!captureResult.success) {
            logger.error('Failed to capture payment', { error: captureResult.error });
          }
        }

        // Notify seller of payment release
        await notificationService.send({
          userId: order.seller_id,
          title: 'Payment Released!',
          message: `Payment of $${(order.total / 100).toFixed(2)} has been released for your completed order.`,
          type: 'success',
          category: 'payment',
          priority: 'high',
          data: { orderId: order.id, amount: order.total }
        });
        break;

      case 'request_cancellation':
        if (!['pending', 'requirements_submitted', 'in_progress'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot cancel in current status' }, { status: 400 });
        }

        updates = {
          ...updates,
          cancellation_reason: data.reason,
          cancelled_by: user.id,
        };

        // If buyer cancels before work starts, auto-approve
        if (isBuyer && ['pending', 'requirements_submitted'].includes(order.status)) {
          updates.status = 'cancelled';
          updates.cancelled_at = new Date().toISOString();
          updates.payment_status = 'refunded';

          // Process refund
          if (order.payment_intent_id) {
            const refundResult = await stripeConnectService.processRefund({
              paymentIntentId: order.payment_intent_id,
              reason: 'requested_by_customer',
              orderId: order.id
            });
            if (!refundResult.success) {
              logger.error('Failed to process refund', { error: refundResult.error });
            }
          }

          // Notify buyer of refund
          await notificationService.send({
            userId: order.buyer_id,
            title: 'Order Cancelled - Refund Issued',
            message: `Your order has been cancelled and a refund of $${(order.total / 100).toFixed(2)} has been initiated.`,
            type: 'info',
            category: 'payment',
            data: { orderId: order.id, refundAmount: order.total }
          });
        }
        break;

      case 'approve_cancellation':
        if (order.cancelled_by === user.id) {
          return NextResponse.json({ error: 'Cannot approve your own cancellation' }, { status: 400 });
        }

        updates = {
          ...updates,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          payment_status: 'refunded',
        };

        // Process refund
        if (order.payment_intent_id) {
          const refundResult = await stripeConnectService.processRefund({
            paymentIntentId: order.payment_intent_id,
            reason: 'requested_by_customer',
            orderId: order.id
          });
          if (!refundResult.success) {
            logger.error('Failed to process refund', { error: refundResult.error });
          }
        }

        // Notify both parties
        await notificationService.send({
          userId: order.buyer_id,
          title: 'Cancellation Approved - Refund Issued',
          message: `Your order cancellation has been approved. A refund of $${(order.total / 100).toFixed(2)} has been initiated.`,
          type: 'info',
          category: 'payment',
          data: { orderId: order.id }
        });

        await notificationService.send({
          userId: order.seller_id,
          title: 'Order Cancelled',
          message: 'An order has been cancelled by mutual agreement.',
          type: 'info',
          category: 'payment',
          data: { orderId: order.id }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('service_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Orders PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
