/**
 * Advanced Analytics API - Single Resource Routes
 *
 * GET - Get single metric, dashboard, widget, report, goal
 * PUT - Update metric, dashboard, widget, filter, report, funnel stage, insight, goal, cohort, segment
 * DELETE - Delete metric, dashboard, widget, filter, report, funnel stage, insight, goal, cohort, segment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('advanced-analytics')
