/**
 * AI Settings API - Single Resource Routes
 *
 * GET - Get single provider, model
 * PUT - Update provider, model, feature, API key, preferences, status, budget, rate limits
 * DELETE - Delete provider, feature, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-settings')
