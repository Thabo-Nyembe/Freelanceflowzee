import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('stripe-api');

// ============================================================================
// PAYMENT METHODS API
// ============================================================================
// Complete payment method management
// - List payment methods
// - Add payment method
// - Set default payment method
// - Delete payment method
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

interface PaymentMethodRequest {
  action: string;
  paymentMethodId?: string;
  card?: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
  };
}

// ============================================================================
// HELPER: Get or create Stripe customer
// ============================================================================
async function getStripeCustomerId(userId: string, supabase: any): Promise<string | null> {
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create new customer if needed
  if (user?.email) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });

      await supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);

      return customer.id;
    } catch {
      return null;
    }
  }

  return null;
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: PaymentMethodRequest = await request.json();
    const { action } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    switch (action) {
      // ======================================================================
      // LIST PAYMENT METHODS
      // ======================================================================
      case 'list-payment-methods': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              paymentMethods: [
                {
                  id: 'pm_demo_1',
                  type: 'card',
                  brand: 'visa',
                  last4: '4242',
                  expMonth: 12,
                  expYear: 2026,
                  isDefault: true,
                },
                {
                  id: 'pm_demo_2',
                  type: 'card',
                  brand: 'mastercard',
                  last4: '5555',
                  expMonth: 6,
                  expYear: 2027,
                  isDefault: false,
                },
              ],
            },
          });
        }

        const customerId = await getStripeCustomerId(userId, supabase);
        if (!customerId) {
          return NextResponse.json({
            success: true,
            data: { paymentMethods: [] },
          });
        }

        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });

        // Get default payment method
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const defaultPm = customer.invoice_settings?.default_payment_method;

        return NextResponse.json({
          success: true,
          data: {
            paymentMethods: paymentMethods.data.map(pm => ({
              id: pm.id,
              type: pm.type,
              brand: pm.card?.brand || 'unknown',
              last4: pm.card?.last4 || '****',
              expMonth: pm.card?.exp_month || 0,
              expYear: pm.card?.exp_year || 0,
              isDefault: pm.id === defaultPm,
            })),
          },
        });
      }

      // ======================================================================
      // ADD PAYMENT METHOD
      // ======================================================================
      case 'add-payment-method': {
        const { card } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!card) {
          return NextResponse.json({
            success: false,
            error: 'Card details required',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              paymentMethod: {
                id: `pm_demo_${Date.now()}`,
                type: 'card',
                brand: 'visa',
                last4: card.number.slice(-4),
                expMonth: parseInt(card.expMonth),
                expYear: parseInt(card.expYear),
                isDefault: false,
              },
              message: 'Demo mode: Payment method would be added',
            },
          });
        }

        const customerId = await getStripeCustomerId(userId, supabase);
        if (!customerId) {
          return NextResponse.json({
            success: false,
            error: 'Could not create customer account',
          }, { status: 500 });
        }

        // In production, you would use Stripe Elements or Checkout
        // This is a simplified example - card details should NEVER be sent to your server
        // Use Stripe.js to create a PaymentMethod client-side instead

        return NextResponse.json({
          success: false,
          error: 'For security, please use Stripe Checkout or the billing portal to add payment methods',
          data: {
            portalUrl: '/api/stripe/checkout-session?action=create-portal-session',
          },
        }, { status: 400 });
      }

      // ======================================================================
      // SET DEFAULT PAYMENT METHOD
      // ======================================================================
      case 'set-default': {
        const { paymentMethodId } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!paymentMethodId) {
          return NextResponse.json({
            success: false,
            error: 'Payment method ID required',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Default payment method updated',
              paymentMethodId,
            },
          });
        }

        const customerId = await getStripeCustomerId(userId, supabase);
        if (!customerId) {
          return NextResponse.json({
            success: false,
            error: 'No billing account found',
          }, { status: 404 });
        }

        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            message: 'Default payment method updated',
            paymentMethodId,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['list-payment-methods', 'add-payment-method', 'set-default'],
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Payment Methods API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE HANDLER
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { paymentMethodId } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    if (!paymentMethodId) {
      return NextResponse.json({
        success: false,
        error: 'Payment method ID required',
      }, { status: 400 });
    }

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          message: 'Demo mode: Payment method would be removed',
          paymentMethodId,
        },
      });
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Payment method removed',
        paymentMethodId,
      },
    });
  } catch (error) {
    logger.error('Payment Methods DELETE Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove payment method',
    }, { status: 500 });
  }
}
