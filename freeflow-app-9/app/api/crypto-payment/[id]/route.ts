/**
 * Crypto Payment API - Single Resource Routes
 *
 * GET - Get single wallet, transaction, payment link by code
 * PUT - Update wallet, transaction status, payment link, recurring payment
 * DELETE - Delete wallet, payment link
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('crypto-payment')
