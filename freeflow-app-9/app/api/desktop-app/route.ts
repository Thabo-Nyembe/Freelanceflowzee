/**
 * Desktop App API Routes
 *
 * REST endpoints for Desktop App Management:
 * GET - List projects, builds, distributions, frameworks, analytics, stats
 * POST - Create project, build, distribution, track event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
