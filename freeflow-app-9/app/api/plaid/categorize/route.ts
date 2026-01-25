/**
 * Transaction Categorization API - FreeFlow A+++ Implementation
 * AI-powered categorization endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';
import {
  categorizeTransaction,
  processCategorizationFeedback,
  recategorizeUncategorized,
} from '@/lib/ai/categorization-service';

const logger = createFeatureLogger('plaid-api');

// POST - Categorize transaction(s) or process feedback
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

    const body = await request.json();
    const { action, transactionId, transactionIds, feedback } = body;

    switch (action) {
      case 'categorize': {
        // Categorize specific transaction(s)
        if (transactionId) {
          // Single transaction
          const { data: transaction } = await supabase
            .from('bank_transactions')
            .select('*')
            .eq('id', transactionId)
            .eq('user_id', user.id)
            .single();

          if (!transaction) {
            return NextResponse.json(
              { error: 'Transaction not found' },
              { status: 404 }
            );
          }

          const result = await categorizeTransaction(transaction, user.id);
          return NextResponse.json({ success: true, data: result });
        }

        if (transactionIds && Array.isArray(transactionIds)) {
          // Multiple transactions
          const { data: transactions } = await supabase
            .from('bank_transactions')
            .select('*')
            .in('id', transactionIds)
            .eq('user_id', user.id);

          if (!transactions || transactions.length === 0) {
            return NextResponse.json(
              { error: 'No transactions found' },
              { status: 404 }
            );
          }

          const results = await Promise.all(
            transactions.map(tx => categorizeTransaction(tx, user.id))
          );

          return NextResponse.json({
            success: true,
            data: {
              results,
              summary: {
                processed: results.length,
                categorized: results.filter(r => r.categoryId).length,
              },
            },
          });
        }

        return NextResponse.json(
          { error: 'Transaction ID(s) required' },
          { status: 400 }
        );
      }

      case 'feedback': {
        // Process user feedback on categorization
        if (!feedback || !transactionId) {
          return NextResponse.json(
            { error: 'Feedback and transaction ID required' },
            { status: 400 }
          );
        }

        await processCategorizationFeedback(
          transactionId,
          user.id,
          feedback.accepted,
          feedback.correctedCategoryId
        );

        return NextResponse.json({
          success: true,
          message: 'Feedback processed',
        });
      }

      case 'recategorize-all': {
        // Recategorize all uncategorized transactions
        const result = await recategorizeUncategorized(user.id);

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Categorization error', { error });
    return NextResponse.json(
      { error: 'Categorization failed' },
      { status: 500 }
    );
  }
}

// GET - Get categorization rules and categories
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
    const type = searchParams.get('type') || 'categories';

    if (type === 'rules') {
      // Get user's categorization rules
      const { data: rules, error } = await supabase
        .from('categorization_rules')
        .select(`
          *,
          category:transaction_categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch rules' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: rules || [],
      });
    }

    if (type === 'stats') {
      // Get categorization statistics
      const { data: stats } = await supabase.rpc('get_categorization_stats', {
        p_user_id: user.id,
      });

      return NextResponse.json({
        success: true,
        data: stats || {},
      });
    }

    // Default: Get categories
    const { data: categories, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .or(`is_system.eq.true,user_id.eq.${user.id}`)
      .order('name');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Build hierarchy
    const rootCategories = categories?.filter(c => !c.parent_id) || [];
    const hierarchy = rootCategories.map(parent => ({
      ...parent,
      children: categories?.filter(c => c.parent_id === parent.id) || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: categories || [],
        hierarchy,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch categorization data', { error });
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
