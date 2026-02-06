/**
 * Time Tracking API Routes
 *
 * REST endpoints for Time Tracking feature:
 * GET - List time entries, get summary, get running entry
 * POST - Create time entry, start timer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('time-tracking')
