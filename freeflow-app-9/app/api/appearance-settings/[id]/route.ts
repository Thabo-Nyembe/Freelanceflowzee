/**
 * Appearance Settings API - Single Resource Routes
 *
 * GET - Get single customization, preset, CSS snippet, color scheme, font preference
 * PUT - Update customization, preset, CSS snippet, color scheme, font preference
 * DELETE - Delete customization, preset, CSS snippet, color scheme, font preference
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('appearance-settings')
