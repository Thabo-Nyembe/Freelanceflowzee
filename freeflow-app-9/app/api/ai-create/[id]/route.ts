/**
 * AI Create API - Single Resource Routes
 *
 * GET - Get single asset
 * PUT - Update asset, generation status, toggle favorite
 * DELETE - Delete asset, generation, favorite, model comparison
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
