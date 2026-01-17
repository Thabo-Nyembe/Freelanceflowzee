#!/usr/bin/env node

/**
 * KAZI - Clear Seed Data
 *
 * This script removes all demo data created by seed-projects.js
 * Use this to reset the database before re-seeding.
 *
 * Usage: node scripts/clear-seed-data.js
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Demo user ID
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearTimeEntries() {
  console.log('Clearing time entries...')
  const { error, count } = await supabase
    .from('time_entries')
    .delete()
    .eq('user_id', DEMO_USER_ID)

  if (error) {
    console.error('Error clearing time entries:', error.message)
    return 0
  }

  console.log(`Deleted time entries for demo user`)
  return count || 0
}

async function clearMilestones() {
  console.log('Clearing milestones...')
  const { error, count } = await supabase
    .from('milestones')
    .delete()
    .eq('user_id', DEMO_USER_ID)

  if (error) {
    console.error('Error clearing milestones:', error.message)
    return 0
  }

  console.log(`Deleted milestones for demo user`)
  return count || 0
}

async function clearTasks() {
  console.log('Clearing tasks...')
  const { error, count } = await supabase
    .from('tasks')
    .delete()
    .eq('user_id', DEMO_USER_ID)

  if (error) {
    console.error('Error clearing tasks:', error.message)
    return 0
  }

  console.log(`Deleted tasks for demo user`)
  return count || 0
}

async function clearProjects() {
  console.log('Clearing projects...')
  const { error, count } = await supabase
    .from('projects')
    .delete()
    .eq('user_id', DEMO_USER_ID)

  if (error) {
    console.error('Error clearing projects:', error.message)
    return 0
  }

  console.log(`Deleted projects for demo user`)
  return count || 0
}

async function main() {
  console.log('===========================================')
  console.log('KAZI - Clear Seed Data')
  console.log('===========================================')
  console.log(`Demo User ID: ${DEMO_USER_ID}`)
  console.log('===========================================\n')

  try {
    // Clear in reverse order due to foreign key constraints
    await clearTimeEntries()
    await clearMilestones()
    await clearTasks()
    await clearProjects()

    console.log('\n===========================================')
    console.log('CLEAR COMPLETE')
    console.log('===========================================')
    console.log('All demo data has been removed.')
    console.log('You can now run: node scripts/seed-projects.js')
    console.log('===========================================\n')

  } catch (error) {
    console.error('Unexpected error during clearing:', error)
    process.exit(1)
  }
}

// Run the script
main()
