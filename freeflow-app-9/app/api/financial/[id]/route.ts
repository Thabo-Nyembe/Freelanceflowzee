/**
 * Financial API - Single Resource Routes
 *
 * GET - Get single transaction, invoice, goal
 * PUT - Update transaction, invoice, goal, insight status
 * DELETE - Delete transaction, invoice, goal
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('financial')
