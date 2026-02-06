/**
 * Integrations Management API - Single Resource Routes
 *
 * GET - Get single template, listing, health check
 * PUT - Update template, listing, rate limit, health check, dependency
 * DELETE - Delete template, listing, dependency, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('integrations-management')
