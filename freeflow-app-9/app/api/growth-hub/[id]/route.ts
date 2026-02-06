/**
 * Growth Hub API - Single Resource Routes
 *
 * GET - Get single strategy, plan
 * PUT - Update strategy, quick win, plan, milestone, KPI, action, metric
 * DELETE - Delete strategy, quick win, plan, milestone, KPI, action
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DEMO_USER_ID, isDemoMode } from '@/lib/demo-auth'

const logger = createSimpleLogger('growth-hub')
