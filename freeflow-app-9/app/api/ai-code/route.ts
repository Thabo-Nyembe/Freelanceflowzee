/**
 * AI Code API Routes
 *
 * REST endpoints for AI Code Completion System:
 * GET - Completions, snippets, analyses, bug reports, suggestions, security issues, stats
 * POST - Create completions, snippets, analyses, bugs, suggestions, security issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
