/**
 * Email Agent Setup API Routes
 *
 * REST endpoints for Email Agent Setup Wizard:
 * GET - Setup progress, integrations, configs (email/AI/calendar/payment/SMS/CRM), templates, stats
 * POST - Create progress, integrations, configs, test results
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('email-agent-setup')
