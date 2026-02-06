/**
 * Billing Settings API - Single Resource Routes
 *
 * GET - Get single subscription, invoice, transaction
 * PUT - Update subscription, payment method, billing address, invoice, transaction, usage
 * DELETE - Delete payment method, billing address
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('billing-settings')
