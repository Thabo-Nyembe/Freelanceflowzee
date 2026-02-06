/**
 * Appearance Settings API Routes
 *
 * REST endpoints for Appearance Settings:
 * GET - Theme customizations, presets, CSS snippets, color schemes, font preferences, history, stats
 * POST - Create customizations, presets, CSS snippets, color schemes, fonts, history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('appearance-settings')
