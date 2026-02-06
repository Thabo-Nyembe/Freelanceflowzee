/**
 * System Insights API Routes
 *
 * REST endpoints for System Monitoring:
 * GET - Metrics, performance logs, error logs, health, resources, API performance, alerts, dashboard
 * POST - Log metrics, performance, errors, create alerts, update resource usage, update health
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('system-insights')
