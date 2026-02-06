/**
 * AI Assistant API - Single Resource Routes
 *
 * GET - Get single conversation with messages
 * PUT - Update conversation
 * DELETE - Delete conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/demo-auth'

const logger = createSimpleLogger('ai-assistant')
