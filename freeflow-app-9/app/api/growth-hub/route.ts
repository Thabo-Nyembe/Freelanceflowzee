/**
 * Growth Hub API Routes
 *
 * REST endpoints for Growth Hub:
 * GET - List strategies, quick wins, plans, milestones, KPIs, actions, metrics, templates, profiles, stats
 * POST - Create strategy, quick win, plan, milestone, KPI, action, metric
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DEMO_USER_ID, isDemoMode } from '@/lib/demo-auth'

const logger = createSimpleLogger('growth-hub')
