/**
 * Billing Settings API Routes
 *
 * REST endpoints for Billing Settings:
 * GET - Subscriptions, payment methods, addresses, invoices, transactions, usage, credits, stats
 * POST - Create subscription, payment method, address, invoice, transaction, usage, credit
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('billing-settings')
