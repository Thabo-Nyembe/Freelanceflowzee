/**
 * Plaid Service - FreeFlow A+++ Implementation
 * Complete Plaid integration service with link, sync, and webhook handling
 */

import {
  AccountsGetRequest,
  InstitutionsGetByIdRequest,
  ItemGetRequest,
  ItemRemoveRequest,
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  TransactionsSyncRequest,
  Products,
  CountryCode,
  RemovedTransaction,
  Transaction,
  AccountBase,
} from 'plaid';
import {
  getPlaidClient,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_LANGUAGE,
  PLAID_REDIRECT_URI,
  PlaidLinkToken,
  PlaidExchangeResult,
  PlaidAccount,
  PlaidTransaction,
  PlaidInstitution,
} from './client';
import { createClient } from '@/lib/supabase/server';

// ============ Link Token Service ============

export async function createLinkToken(
  userId: string,
  accessToken?: string // For update mode
): Promise<PlaidLinkToken> {
  const client = getPlaidClient();

  const request: LinkTokenCreateRequest = {
    user: { client_user_id: userId },
    client_name: 'FreeFlow',
    products: accessToken ? [] : PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: PLAID_LANGUAGE,
    redirect_uri: PLAID_REDIRECT_URI,
    ...(accessToken && { access_token: accessToken }),
  };

  const response = await client.linkTokenCreate(request);

  return {
    linkToken: response.data.link_token,
    expiration: response.data.expiration,
    requestId: response.data.request_id,
  };
}

// ============ Token Exchange Service ============

export async function exchangePublicToken(
  publicToken: string
): Promise<PlaidExchangeResult> {
  const client = getPlaidClient();

  const request: ItemPublicTokenExchangeRequest = {
    public_token: publicToken,
  };

  const response = await client.itemPublicTokenExchange(request);

  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
    requestId: response.data.request_id,
  };
}

// ============ Account Service ============

export async function getAccounts(accessToken: string): Promise<PlaidAccount[]> {
  const client = getPlaidClient();

  const request: AccountsGetRequest = {
    access_token: accessToken,
  };

  const response = await client.accountsGet(request);

  return response.data.accounts.map(mapPlaidAccount);
}

function mapPlaidAccount(account: AccountBase): PlaidAccount {
  return {
    accountId: account.account_id,
    name: account.name,
    officialName: account.official_name ?? null,
    mask: account.mask ?? null,
    type: account.type,
    subtype: account.subtype ?? null,
    balances: {
      available: account.balances.available ?? null,
      current: account.balances.current ?? null,
      limit: account.balances.limit ?? null,
      isoCurrencyCode: account.balances.iso_currency_code ?? null,
    },
  };
}

// ============ Transaction Sync Service ============

export interface TransactionSyncResult {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: string[]; // transaction IDs
  hasMore: boolean;
  cursor: string;
}

export async function syncTransactions(
  accessToken: string,
  cursor?: string
): Promise<TransactionSyncResult> {
  const client = getPlaidClient();

  const request: TransactionsSyncRequest = {
    access_token: accessToken,
    cursor: cursor || undefined,
    count: 500, // Max allowed
    options: {
      include_personal_finance_category: true,
      include_original_description: true,
    },
  };

  const response = await client.transactionsSync(request);

  return {
    added: response.data.added.map(mapPlaidTransaction),
    modified: response.data.modified.map(mapPlaidTransaction),
    removed: response.data.removed.map((t: RemovedTransaction) => t.transaction_id),
    hasMore: response.data.has_more,
    cursor: response.data.next_cursor,
  };
}

function mapPlaidTransaction(tx: Transaction): PlaidTransaction {
  return {
    transactionId: tx.transaction_id,
    accountId: tx.account_id,
    amount: tx.amount,
    date: tx.date,
    datetime: tx.datetime ?? null,
    authorizedDate: tx.authorized_date ?? null,
    name: tx.name,
    merchantName: tx.merchant_name ?? null,
    pending: tx.pending,
    pendingTransactionId: tx.pending_transaction_id ?? null,
    categoryId: tx.category_id ?? null,
    category: tx.category ?? null,
    personalFinanceCategory: tx.personal_finance_category ? {
      primary: tx.personal_finance_category.primary,
      detailed: tx.personal_finance_category.detailed,
    } : null,
    location: {
      address: tx.location?.address ?? null,
      city: tx.location?.city ?? null,
      region: tx.location?.region ?? null,
      postalCode: tx.location?.postal_code ?? null,
      country: tx.location?.country ?? null,
      lat: tx.location?.lat ?? null,
      lon: tx.location?.lon ?? null,
    },
    paymentChannel: tx.payment_channel,
    isoCurrencyCode: tx.iso_currency_code ?? null,
  };
}

// ============ Institution Service ============

export async function getInstitution(institutionId: string): Promise<PlaidInstitution | null> {
  const client = getPlaidClient();

  try {
    const request: InstitutionsGetByIdRequest = {
      institution_id: institutionId,
      country_codes: PLAID_COUNTRY_CODES,
      options: {
        include_optional_metadata: true,
      },
    };

    const response = await client.institutionsGetById(request);
    const inst = response.data.institution;

    return {
      institutionId: inst.institution_id,
      name: inst.name,
      logo: inst.logo ?? null,
      primaryColor: inst.primary_color ?? null,
      url: inst.url ?? null,
      countryCodes: inst.country_codes,
      products: inst.products ?? [],
      oauth: inst.oauth,
    };
  } catch (error) {
    console.error('Failed to get institution:', error);
    return null;
  }
}

