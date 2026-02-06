/**
 * AI Voice Synthesis API - Single Resource Routes
 *
 * GET - Get single voice, synthesis, clone, project, script
 * PUT - Update voice, synthesis, clone, project, script, reorder scripts
 * DELETE - Delete voice, synthesis, clone, project, script, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-voice')
