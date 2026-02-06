/**
 * Lead Generation API Routes
 *
 * REST endpoints for Lead Generation:
 * GET - List leads, campaigns, landing pages, forms, stats
 * POST - Create lead, campaign, landing page, form, submission
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('lead-generation')
