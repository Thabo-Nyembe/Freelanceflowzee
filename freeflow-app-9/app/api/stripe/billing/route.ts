import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('stripe-api');

// ============================================================================
// BILLING ADDRESS API
// ============================================================================
// Manage customer billing information
// - Get billing address
// - Update billing address
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

interface BillingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface BillingRequest {
  action: string;
  address?: BillingAddress;
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: BillingRequest = await request.json();
    const { action } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    switch (action) {
      // ======================================================================
      // GET BILLING ADDRESS
      // ======================================================================
      case 'get-billing-address': {
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
              address: {
                name: 'Demo User',
                email: 'demo@example.com',
                address: '123 Demo Street',
                city: 'San Francisco',
                state: 'CA',
                postalCode: '94102',
                country: 'US',
              },
            },
          });
        }

        // Get Stripe customer ID
        const { data: userData } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!userData?.stripe_customer_id) {
          return NextResponse.json({
            success: true,
            data: { address: null },
          });
        }

        const customer = await stripe.customers.retrieve(userData.stripe_customer_id) as Stripe.Customer;

        return NextResponse.json({
          success: true,
          data: {
            address: {
              name: customer.name || '',
              email: customer.email || '',
              address: customer.address?.line1 || '',
              city: customer.address?.city || '',
              state: customer.address?.state || '',
              postalCode: customer.address?.postal_code || '',
              country: customer.address?.country || 'US',
            },
          },
        });
      }

      // ======================================================================
      // UPDATE BILLING ADDRESS
      // ======================================================================
      case 'update-billing-address': {
        const { address } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!address) {
          return NextResponse.json({
            success: false,
            error: 'Address data required',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Billing address would be updated',
              address,
            },
          });
        }

        // Get Stripe customer ID
        const { data: userData } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!userData?.stripe_customer_id) {
          return NextResponse.json({
            success: false,
            error: 'No billing account found. Please add a payment method first.',
          }, { status: 404 });
        }

        // Update Stripe customer
        await stripe.customers.update(userData.stripe_customer_id, {
          name: address.name,
          email: address.email,
          address: {
            line1: address.address,
            city: address.city,
            state: address.state,
            postal_code: address.postalCode,
            country: address.country,
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            message: 'Billing address updated successfully',
            address,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['get-billing-address', 'update-billing-address'],
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Billing API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================
export async function GET(request: NextRequest) {
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ action: 'get-billing-address' }),
  }));
}
