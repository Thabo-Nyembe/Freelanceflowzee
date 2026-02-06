/**
 * Projects Hub API - Single Resource Routes
 *
 * GET - Get single project
 * PUT - Update project, toggle star/pin, update status/progress
 * DELETE - Delete project, template, import
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('projects-hub')
