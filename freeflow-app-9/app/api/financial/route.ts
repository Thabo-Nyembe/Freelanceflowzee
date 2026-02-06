/**
 * Financial API Routes
 *
 * REST endpoints for Financial Management:
 * GET - List transactions, insights, goals, invoices, overview, analytics
 * POST - Create transaction, insight, goal, invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('financial')
