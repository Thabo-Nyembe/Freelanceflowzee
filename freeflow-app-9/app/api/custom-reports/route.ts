/**
 * Custom Reports API Routes
 *
 * REST endpoints for Custom Reports:
 * GET - List reports, templates, widgets, filters, shares, schedules, exports, stats
 * POST - Create report, widget, filter, share, schedule, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('custom-reports')
