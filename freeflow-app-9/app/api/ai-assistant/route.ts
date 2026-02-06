/**
 * AI Assistant API Routes
 *
 * REST endpoints for AI Assistant feature:
 * GET - List conversations or get stats
 * POST - Create conversation, message, or insight
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/demo-auth'

const logger = createSimpleLogger('ai-assistant')
