/**
 * Workflow Builder API Routes
 *
 * REST endpoints for Workflow Builder:
 * GET - List workflows, templates, stats, trigger types, action types, history
 * POST - Create workflow, action, save draft, save as template, test, activate, pause
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
