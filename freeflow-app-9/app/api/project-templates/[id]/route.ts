/**
 * Project Templates API - Single Resource Routes
 *
 * GET - Get single template, by slug, complete template with all data
 * PUT - Update template, task, milestone, deliverable, pricing, duplicate
 * DELETE - Delete template, task, milestone, deliverable, pricing, favorite
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DEMO_USER_ID, isDemoMode } from '@/lib/demo-auth'

const logger = createSimpleLogger('project-templates-id')
