/**
 * Crypto Payment API Routes
 *
 * REST endpoints for Cryptocurrency Payments:
 * GET - List wallets, transactions, prices, payment links, recurring payments, analytics
 * POST - Create wallet, transaction, payment link, recurring payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('crypto-payment')
