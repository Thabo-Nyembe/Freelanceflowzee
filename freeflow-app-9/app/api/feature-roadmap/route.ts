/**
 * Feature Roadmap API Routes
 *
 * REST endpoints for Feature Roadmap:
 * GET - List features, requests, votes, subscriptions, updates, stats
 * POST - Create request, vote, subscribe, create update
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('feature-roadmap')
