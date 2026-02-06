/**
 * Investor Metrics API - Single Resource Routes
 *
 * GET - Get single metric, board deck
 * PUT - Update metric, cohort, projection, competitor, board deck
 * DELETE - Delete metric, health snapshot, cohort, projection, competitor, board deck
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('investor-metrics')
