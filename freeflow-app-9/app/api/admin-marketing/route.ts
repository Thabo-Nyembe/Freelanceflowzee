/**
 * Admin Marketing API Routes
 *
 * REST endpoints for Admin Marketing:
 * GET - Leads, campaigns, campaign goals, campaign metrics, email campaigns, stats, dashboard
 * POST - Create leads, campaigns, goals, metrics, email campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-marketing')
