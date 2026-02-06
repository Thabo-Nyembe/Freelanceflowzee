/**
 * AI Business API - Single Resource Routes
 *
 * GET - Get single analysis, insight, recommendation, session, forecast
 * PUT - Update analysis, insight, recommendation, session, forecast
 * DELETE - Delete analysis, insight, recommendation, session, forecast
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-business')
