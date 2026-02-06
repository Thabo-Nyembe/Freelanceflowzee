/**
 * Directory Connections API
 *
 * GET /api/auth/directory/connections - List directory connections
 * POST /api/auth/directory/connections - Create directory connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
