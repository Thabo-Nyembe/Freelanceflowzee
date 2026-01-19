/**
 * AI Categorization Service - FreeFlow A+++ Implementation
 * Intelligent transaction categorization using rules, patterns, and AI
 */

import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Types
interface Transaction {
  id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  date: string;
  plaid_category: string[] | null;
  plaid_personal_finance_category: {
    primary: string;
    detailed: string;
  } | null;
  payment_channel: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  keywords: string[] | null;
}

interface CategorizationRule {
  id: string;
  match_type: 'merchant_exact' | 'merchant_contains' | 'name_contains' | 'amount_range' | 'regex';
  match_value: string;
  match_amount_min: number | null;
  match_amount_max: number | null;
  category_id: string;
  priority: number;
}

interface CategorizationResult {
  transactionId: string;
  categoryId: string | null;
  source: 'rule' | 'plaid' | 'ai' | 'default';
  confidence: number;
  alternativeCategories?: Array<{
    categoryId: string;
    confidence: number;
  }>;
}

// OpenAI client (lazy initialized)
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// ============ Main Categorization Functions ============

/**
 * Categorize a single transaction using the full categorization pipeline
 */
export async function categorizeTransaction(
  transaction: Transaction,
  userId: string
): Promise<CategorizationResult> {
  const supabase = await createClient();

  // 1. Try user-defined rules first (highest priority)
  const ruleResult = await applyUserRules(supabase, transaction, userId);
  if (ruleResult) {
    await logCategorization(supabase, transaction.id, ruleResult, userId);
    return ruleResult;
  }

  // 2. Try Plaid's categorization if available
  const plaidResult = mapPlaidCategory(supabase, transaction);
  if (plaidResult) {
    await logCategorization(supabase, transaction.id, plaidResult, userId);
    return plaidResult;
  }

  // 3. Try AI categorization
  const aiResult = await aiCategorize(supabase, transaction, userId);
  if (aiResult) {
    await logCategorization(supabase, transaction.id, aiResult, userId);
    return aiResult;
  }

  // 4. Return uncategorized
  return {
    transactionId: transaction.id,
    categoryId: null,
    source: 'default',
    confidence: 0,
  };
}

/**
 * Batch categorize multiple transactions
 */
export async function categorizeTransactions(
  transactions: Transaction[],
  userId: string
): Promise<CategorizationResult[]> {
  // Process in parallel with concurrency limit
  const BATCH_SIZE = 10;
  const results: CategorizationResult[] = [];

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(tx => categorizeTransaction(tx, userId))
    );
    results.push(...batchResults);
  }

  return results;
}

// ============ Rule-Based Categorization ============

