/**
 * Integration Setup API Routes
 *
 * REST endpoints for Integration Setup Wizard:
 * GET - Sessions, steps, validations, onboarding progress, errors, stats
 * POST - Create sessions, steps, validations, progress, errors
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('integration-setup')
