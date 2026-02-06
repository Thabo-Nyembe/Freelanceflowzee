/**
 * Mobile App API Routes
 *
 * REST endpoints for Mobile App Management:
 * GET - List devices, screens, builds, templates, tests, stats
 * POST - Create device, screen, build, template, test
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('mobile-app')
