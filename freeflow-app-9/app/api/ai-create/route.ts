/**
 * AI Create API Routes
 *
 * REST endpoints for AI Create:
 * GET - List assets, generations, preferences, favorites, stats
 * POST - Create asset, generation, preferences, add favorite, compare models
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
