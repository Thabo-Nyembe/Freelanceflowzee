/**
 * System Insights API - Single Resource Routes
 *
 * PUT - Resolve error, acknowledge alert, resolve alert
 * DELETE - Currently no delete operations needed for system insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('system-insights')
