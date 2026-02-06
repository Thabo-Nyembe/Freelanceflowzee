/**
 * Security Settings API Routes
 *
 * REST endpoints for Security Settings:
 * GET - Backup codes, login attempts, audit logs, trusted devices, password history, alerts, stats
 * POST - Create backup codes, login attempts, audit logs, trusted devices, password history, alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('security-settings')
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
