import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('stripe-api');

// ============================================================================
// WORLD-CLASS STRIPE CHECKOUT SESSION API
// ============================================================================
// Complete Stripe checkout integration for subscriptions and one-time payments
// - Create checkout sessions for subscriptions
// - Create checkout sessions for one-time payments
// - Handle trial periods
// - Manage promo codes
// - Customer portal sessions
// - Subscription management
// ============================================================================

// Initialize Stripe (will use test mode if no production key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

// Plan configurations
const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_free',
    interval: 'month' as const,
    features: [
      '3 active projects',
      'Basic AI assistance',
      '5GB file storage',
      'Email support',
      'Community access',
    ],
    limits: {
      projects: 3,
      storage: 5 * 1024 * 1024 * 1024, // 5GB
      aiCredits: 100,
      teamMembers: 1,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 2900, // $29.00 in cents
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional_monthly',
    interval: 'month' as const,
    trialDays: 14,
    features: [
      'Unlimited projects',
      'Advanced AI (GPT-4, Claude, DALL-E)',
      '100GB file storage',
      'Video studio',
      'Payment processing (2.9%)',
      'Priority support',
      'Branded client portals',
    ],
    limits: {
      projects: -1, // unlimited
      storage: 100 * 1024 * 1024 * 1024, // 100GB
      aiCredits: 5000,
      teamMembers: 10,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9900, // $99.00 in cents
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
    interval: 'month' as const,
    features: [
      'Everything in Professional',
      'Team collaboration (up to 50 users)',
      'Unlimited storage',
      'White-label solution',
      'Advanced security',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limits: {
      projects: -1,
      storage: -1, // unlimited
      aiCredits: -1, // unlimited
      teamMembers: 50,
    },
  },
};

// Annual pricing (20% discount)
const ANNUAL_DISCOUNT = 0.2;

interface CheckoutRequest {
  action: string;
  planId?: string;
  billingInterval?: 'month' | 'year';
  promoCode?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerId?: string;
  returnUrl?: string;
  sessionId?: string;
  subscriptionId?: string;
  newPlanId?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getOrCreateStripeCustomer(userId: string, email: string, supabase: any): Promise<string> {
  // Check if user already has a Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create new Stripe customer
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
        platform: 'kazi',
      },
    });

    // Save customer ID to database
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  } catch {
    // Demo mode - return mock customer ID
    return `cus_demo_${userId.substring(0, 8)}`;
  }
}

