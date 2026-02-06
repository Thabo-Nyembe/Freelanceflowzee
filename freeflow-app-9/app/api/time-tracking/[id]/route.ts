/**
 * Time Tracking API - Single Resource Routes
 *
 * GET - Get single time entry
 * PUT - Update, stop, pause, resume time entry
 * DELETE - Delete time entry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('time-tracking')
