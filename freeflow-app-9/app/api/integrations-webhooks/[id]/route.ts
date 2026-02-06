/**
 * Integrations & Webhooks API - Single Resource Routes
 *
 * GET - Get single integration, webhook, incoming webhook
 * PUT - Update integration, webhook, sync job, toggle, revoke
 * DELETE - Delete integration, webhook, incoming webhook, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('integrations-webhooks')
