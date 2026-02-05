import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


/**
 * Test Database Connection
 * Visit: http://localhost:9323/api/auth/test-db
 */
export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        error: 'Environment variables missing',
        details: {
          NEXT_PUBLIC_SUPABASE_URL: hasUrl ? '✅' : '❌ Missing',
          SUPABASE_SERVICE_ROLE_KEY: hasKey ? '✅' : '❌ Missing'
        }
      }, { status: 500 })
    }

    // Create Supabase client
    const supabase = await createClient()

    // Test 1: Check if users table exists
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count')
      .limit(0)

    if (tablesError) {
      return NextResponse.json({
        error: 'Users table not found or inaccessible',
        details: tablesError,
        fix: 'Run the database migration in Supabase SQL Editor'
      }, { status: 500 })
    }

    // Test 2: Try to count users
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({
        error: 'Cannot query users table',
        details: countError
      }, { status: 500 })
    }

    // All tests passed!
    return NextResponse.json({
      success: true,
      message: '✅ Database connection working!',
      userCount: count || 0,
      tests: {
        environmentVariables: '✅ Loaded',
        supabaseConnection: '✅ Connected',
        usersTable: '✅ Exists',
        permissions: '✅ Can query'
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 })
  }
}
