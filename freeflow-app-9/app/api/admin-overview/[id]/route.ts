/**
 * Admin Overview API - Single Resource Routes
 *
 * PUT - Update goal progress, deal, contact, invoice, alert status, platform config
 * DELETE - Delete deal, contact, invoice, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-overview')