function calculatePrice(plan: typeof PLANS[keyof typeof PLANS], interval: 'month' | 'year'): number {
  if (interval === 'year') {
    return Math.round(plan.price * 12 * (1 - ANNUAL_DISCOUNT));
  }
  return plan.price;
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CheckoutRequest = await request.json();
    const { action } = body;

    // Get user from auth
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const userEmail = user?.email || null;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    switch (action) {
      // ======================================================================
      // CREATE CHECKOUT SESSION
      // ======================================================================
      case 'create-checkout-session': {
        const {
          planId = 'professional',
          billingInterval = 'month',
          promoCode,
          successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
          cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
        } = body;

        const plan = PLANS[planId as keyof typeof PLANS];
        if (!plan) {
          return NextResponse.json({
            success: false,
            error: 'Invalid plan selected',
          }, { status: 400 });
        }

        // Free plan - no checkout needed
        if (plan.price === 0) {
          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: {
              type: 'free_activation',
              redirectUrl: '/dashboard',
              message: 'Welcome to KAZI Starter!',
              plan: {
                id: plan.id,
                name: plan.name,
                price: 0,
                features: plan.features,
              },
            },
          });
        }

        if (isDemo) {
          // Demo mode - return mock checkout session
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              sessionId: `cs_demo_${Date.now()}`,
              url: `${successUrl}&plan=${planId}&demo=true`,
              plan: {
                id: plan.id,
                name: plan.name,
                price: calculatePrice(plan, billingInterval),
                interval: billingInterval,
                features: plan.features,
              },
              message: 'Demo mode: Redirecting to success page',
            },
          });
        }

        // Production: Create actual Stripe checkout session
        const customerId = userId && userEmail
          ? await getOrCreateStripeCustomer(userId, userEmail, supabase)
          : undefined;

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: plan.priceId,
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          ...(customerId && { customer: customerId }),
          ...('trialDays' in plan && plan.trialDays && {
            subscription_data: {
              trial_period_days: plan.trialDays,
            },
          }),
          ...(promoCode && {
            discounts: [{ promotion_code: promoCode }],
          }),
          metadata: {
            userId: userId || 'guest',
            planId,
            billingInterval,
          },
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            url: session.url,
            plan: {
              id: plan.id,
              name: plan.name,
              price: calculatePrice(plan, billingInterval),
              interval: billingInterval,
              features: plan.features,
            },
          },
        });
      }

      // ======================================================================
      // CREATE ONE-TIME PAYMENT SESSION
      // ======================================================================
      case 'create-payment-session': {
        const {
          successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
          cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
        } = body;

        // Parse amount from body
        const amount = (body as Record<string, unknown>).amount;
        const description = (body as Record<string, unknown>).description || 'One-time payment';

        if (!amount || amount < 50) { // Minimum $0.50
          return NextResponse.json({
            success: false,
            error: 'Invalid amount. Minimum is $0.50',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              sessionId: `cs_demo_payment_${Date.now()}`,
              url: `${successUrl}&amount=${amount}&demo=true`,
              amount,
              description,
              message: 'Demo mode: Payment session created',
            },
          });
        }

        const customerId = userId && userEmail
          ? await getOrCreateStripeCustomer(userId, userEmail, supabase)
          : undefined;

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: description,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          ...(customerId && { customer: customerId }),
          metadata: {
            userId: userId || 'guest',
            type: 'one_time',
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            url: session.url,
            amount,
            description,
          },
        });
      }

      // ======================================================================
      // CREATE CUSTOMER PORTAL SESSION
      // ======================================================================
      case 'create-portal-session': {
        const { returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing` } = body;

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
              url: returnUrl,
              message: 'Demo mode: Customer portal not available',
            },
          });
        }

        // Get customer ID
        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!user?.stripe_customer_id) {
          return NextResponse.json({
            success: false,
            error: 'No billing account found',
          }, { status: 404 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripe_customer_id,
          return_url: returnUrl,
        });

        return NextResponse.json({
          success: true,
          data: {
            url: portalSession.url,
          },
        });
      }

      // ======================================================================
      // GET SESSION STATUS
      // ======================================================================
      case 'get-session-status': {
        const { sessionId } = body;

        if (!sessionId) {
          return NextResponse.json({
            success: false,
            error: 'Session ID required',
          }, { status: 400 });
        }

        if (isDemo || sessionId.startsWith('cs_demo')) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              status: 'complete',
              paymentStatus: 'paid',
              customerEmail: 'demo@example.com',
              amountTotal: 2900,
              currency: 'usd',
            },
          });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
          success: true,
          data: {
            status: session.status,
            paymentStatus: session.payment_status,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total,
            currency: session.currency,
            subscriptionId: session.subscription,
          },
        });
      }

      // ======================================================================
      // CANCEL SUBSCRIPTION
      // ======================================================================
      case 'cancel-subscription': {
        const { subscriptionId } = body;

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
              message: 'Demo mode: Subscription would be cancelled',
              cancelAtPeriodEnd: true,
            },
          });
        }

        if (!subscriptionId) {
          // Get user's subscription from database
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          if (!subscription?.stripe_subscription_id) {
            return NextResponse.json({
              success: false,
              error: 'No active subscription found',
            }, { status: 404 });
          }

          // Cancel at period end
          const updated = await stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            { cancel_at_period_end: true }
          );

          return NextResponse.json({
            success: true,
            data: {
              cancelAtPeriodEnd: updated.cancel_at_period_end,
              currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
              message: 'Subscription will be cancelled at the end of the billing period',
            },
          });
        }

        const updated = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

        return NextResponse.json({
          success: true,
          data: {
            cancelAtPeriodEnd: updated.cancel_at_period_end,
            currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
          },
        });
      }

      // ======================================================================
      // REACTIVATE SUBSCRIPTION
      // ======================================================================
      case 'reactivate-subscription': {
        const { subscriptionId } = body;

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
              message: 'Demo mode: Subscription would be reactivated',
              cancelAtPeriodEnd: false,
            },
          });
        }

        if (!subscriptionId) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .single();

          if (!subscription?.stripe_subscription_id) {
            return NextResponse.json({
              success: false,
              error: 'No subscription found',
            }, { status: 404 });
          }

          const updated = await stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            { cancel_at_period_end: false }
          );

          return NextResponse.json({
            success: true,
            data: {
              cancelAtPeriodEnd: updated.cancel_at_period_end,
              message: 'Subscription reactivated successfully',
            },
          });
        }

        const updated = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });

        return NextResponse.json({
          success: true,
          data: {
            cancelAtPeriodEnd: updated.cancel_at_period_end,
          },
        });
      }

      // ======================================================================
      // CHANGE SUBSCRIPTION PLAN
      // ======================================================================
      case 'change-plan': {
        const { newPlanId, subscriptionId } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        const newPlan = PLANS[newPlanId as keyof typeof PLANS];
        if (!newPlan) {
          return NextResponse.json({
            success: false,
            error: 'Invalid plan',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: `Demo mode: Would upgrade to ${newPlan.name}`,
              plan: newPlan,
            },
          });
        }

        // Get current subscription
        let subId = subscriptionId;
        if (!subId) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          subId = subscription?.stripe_subscription_id;
        }

        if (!subId) {
          return NextResponse.json({
            success: false,
            error: 'No active subscription found',
          }, { status: 404 });
        }

        // Get subscription to find the item
        const subscription = await stripe.subscriptions.retrieve(subId);

        // Update subscription with new price
        const updated = await stripe.subscriptions.update(subId, {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPlan.priceId,
            },
          ],
          proration_behavior: 'create_prorations',
        });

        return NextResponse.json({
          success: true,
          data: {
            subscriptionId: updated.id,
            status: updated.status,
            plan: newPlan,
            message: `Successfully changed to ${newPlan.name} plan`,
          },
        });
      }

      // ======================================================================
      // GET PLANS
      // ======================================================================
      case 'get-plans': {
        const { billingInterval = 'month' } = body;

        const plansWithPrices = Object.values(PLANS).map(plan => ({
          ...plan,
          displayPrice: plan.price === 0
            ? 'Free'
            : `$${(calculatePrice(plan, billingInterval as 'month' | 'year') / 100).toFixed(0)}`,
          billingInterval,
          ...(plan.price > 0 && billingInterval === 'year' && {
            savings: `Save $${((plan.price * 12 * ANNUAL_DISCOUNT) / 100).toFixed(0)}/year`,
          }),
        }));

        return NextResponse.json({
          success: true,
          data: {
            plans: plansWithPrices,
            billingInterval,
          },
        });
      }

      // ======================================================================
      // VALIDATE PROMO CODE
      // ======================================================================
      case 'validate-promo': {
        const { promoCode } = body;

        if (!promoCode) {
          return NextResponse.json({
            success: false,
            error: 'Promo code required',
          }, { status: 400 });
        }

        if (isDemo) {
          // Demo promo codes
          const demoCodes: Record<string, { discount: number; type: string }> = {
            'LAUNCH20': { discount: 20, type: 'percent' },
            'WELCOME10': { discount: 10, type: 'percent' },
            'FIRSTMONTH': { discount: 100, type: 'percent' },
          };

          const code = demoCodes[promoCode.toUpperCase()];
          if (code) {
            return NextResponse.json({
              success: true,
              demo: true,
              data: {
                valid: true,
                code: promoCode.toUpperCase(),
                discount: code.discount,
                type: code.type,
                message: `${code.discount}% off applied!`,
              },
            });
          }

          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              valid: false,
              message: 'Invalid promo code',
            },
          });
        }

        try {
          const promotionCodes = await stripe.promotionCodes.list({
            code: promoCode,
            active: true,
            limit: 1,
          });

          if (promotionCodes.data.length === 0) {
            return NextResponse.json({
              success: true,
              data: {
                valid: false,
                message: 'Invalid or expired promo code',
              },
            });
          }

          const promo = promotionCodes.data[0];
          const coupon = promo.coupon;

          return NextResponse.json({
            success: true,
            data: {
              valid: true,
              code: promo.code,
              discount: coupon.percent_off || coupon.amount_off,
              type: coupon.percent_off ? 'percent' : 'amount',
              promotionCodeId: promo.id,
            },
          });
        } catch {
          return NextResponse.json({
            success: true,
            data: {
              valid: false,
              message: 'Error validating promo code',
            },
          });
        }
      }

      // ======================================================================
      // GET SUBSCRIPTION STATUS
      // ======================================================================
      case 'get-subscription': {
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
              hasSubscription: true,
              plan: PLANS.professional,
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: false,
            },
          });
        }

        // Get subscription from database
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!subscription) {
          return NextResponse.json({
            success: true,
            data: {
              hasSubscription: false,
              plan: PLANS.starter,
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            hasSubscription: true,
            subscription,
            plan: PLANS[subscription.plan_type as keyof typeof PLANS] || PLANS.starter,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'create-checkout-session',
            'create-payment-session',
            'create-portal-session',
            'get-session-status',
            'cancel-subscription',
            'reactivate-subscription',
            'change-plan',
            'get-plans',
            'validate-promo',
            'get-subscription',
          ],
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Stripe API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// GET handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'get-plans';

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ action }),
  }));
}
