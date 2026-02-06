/**
 * Admin Analytics API - Single Resource Routes
 *
 * PUT - Update revenue record, insight, metric, report
 * DELETE - Delete revenue record, insight, metric, report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-analytics')
