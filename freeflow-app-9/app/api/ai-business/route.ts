/**
 * AI Business API Routes
 *
 * REST endpoints for AI Business Advisory:
 * GET - Project analyses, business insights, pricing recommendations, advisory sessions, session messages, growth forecasts, stats
 * POST - Create analyses, insights, recommendations, sessions, messages, forecasts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-business')
