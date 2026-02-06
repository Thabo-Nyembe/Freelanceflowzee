/**
 * Integrations & Webhooks API Routes
 *
 * REST endpoints for Integrations, Webhooks, API Keys, Sync Jobs:
 * GET - Integrations, webhooks, deliveries, incoming webhooks, sync jobs, API keys, stats
 * POST - Create integrations, webhooks, incoming webhooks, sync jobs, API keys, trigger webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('integrations-webhooks')
