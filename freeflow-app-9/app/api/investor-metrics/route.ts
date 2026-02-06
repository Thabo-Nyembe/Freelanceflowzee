/**
 * Investor Metrics API Routes
 *
 * REST endpoints for Investor Metrics:
 * GET - List metrics, health snapshots, cohorts, projections, competitors, board decks, trends, stats
 * POST - Create metric, health snapshot, cohort, projection, competitor, board deck
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('investor-metrics')
