/**
 * Admin Analytics API Routes
 *
 * REST endpoints for Admin Analytics:
 * GET - Revenue data, conversion funnels, traffic sources, insights, metrics, reports, dashboard
 * POST - Create revenue records, insights, metrics, reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-analytics')
