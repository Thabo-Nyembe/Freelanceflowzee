/**
 * AI Settings API Routes
 *
 * REST endpoints for AI Settings:
 * GET - Providers, models, features, usage records, API keys, usage stats, preferences
 * POST - Create provider, model, feature, usage record, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-settings')
