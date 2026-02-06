/**
 * ML Insights API - Single Resource Routes
 *
 * PUT - Update model, resolve anomaly, dismiss recommendation, update action status, acknowledge/delete alert
 * DELETE - Delete insight, model, anomaly, pattern, recommendation, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ml-insights')
