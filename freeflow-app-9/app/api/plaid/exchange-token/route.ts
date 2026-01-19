/**
 * Plaid Exchange Token API - FreeFlow A+++ Implementation
 * Exchanges public token for access token and creates bank connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  exchangePublicToken,
  getAccounts,
  getItemInfo,
  getInstitution,
  performFullSync
} from '@/lib/plaid/service';

const exchangeTokenSchema = z.object({
  publicToken: z.string().min(1, 'Public token is required'),
  institutionId: z.string().optional(),
  institutionName: z.string().optional(),
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    mask: z.string().optional(),
    type: z.string(),
    subtype: z.string().optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = exchangeTokenSchema.parse(body);

    // Exchange public token for access token
    const exchangeResult = await exchangePublicToken(validatedData.publicToken);

    // Get item info from Plaid
    const itemInfo = await getItemInfo(exchangeResult.accessToken);

    // Get or create institution
    let institutionId = validatedData.institutionId || itemInfo.institutionId;
    let institutionData = null;

    if (institutionId) {
      // Check if institution exists in our database
      const { data: existingInst } = await supabase
        .from('bank_institutions')
        .select('*')
        .eq('plaid_institution_id', institutionId)
        .single();

      if (existingInst) {
        institutionData = existingInst;
      } else {
        // Fetch from Plaid and create
        const plaidInst = await getInstitution(institutionId);
        if (plaidInst) {
          const { data: newInst } = await supabase
            .from('bank_institutions')
            .insert({
              plaid_institution_id: plaidInst.institutionId,
              name: plaidInst.name,
              logo_url: plaidInst.logo,
              primary_color: plaidInst.primaryColor,
              website_url: plaidInst.url,
              country_codes: plaidInst.countryCodes,
              products_supported: plaidInst.products,
              oauth_supported: plaidInst.oauth,
            })
            .select()
            .single();
          institutionData = newInst;
        }
      }
    }

    // Create bank connection
    const { data: connection, error: connError } = await supabase
      .from('bank_connections')
      .insert({
        user_id: user.id,
        institution_id: institutionData?.id,
        plaid_item_id: exchangeResult.itemId,
        plaid_access_token: exchangeResult.accessToken,
        institution_name: validatedData.institutionName || institutionData?.name || 'Unknown Institution',
        consent_expiration_time: itemInfo.consentExpirationTime,
        status: 'connected',
        products_enabled: itemInfo.billedProducts,
      })
      .select()
      .single();

    if (connError) {
      console.error('Failed to create connection:', connError);
      return NextResponse.json(
        { error: 'Failed to create bank connection' },
        { status: 500 }
      );
    }

    // Get accounts from Plaid
    const plaidAccounts = await getAccounts(exchangeResult.accessToken);

    // Create bank accounts in database
    const accountsToInsert = plaidAccounts.map(account => ({
      connection_id: connection.id,
      user_id: user.id,
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
    }));

    const { data: accounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .insert(accountsToInsert)
      .select();

    if (accountsError) {
      console.error('Failed to create accounts:', accountsError);
    }

    // Trigger initial sync in background (don't wait)
    performFullSync(connection.id, exchangeResult.accessToken)
      .then(result => {
        console.log('Initial sync completed:', result);
      })
      .catch(err => {
        console.error('Initial sync failed:', err);
      });

    return NextResponse.json({
      success: true,
      data: {
        connection: {
          id: connection.id,
          institutionName: connection.institution_name,
          status: connection.status,
        },
        accounts: accounts?.map(acc => ({
          id: acc.id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
          currentBalance: acc.current_balance,
          availableBalance: acc.available_balance,
        })) || [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to exchange token:', error);
    return NextResponse.json(
      { error: 'Failed to complete bank connection' },
      { status: 500 }
    );
  }
}
