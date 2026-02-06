/**
 * AI Code API - Single Resource Routes
 *
 * GET - Get single completion, snippet, analysis
 * PUT - Update completion, snippet, bug report, stats
 * DELETE - Delete completion, snippet, analysis, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
