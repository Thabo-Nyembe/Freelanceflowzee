/**
 * Integrations Management API Routes
 *
 * REST endpoints for Integration Templates, Marketplace, Rate Limits, Health:
 * GET - Templates, marketplace listings, rate limits, health checks, dependencies, stats
 * POST - Create templates, listings, rate limits, health checks, dependencies
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('integrations-management')