async function applyUserRules(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transaction: Transaction,
  userId: string
): Promise<CategorizationResult | null> {
  // Fetch user's active rules, ordered by priority
  const { data: rules } = await supabase
    .from('categorization_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (!rules || rules.length === 0) return null;

  // Try each rule
  for (const rule of rules as CategorizationRule[]) {
    if (matchesRule(transaction, rule)) {
      return {
        transactionId: transaction.id,
        categoryId: rule.category_id,
        source: 'rule',
        confidence: 1.0, // Rules are always 100% confidence
      };
    }
  }

  return null;
}

function matchesRule(transaction: Transaction, rule: CategorizationRule): boolean {
  const merchantName = transaction.merchant_name?.toLowerCase() || '';
  const name = transaction.name.toLowerCase();
  const matchValue = rule.match_value.toLowerCase();

  switch (rule.match_type) {
    case 'merchant_exact':
      return merchantName === matchValue;

    case 'merchant_contains':
      return merchantName.includes(matchValue);

    case 'name_contains':
      return name.includes(matchValue);

    case 'amount_range':
      const amount = Math.abs(transaction.amount);
      const minOk = rule.match_amount_min === null || amount >= rule.match_amount_min;
      const maxOk = rule.match_amount_max === null || amount <= rule.match_amount_max;
      return minOk && maxOk && name.includes(matchValue);

    case 'regex':
      try {
        const regex = new RegExp(rule.match_value, 'i');
        return regex.test(merchantName) || regex.test(name);
      } catch {
        return false;
      }

    default:
      return false;
  }
}

// ============ Plaid Category Mapping ============

async function mapPlaidCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transaction: Transaction
): Promise<CategorizationResult | null> {
  if (!transaction.plaid_personal_finance_category) {
    return null;
  }

  const { primary, detailed } = transaction.plaid_personal_finance_category;

  // Map Plaid categories to our categories
  const plaidCategoryMap: Record<string, string> = {
    'INCOME': 'income',
    'TRANSFER_IN': 'transfer',
    'TRANSFER_OUT': 'transfer',
    'LOAN_PAYMENTS': 'debt-payments',
    'BANK_FEES': 'fees',
    'ENTERTAINMENT': 'entertainment',
    'FOOD_AND_DRINK': 'food-dining',
    'GENERAL_MERCHANDISE': 'shopping',
    'HOME_IMPROVEMENT': 'home',
    'MEDICAL': 'healthcare',
    'PERSONAL_CARE': 'personal',
    'GENERAL_SERVICES': 'services',
    'GOVERNMENT_AND_NON_PROFIT': 'taxes',
    'TRANSPORTATION': 'transportation',
    'TRAVEL': 'travel',
    'RENT_AND_UTILITIES': 'utilities',
  };

  const categorySlug = plaidCategoryMap[primary];
  if (!categorySlug) return null;

  // Find our category by slug
  const { data: category } = await supabase
    .from('transaction_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return null;

  return {
    transactionId: transaction.id,
    categoryId: category.id,
    source: 'plaid',
    confidence: 0.85, // Plaid is generally reliable
  };
}

// ============ AI Categorization ============

async function aiCategorize(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transaction: Transaction,
  userId: string
): Promise<CategorizationResult | null> {
  // Get all categories for AI to choose from
  const { data: categories } = await supabase
    .from('transaction_categories')
    .select('id, name, slug, keywords, parent_id')
    .eq('is_system', true);

  if (!categories || categories.length === 0) return null;

  // Get user's previous categorizations for context
  const { data: previousCategorizations } = await supabase
    .from('bank_transactions')
    .select('name, merchant_name, category_id')
    .eq('user_id', userId)
    .not('category_id', 'is', null)
    .limit(50);

  // Build context from previous categorizations
  const contextExamples = previousCategorizations
    ?.filter(p => p.merchant_name || p.name)
    .slice(0, 10)
    .map(p => `"${p.merchant_name || p.name}" -> category_id: ${p.category_id}`)
    .join('\n') || '';

  try {
    const openai = getOpenAI();

    const categoryList = categories.map(c =>
      `- ${c.id}: ${c.name} (keywords: ${c.keywords?.join(', ') || 'none'})`
    ).join('\n');

    const prompt = `Categorize this bank transaction into one of the following categories:

${categoryList}

Transaction details:
- Name: ${transaction.name}
- Merchant: ${transaction.merchant_name || 'Unknown'}
- Amount: ${transaction.amount}
- Date: ${transaction.date}
- Payment channel: ${transaction.payment_channel || 'Unknown'}

${contextExamples ? `\nUser's previous categorizations for reference:\n${contextExamples}` : ''}

Respond with JSON only:
{
  "category_id": "uuid-of-best-category",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "alternatives": [{"category_id": "uuid", "confidence": 0.0-1.0}]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a financial transaction categorization expert. Categorize transactions accurately based on merchant names, transaction descriptions, and amounts. Always respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    // Parse AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Validate category exists
    const validCategory = categories.find(c => c.id === aiResponse.category_id);
    if (!validCategory) return null;

    return {
      transactionId: transaction.id,
      categoryId: aiResponse.category_id,
      source: 'ai',
      confidence: aiResponse.confidence || 0.7,
      alternativeCategories: aiResponse.alternatives?.filter((alt: { category_id: string }) =>
        categories.some(c => c.id === alt.category_id)
      ),
    };
  } catch (error) {
    console.error('AI categorization failed:', error);
    return null;
  }
}

// ============ Logging & Learning ============

async function logCategorization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transactionId: string,
  result: CategorizationResult,
  userId: string
) {
  if (result.source === 'ai') {
    await supabase
      .from('ai_categorization_log')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        suggested_category_id: result.categoryId,
        confidence_score: result.confidence,
        alternative_categories: result.alternativeCategories,
        model_version: 'gpt-4o-mini',
      });
  }

  // Update the transaction with category
  if (result.categoryId) {
    await supabase
      .from('bank_transactions')
      .update({
        category_id: result.categoryId,
        categorization_source: result.source,
        categorization_confidence: result.confidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);
  }
}

/**
 * Process user feedback on AI categorization to improve future suggestions
 */
export async function processCategorizationFeedback(
  transactionId: string,
  userId: string,
  accepted: boolean,
  correctedCategoryId?: string
) {
  const supabase = await createClient();

  // Update the AI log
  await supabase
    .from('ai_categorization_log')
    .update({
      user_accepted: accepted,
      user_corrected_category_id: correctedCategoryId,
      feedback_at: new Date().toISOString(),
    })
    .eq('transaction_id', transactionId)
    .eq('user_id', userId);

  // If user corrected, optionally create a rule for future transactions
  if (correctedCategoryId) {
    const { data: transaction } = await supabase
      .from('bank_transactions')
      .select('merchant_name, name')
      .eq('id', transactionId)
      .single();

    if (transaction?.merchant_name) {
      // Check if rule already exists
      const { data: existingRule } = await supabase
        .from('categorization_rules')
        .select('id')
        .eq('user_id', userId)
        .eq('match_value', transaction.merchant_name)
        .eq('match_type', 'merchant_exact')
        .single();

      if (!existingRule) {
        // Create a new rule based on correction
        await supabase
          .from('categorization_rules')
          .insert({
            user_id: userId,
            rule_name: `Auto: ${transaction.merchant_name}`,
            match_type: 'merchant_exact',
            match_value: transaction.merchant_name,
            category_id: correctedCategoryId,
            is_active: true,
            priority: 60, // Higher than default AI
            auto_created: true,
          });
      }
    }
  }
}

/**
 * Recategorize all uncategorized transactions for a user
 */
export async function recategorizeUncategorized(userId: string): Promise<{
  processed: number;
  categorized: number;
}> {
  const supabase = await createClient();

  // Get uncategorized transactions
  const { data: transactions } = await supabase
    .from('bank_transactions')
    .select('id, name, merchant_name, amount, date, plaid_category, plaid_personal_finance_category, payment_channel')
    .eq('user_id', userId)
    .is('category_id', null)
    .eq('status', 'posted')
    .limit(500);

  if (!transactions || transactions.length === 0) {
    return { processed: 0, categorized: 0 };
  }

  const results = await categorizeTransactions(transactions, userId);
  const categorized = results.filter(r => r.categoryId !== null).length;

  return {
    processed: transactions.length,
    categorized,
  };
}
