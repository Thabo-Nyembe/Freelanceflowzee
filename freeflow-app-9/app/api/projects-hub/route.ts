/**
 * Projects Hub API Routes
 *
 * REST endpoints for Projects Hub Management:
 * GET - List projects, templates, imports, sources, settings, stats
 * POST - Create project, template, import, connect source, save settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('projects-hub')