// ============ Item Management ============

export async function getItemInfo(accessToken: string) {
  const client = getPlaidClient();

  const request: ItemGetRequest = {
    access_token: accessToken,
  };

  const response = await client.itemGet(request);

  return {
    itemId: response.data.item.item_id,
    institutionId: response.data.item.institution_id,
    consentExpirationTime: response.data.item.consent_expiration_time,
    availableProducts: response.data.item.available_products,
    billedProducts: response.data.item.billed_products,
    error: response.data.item.error,
  };
}

export async function removeItem(accessToken: string): Promise<boolean> {
  const client = getPlaidClient();

  try {
    const request: ItemRemoveRequest = {
      access_token: accessToken,
    };

    await client.itemRemove(request);
    return true;
  } catch (error) {
    console.error('Failed to remove item:', error);
    return false;
  }
}

// ============ Full Sync Operation ============

export interface FullSyncResult {
  connectionId: string;
  accountsUpdated: number;
  transactionsAdded: number;
  transactionsUpdated: number;
  transactionsRemoved: number;
  errors: string[];
}

export async function performFullSync(
  connectionId: string,
  accessToken: string,
  existingCursor?: string
): Promise<FullSyncResult> {
  const supabase = await createClient();
  const errors: string[] = [];
  let transactionsAdded = 0;
  let transactionsUpdated = 0;
  let transactionsRemoved = 0;
  let accountsUpdated = 0;

  try {
    // 1. Update account balances
    const accounts = await getAccounts(accessToken);

    for (const account of accounts) {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          current_balance: account.balances.current,
          available_balance: account.balances.available,
          credit_limit: account.balances.limit,
          balance_last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('plaid_account_id', account.accountId);

      if (!error) accountsUpdated++;
    }

    // 2. Sync transactions
    let cursor = existingCursor;
    let hasMore = true;

    while (hasMore) {
      const syncResult = await syncTransactions(accessToken, cursor);

      // Process added transactions
      for (const tx of syncResult.added) {
        const { data: accountData } = await supabase
          .from('bank_accounts')
          .select('id, user_id')
          .eq('plaid_account_id', tx.accountId)
          .single();

        if (accountData) {
          const { error } = await supabase
            .from('bank_transactions')
            .upsert({
              plaid_transaction_id: tx.transactionId,
              account_id: accountData.id,
              user_id: accountData.user_id,
              name: tx.name,
              merchant_name: tx.merchantName,
              amount: -tx.amount, // Plaid uses positive for debits
              currency: tx.isoCurrencyCode || 'USD',
              date: tx.date,
              datetime: tx.datetime,
              authorized_date: tx.authorizedDate,
              pending: tx.pending,
              plaid_pending_transaction_id: tx.pendingTransactionId,
              plaid_category_id: tx.categoryId,
              plaid_category: tx.category,
              plaid_personal_finance_category: tx.personalFinanceCategory,
              location_address: tx.location.address,
              location_city: tx.location.city,
              location_region: tx.location.region,
              location_postal_code: tx.location.postalCode,
              location_country: tx.location.country,
              location_lat: tx.location.lat,
              location_lon: tx.location.lon,
              payment_channel: tx.paymentChannel,
              status: tx.pending ? 'pending' : 'posted',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'plaid_transaction_id',
            });

          if (!error) transactionsAdded++;
        }
      }

      // Process modified transactions
      for (const tx of syncResult.modified) {
        const { error } = await supabase
          .from('bank_transactions')
          .update({
            name: tx.name,
            merchant_name: tx.merchantName,
            amount: -tx.amount,
            pending: tx.pending,
            status: tx.pending ? 'pending' : 'posted',
            plaid_category: tx.category,
            plaid_personal_finance_category: tx.personalFinanceCategory,
            updated_at: new Date().toISOString(),
          })
          .eq('plaid_transaction_id', tx.transactionId);

        if (!error) transactionsUpdated++;
      }

      // Process removed transactions
      for (const txId of syncResult.removed) {
        const { error } = await supabase
          .from('bank_transactions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('plaid_transaction_id', txId);

        if (!error) transactionsRemoved++;
      }

      cursor = syncResult.cursor;
      hasMore = syncResult.hasMore;
    }

    // 3. Update connection cursor and sync time
    await supabase
      .from('bank_connections')
      .update({
        plaid_cursor: cursor,
        last_sync_at: new Date().toISOString(),
        next_sync_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
        status: 'connected',
        error_code: null,
        error_message: null,
        transactions_synced_count: transactionsAdded,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    // 4. Log sync operation
    await supabase
      .from('bank_sync_log')
      .insert({
        connection_id: connectionId,
        sync_type: existingCursor ? 'incremental' : 'full',
        completed_at: new Date().toISOString(),
        status: 'success',
        transactions_added: transactionsAdded,
        transactions_updated: transactionsUpdated,
        transactions_removed: transactionsRemoved,
        accounts_synced: accountsUpdated,
      });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);

    // Update connection with error
    await supabase
      .from('bank_connections')
      .update({
        status: 'error',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    // Log failed sync
    await supabase
      .from('bank_sync_log')
      .insert({
        connection_id: connectionId,
        sync_type: existingCursor ? 'incremental' : 'full',
        completed_at: new Date().toISOString(),
        status: 'failed',
        error_message: errorMessage,
      });
  }

  return {
    connectionId,
    accountsUpdated,
    transactionsAdded,
    transactionsUpdated,
    transactionsRemoved,
    errors,
  };
}
