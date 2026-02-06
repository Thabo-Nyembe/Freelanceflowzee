/**
 * Advanced Analytics API Routes
 *
 * REST endpoints for Advanced Analytics:
 * GET - Metrics, dashboards, widgets, reports, funnels, insights, goals, cohorts, segments, stats
 * POST - Create metrics, dashboards, widgets, filters, reports, funnels, insights, goals, cohorts, segments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('advanced-analytics')
