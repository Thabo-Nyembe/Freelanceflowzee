/**
 * Integration Setup API - Single Resource Routes
 *
 * GET - Get single session, step, validation
 * PUT - Update session, step, validation, resolve error
 * DELETE - Abandon session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('integration-setup')
