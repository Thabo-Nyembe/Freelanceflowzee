/**
 * Email Agent Setup API - Single Resource Routes
 *
 * GET - Get single integration, config
 * PUT - Update integration, configs, connect/disconnect
 * DELETE - Delete integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('email-agent-setup')
