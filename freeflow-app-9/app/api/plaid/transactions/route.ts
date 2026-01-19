/**
 * Bank Transactions API - FreeFlow A+++ Implementation
 * Complete transaction management with filtering, search, and categorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Query params schema
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  accountId: z.string().optional(),
  connectionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  category: z.string().optional(),
  status: z.enum(['pending', 'posted', 'cancelled']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'name']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  reconciliationStatus: z.enum(['unreconciled', 'matched', 'confirmed', 'excluded']).optional(),
});

// GET - List transactions with advanced filtering
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    // Build query
    let query = supabase
      .from('bank_transactions')
      .select(`
        *,
        account:bank_accounts!inner(
          id,
          name,
          mask,
          type,
          connection:bank_connections(
            id,
            institution_name
          )
        ),
        category:transaction_categories(
          id,
          name,
          icon,
          color,
          parent:transaction_categories(id, name)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (params.accountId) {
      query = query.eq('account_id', params.accountId);
    }

    if (params.connectionId) {
      query = query.eq('account.connection_id', params.connectionId);
    }

    if (params.startDate) {
      query = query.gte('date', params.startDate);
    }

    if (params.endDate) {
      query = query.lte('date', params.endDate);
    }

    if (params.minAmount !== undefined) {
      query = query.gte('amount', params.minAmount);
    }

    if (params.maxAmount !== undefined) {
      query = query.lte('amount', params.maxAmount);
    }

    if (params.category) {
      query = query.eq('category_id', params.category);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.reconciliationStatus) {
      query = query.eq('reconciliation_status', params.reconciliationStatus);
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,merchant_name.ilike.%${params.search}%`);
    }

    // Apply sorting
    const sortColumn = params.sortBy === 'date' ? 'date' : params.sortBy === 'amount' ? 'amount' : 'name';
    query = query.order(sortColumn, { ascending: params.sortOrder === 'asc' });

    // Apply pagination
    const offset = (params.page - 1) * params.pageSize;
    query = query.range(offset, offset + params.pageSize - 1);

    const { data: transactions, count, error } = await query;

    if (error) {
      console.error('Failed to fetch transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Get summary stats
    const summary = await getTransactionSummary(supabase, user.id, params);

    return NextResponse.json({
      success: true,
      data: transactions || [],
      pagination: {
        total: count || 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil((count || 0) / params.pageSize),
      },
      summary,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// PATCH - Update transaction (categorize, reconcile, etc.)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const {
      transactionIds,
      categoryId,
      notes,
      tags,
      reconciliationStatus,
      matchedInvoiceId,
      matchedExpenseId,
      isExcluded,
      createRule, // If true, create a categorization rule from this
    } = body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json(
        { error: 'Transaction IDs are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (categoryId !== undefined) {
      updateData.category_id = categoryId;
      updateData.categorization_source = 'user';
      updateData.user_category_override = true;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    if (reconciliationStatus !== undefined) {
      updateData.reconciliation_status = reconciliationStatus;
      if (reconciliationStatus === 'confirmed') {
        updateData.reconciled_at = new Date().toISOString();
      }
    }

    if (matchedInvoiceId !== undefined) {
      updateData.matched_invoice_id = matchedInvoiceId;
    }

    if (matchedExpenseId !== undefined) {
      updateData.matched_expense_id = matchedExpenseId;
    }

    if (isExcluded !== undefined) {
      updateData.is_excluded = isExcluded;
    }

    // Update transactions
    const { data: updated, error } = await supabase
      .from('bank_transactions')
      .update(updateData)
      .in('id', transactionIds)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Failed to update transactions:', error);
      return NextResponse.json(
        { error: 'Failed to update transactions' },
        { status: 500 }
      );
    }

    // Create categorization rule if requested
    if (createRule && categoryId && updated && updated.length > 0) {
      const transaction = updated[0];
      await supabase
        .from('categorization_rules')
        .insert({
          user_id: user.id,
          rule_name: `Rule for ${transaction.merchant_name || transaction.name}`,
          match_type: 'merchant_exact',
          match_value: transaction.merchant_name || transaction.name,
          category_id: categoryId,
          is_active: true,
          priority: 50,
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: updated?.length || 0,
      },
    });
  } catch (error) {
    console.error('Failed to update transactions:', error);
    return NextResponse.json(
      { error: 'Failed to update transactions' },
      { status: 500 }
    );
  }
}

// Helper function to get transaction summary
async function getTransactionSummary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  params: z.infer<typeof querySchema>
) {
  // Build base filter
  let query = supabase
    .from('bank_transactions')
    .select('amount, date, status')
    .eq('user_id', userId)
    .eq('status', 'posted');

  if (params.startDate) {
    query = query.gte('date', params.startDate);
  }

  if (params.endDate) {
    query = query.lte('date', params.endDate);
  }

  if (params.accountId) {
    query = query.eq('account_id', params.accountId);
  }

  const { data: transactions } = await query;

  if (!transactions) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netFlow: 0,
      transactionCount: 0,
    };
  }

  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netFlow: income - expenses,
    transactionCount: transactions.length,
  };
}
