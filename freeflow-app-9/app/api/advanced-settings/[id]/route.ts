/**
 * Advanced Settings API - Single Resource Routes
 *
 * GET - Get single export, backup, sync record
 * PUT - Update export, backup, sync record, deletion request
 * DELETE - Delete export, backup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('advanced-settings')
