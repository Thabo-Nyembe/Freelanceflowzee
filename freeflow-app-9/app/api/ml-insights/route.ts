/**
 * ML Insights API Routes
 *
 * REST endpoints for ML Insights:
 * GET - Insights, models, predictions, anomalies, patterns, recommendations, alerts, stats
 * POST - Create insights, models, predictions, anomalies, patterns, recommendations, alerts, actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ml-insights')
