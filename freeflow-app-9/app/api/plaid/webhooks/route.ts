/**
 * Plaid Webhooks API - FreeFlow A+++ Implementation
 * Handle Plaid webhook events for real-time updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';
import { performFullSync, getAccounts } from '@/lib/plaid/service';
import crypto from 'crypto';

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

const logger = createFeatureLogger('plaid-api');

// Webhook types from Plaid
type PlaidWebhookType =
  | 'TRANSACTIONS'
  | 'ITEM'
  | 'AUTH'
  | 'ASSETS'
  | 'HOLDINGS'
  | 'INVESTMENTS_TRANSACTIONS'
  | 'LIABILITIES';

interface PlaidWebhookBody {
  webhook_type: PlaidWebhookType;
  webhook_code: string;
  item_id: string;
  error?: {
    error_code: string;
    error_message: string;
    display_message: string;
  };
  new_transactions?: number;
  removed_transactions?: string[];
  consent_expiration_time?: string;
}

// Verify Plaid webhook signature
function verifyPlaidWebhook(body: string, signature: string | null): boolean {
  if (!signature || !process.env.PLAID_WEBHOOK_SECRET) {
    // In development, skip verification if no secret configured
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PLAID_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('plaid-verification');

    // Verify webhook signature
    if (!verifyPlaidWebhook(rawBody, signature)) {
      logger.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body: PlaidWebhookBody = JSON.parse(rawBody);
    const { webhook_type, webhook_code, item_id, error } = body;

    logger.info('Plaid webhook received', { webhook_type, webhook_code, item_id });

    const supabase = await createClient();

    // Find the connection by Plaid item ID
    const { data: connection, error: connError } = await supabase
      .from('bank_connections')
      .select('id, user_id, plaid_access_token, plaid_cursor')
      .eq('plaid_item_id', item_id)
      .single();

    if (connError || !connection) {
      logger.error('Connection not found for item', { item_id });
      return NextResponse.json({ received: true });
    }

    // Handle different webhook types
    switch (webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionWebhook(supabase, connection, webhook_code, body);
        break;

      case 'ITEM':
        await handleItemWebhook(supabase, connection, webhook_code, body);
        break;

      default:
        logger.info('Unhandled webhook type', { webhook_type });
    }

    // Log the webhook
    await supabase
      .from('bank_sync_log')
      .insert({
        connection_id: connection.id,
        sync_type: 'webhook',
        status: error ? 'failed' : 'success',
        error_message: error?.error_message,
        metadata: { webhook_type, webhook_code, error },
      });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', { error });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle transaction webhooks
async function handleTransactionWebhook(
  supabase: Awaited<ReturnType<typeof createClient>>,
  connection: {
    id: string;
    user_id: string;
    plaid_access_token: string;
    plaid_cursor: string | null;
  },
  webhookCode: string,
  body: PlaidWebhookBody
) {
  switch (webhookCode) {
    case 'INITIAL_UPDATE':
    case 'HISTORICAL_UPDATE':
    case 'DEFAULT_UPDATE':
    case 'SYNC_UPDATES_AVAILABLE':
      // Trigger a sync
      logger.info('Triggering sync for connection', { connectionId: connection.id, webhookCode });
      await performFullSync(
        connection.id,
        connection.plaid_access_token,
        connection.plaid_cursor || undefined
      );
      break;

    case 'TRANSACTIONS_REMOVED':
      // Handle removed transactions
      if (body.removed_transactions && body.removed_transactions.length > 0) {
        await supabase
          .from('bank_transactions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .in('plaid_transaction_id', body.removed_transactions);
      }
      break;

    default:
      logger.info('Unhandled transaction webhook', { webhookCode });
  }
}

// Handle item webhooks
async function handleItemWebhook(
  supabase: Awaited<ReturnType<typeof createClient>>,
  connection: {
    id: string;
    user_id: string;
    plaid_access_token: string;
    plaid_cursor: string | null;
  },
  webhookCode: string,
  body: PlaidWebhookBody
) {
  switch (webhookCode) {
    case 'ERROR':
      // Update connection status to error
      await supabase
        .from('bank_connections')
        .update({
          status: 'error',
          error_code: body.error?.error_code,
          error_message: body.error?.error_message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);
      break;

    case 'PENDING_EXPIRATION':
    case 'USER_PERMISSION_REVOKED':
      // Update connection status
      await supabase
        .from('bank_connections')
        .update({
          status: 'pending_expiration',
          consent_expiration_time: body.consent_expiration_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);
      break;

    case 'WEBHOOK_UPDATE_ACKNOWLEDGED':
      // No action needed
      break;

    case 'NEW_ACCOUNTS_AVAILABLE':
      // Fetch and add new accounts
      try {
        const accounts = await getAccounts(connection.plaid_access_token);

        // Get existing account IDs
        const { data: existingAccounts } = await supabase
          .from('bank_accounts')
          .select('plaid_account_id')
          .eq('connection_id', connection.id);

        const existingIds = new Set(existingAccounts?.map(a => a.plaid_account_id) || []);

        // Insert new accounts
        const newAccounts = accounts.filter(a => !existingIds.has(a.accountId));
        if (newAccounts.length > 0) {
          await supabase
            .from('bank_accounts')
            .insert(newAccounts.map(account => ({
              connection_id: connection.id,
              user_id: connection.user_id,
              plaid_account_id: account.accountId,
              name: account.name,
              official_name: account.officialName,
              mask: account.mask,
              type: account.type,
              subtype: account.subtype,
              current_balance: account.balances.current,
              available_balance: account.balances.available,
              credit_limit: account.balances.limit,
              currency: account.balances.isoCurrencyCode || 'USD',
              is_active: true,
              balance_last_updated: new Date().toISOString(),
            })));
        }
      } catch (err) {
        logger.error('Failed to add new accounts', { error: err });
      }
      break;

    default:
      logger.info('Unhandled item webhook', { webhookCode });
  }
}
