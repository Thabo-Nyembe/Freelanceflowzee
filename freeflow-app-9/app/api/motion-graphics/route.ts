/**
 * Motion Graphics API Routes
 *
 * REST endpoints for Motion Graphics:
 * GET - List projects, layers, animations, exports, stats
 * POST - Create project, layer, animation, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('motion-graphics')
