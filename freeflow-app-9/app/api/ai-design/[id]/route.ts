/**
 * AI Design Studio API - Single Resource Routes
 *
 * GET - Get single project, template, palette
 * PUT - Update project, status, variation, quality score, palette, review
 * DELETE - Delete project, output, palette, review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-design')
