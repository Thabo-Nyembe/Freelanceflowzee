/**
 * Client Portal API Routes
 *
 * REST endpoints for Client Portal:
 * GET - List clients, projects, communications, files, invoices, activities, stats
 * POST - Create client, project, communication, file, invoice, activity
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('client-portal')
