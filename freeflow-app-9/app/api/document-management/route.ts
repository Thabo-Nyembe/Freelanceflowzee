/**
 * Document Management API Routes
 *
 * REST endpoints for Document Management:
 * GET - List folders, documents, versions, comments, shares, activity, templates, stats
 * POST - Create folder, document, comment, share, version, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('document-management')
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
