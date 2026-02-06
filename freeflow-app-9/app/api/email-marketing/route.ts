/**
 * Email Marketing API Routes
 *
 * REST endpoints for Email Marketing:
 * GET - List campaigns, subscribers, segments, templates, automations, stats
 * POST - Create campaign, subscriber, segment, template, automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('email-marketing')
