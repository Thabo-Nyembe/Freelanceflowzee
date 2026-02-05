/**
 * Seed My Day Demo Data
 * Populates tasks, goals, and schedule for alex@freeflow.io
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

async function seedMyDayData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log('🌱 Seeding My Day demo data...\n')

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  // ============================================================================
  // TASKS
  // ============================================================================
  console.log('📝 Creating tasks...')

  const tasks = [
    {
      user_id: DEMO_USER_ID,
      title: 'Review Q1 financial reports',
      description: 'Analyze revenue, expenses, and profit margins for investor meeting',
      priority: 'high',
      category: 'work',
      estimated_time: 60,
      completed: false,
      date: today,
      tags: ['finance', 'urgent', 'investor'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Team standup meeting',
      description: 'Daily sync with development team',
      priority: 'medium',
      category: 'meeting',
      estimated_time: 15,
      completed: false,
      start_time: '09:00',
      end_time: '09:15',
      date: today,
      tags: ['team', 'daily'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Update client proposal',
      description: 'Finalize pricing and timeline for Acme Corp project',
      priority: 'high',
      category: 'work',
      estimated_time: 90,
      completed: false,
      date: today,
      tags: ['proposal', 'client', 'acme'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Code review: Authentication module',
      description: 'Review PR #234 for new OAuth implementation',
      priority: 'medium',
      category: 'work',
      estimated_time: 45,
      completed: true,
      actual_time: 38,
      date: today,
      tags: ['code-review', 'auth', 'completed'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Lunch with Sarah - Product Strategy',
      description: 'Discuss Q2 roadmap and feature prioritization',
      priority: 'medium',
      category: 'meeting',
      estimated_time: 60,
      completed: false,
      start_time: '12:30',
      end_time: '13:30',
      date: today,
      tags: ['strategy', 'product'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Prepare investor pitch deck',
      description: 'Update slides with latest metrics and growth projections',
      priority: 'urgent',
      category: 'work',
      estimated_time: 120,
      completed: false,
      date: today,
      tags: ['investor', 'pitch', 'urgent'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Gym workout',
      description: 'Upper body strength training',
      priority: 'low',
      category: 'personal',
      estimated_time: 60,
      completed: false,
      date: today,
      tags: ['health', 'personal'],
    },
    // Tomorrow's tasks
    {
      user_id: DEMO_USER_ID,
      title: 'Client demo: Video collaboration features',
      description: 'Showcase Frame.io-style review workflow to potential client',
      priority: 'high',
      category: 'meeting',
      estimated_time: 90,
      completed: false,
      start_time: '10:00',
      end_time: '11:30',
      date: tomorrow,
      tags: ['demo', 'client', 'video'],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Sprint planning session',
      description: 'Plan next 2-week development sprint',
      priority: 'high',
      category: 'meeting',
      estimated_time: 120,
      completed: false,
      date: tomorrow,
      tags: ['sprint', 'planning', 'team'],
    },
  ]

  const { data: tasksData, error: tasksError } = await supabase
    .from('my_day_tasks')
    .upsert(tasks, { onConflict: 'user_id,title,date', ignoreDuplicates: false })
    .select()

  if (tasksError) {
    console.error('❌ Error creating tasks:', tasksError.message)
    // Continue anyway - table might not exist
  } else {
    console.log(`✅ Created ${tasksData?.length || tasks.length} tasks`)
  }

  // ============================================================================
  // GOALS
  // ============================================================================
  console.log('\n🎯 Creating goals...')

  const goals = [
    {
      user_id: DEMO_USER_ID,
      title: 'Close 3 new enterprise deals',
      description: 'Target: $300K ARR from Fortune 500 companies',
      type: 'monthly',
      status: 'in_progress',
      priority: 'high',
      progress: 60,
      target_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Ship AI voice synthesis feature',
      description: 'Complete development, testing, and launch',
      type: 'weekly',
      status: 'in_progress',
      priority: 'high',
      progress: 85,
      target_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Exercise 5 times this week',
      description: 'Maintain fitness routine',
      type: 'weekly',
      status: 'in_progress',
      priority: 'medium',
      progress: 40,
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Complete investor deck',
      description: 'Finalize Series A pitch materials',
      type: 'daily',
      status: 'in_progress',
      priority: 'urgent',
      progress: 70,
      target_date: today,
    },
  ]

  const { data: goalsData, error: goalsError } = await supabase
    .from('my_day_goals')
    .upsert(goals, { onConflict: 'user_id,title', ignoreDuplicates: false })
    .select()

  if (goalsError) {
    console.error('❌ Error creating goals:', goalsError.message)
  } else {
    console.log(`✅ Created ${goalsData?.length || goals.length} goals`)
  }

  // ============================================================================
  // SCHEDULE BLOCKS
  // ============================================================================
  console.log('\n📅 Creating schedule blocks...')

  const scheduleBlocks = [
    {
      user_id: DEMO_USER_ID,
      title: 'Morning Deep Work',
      description: 'Focus time for complex tasks',
      start_time: '08:00',
      end_time: '11:00',
      type: 'focus',
      color: '#6366f1',
      recurring: true,
      recurrence_pattern: 'daily',
      task_ids: [],
      date: today,
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Lunch Break',
      description: 'Healthy meal and walk',
      start_time: '12:00',
      end_time: '13:00',
      type: 'break',
      color: '#10b981',
      recurring: true,
      recurrence_pattern: 'daily',
      task_ids: [],
      date: today,
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Client Meetings',
      description: 'Afternoon client calls and demos',
      start_time: '14:00',
      end_time: '16:00',
      type: 'meeting',
      color: '#f59e0b',
      recurring: false,
      task_ids: [],
      date: today,
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Admin & Email',
      description: 'Process emails and administrative tasks',
      start_time: '16:00',
      end_time: '17:00',
      type: 'admin',
      color: '#8b5cf6',
      recurring: true,
      recurrence_pattern: 'daily',
      task_ids: [],
      date: today,
    },
  ]

  const { data: scheduleData, error: scheduleError } = await supabase
    .from('my_day_schedule')
    .upsert(scheduleBlocks, { onConflict: 'user_id,title,date', ignoreDuplicates: false })
    .select()

  if (scheduleError) {
    console.error('❌ Error creating schedule:', scheduleError.message)
  } else {
    console.log(`✅ Created ${scheduleData?.length || scheduleBlocks.length} schedule blocks`)
  }

  console.log('\n✅ My Day demo data seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${tasks.length} tasks (${tasks.filter(t => t.date === today).length} today)`)
  console.log(`   - ${goals.length} goals`)
  console.log(`   - ${scheduleBlocks.length} schedule blocks`)
  console.log('\n🎯 Ready for showcase!')
}

seedMyDayData().catch(console.error)
