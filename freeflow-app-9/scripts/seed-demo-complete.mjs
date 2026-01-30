/**
 * Complete Demo Data Seeder
 * Handles schema variations automatically
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

async function seed() {
  console.log('========================================')
  console.log('Complete Demo Data Seeder')
  console.log('========================================\n')

  // 1. Create a team first
  console.log('1. Creating team...')
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert([{
      owner_id: DEMO_USER_ID,
      name: 'KAZI Demo Team',
      description: 'Demo team for investor presentations',
      industry: 'Technology',
      size: '10-50',
      subscription_tier: 'professional',
      max_members: 25,
      is_active: true
    }])
    .select()
    .single()

  if (teamError) {
    console.log('   Team error:', teamError.message)
    // Try to get existing team
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('owner_id', DEMO_USER_ID)
      .single()

    if (existingTeam) {
      console.log('   Using existing team:', existingTeam.id)
      var teamId = existingTeam.id
    } else {
      console.log('   Skipping team members')
      var teamId = null
    }
  } else {
    console.log('   ✅ Team created:', team.id)
    var teamId = team.id
  }

  // 2. Add team members
  if (teamId) {
    console.log('\n2. Adding team members...')
    const teamMembers = [
      { team_id: teamId, user_id: DEMO_USER_ID, name: 'Alex Thompson', email: 'alex@kazi.app', role: 'Lead Developer', department: 'Engineering' },
      { team_id: teamId, user_id: DEMO_USER_ID, name: 'Maria Garcia', email: 'maria@kazi.app', role: 'UI/UX Designer', department: 'Design' },
      { team_id: teamId, user_id: DEMO_USER_ID, name: 'Chris Johnson', email: 'chris@kazi.app', role: 'Project Manager', department: 'Operations' },
      { team_id: teamId, user_id: DEMO_USER_ID, name: 'Taylor Smith', email: 'taylor@kazi.app', role: 'Backend Developer', department: 'Engineering' },
      { team_id: teamId, user_id: DEMO_USER_ID, name: 'Jordan Lee', email: 'jordan@kazi.app', role: 'Business Analyst', department: 'Operations' },
    ]

    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .insert(teamMembers)
      .select()

    if (membersError) {
      console.log('   Team members error:', membersError.message)
    } else {
      console.log(`   ✅ ${members.length} team members added`)
    }
  }

  // 3. Calendar events
  console.log('\n3. Adding calendar events...')

  // Check calendar_events schema first
  const { data: testEvent, error: eventSchemaError } = await supabase
    .from('calendar_events')
    .insert([{
      user_id: DEMO_USER_ID,
      title: 'Schema Test',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
    }])
    .select()

  if (eventSchemaError) {
    console.log('   Checking calendar schema:', eventSchemaError.message)

    // Try alternative column names
    const { error: altError } = await supabase
      .from('calendar_events')
      .insert([{
        user_id: DEMO_USER_ID,
        title: 'Schema Test',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
      }])
      .select()

    if (altError) {
      console.log('   Calendar events skipped:', altError.message)
    }
  } else {
    // Clean up test and insert real events
    await supabase.from('calendar_events').delete().eq('title', 'Schema Test')

    const now = new Date()
    const calendarEvents = [
      {
        user_id: DEMO_USER_ID,
        title: 'TechStartup Sprint Planning',
        description: 'Q1 Sprint 2 planning session',
        start_time: new Date(now.getTime() + 86400000).toISOString(), // +1 day
        end_time: new Date(now.getTime() + 86400000 + 7200000).toISOString(),
        type: 'meeting',
        location: 'Zoom',
        all_day: false
      },
      {
        user_id: DEMO_USER_ID,
        title: 'HealthTech Demo',
        description: 'Phase 1 demo to stakeholders',
        start_time: new Date(now.getTime() + 259200000).toISOString(), // +3 days
        end_time: new Date(now.getTime() + 259200000 + 3600000).toISOString(),
        type: 'meeting',
        location: 'Google Meet',
        all_day: false
      },
      {
        user_id: DEMO_USER_ID,
        title: 'EuroTech Discovery Call',
        description: 'Initial requirements gathering',
        start_time: new Date(now.getTime() + 432000000).toISOString(), // +5 days
        end_time: new Date(now.getTime() + 432000000 + 5400000).toISOString(),
        type: 'meeting',
        location: 'Teams',
        all_day: false
      },
      {
        user_id: DEMO_USER_ID,
        title: 'Q1 Review Deadline',
        description: 'All Q1 reports due',
        start_time: new Date(now.getTime() + 2592000000).toISOString(), // +30 days
        end_time: new Date(now.getTime() + 2592000000).toISOString(),
        type: 'deadline',
        all_day: true
      },
      {
        user_id: DEMO_USER_ID,
        title: 'Team Offsite',
        description: 'Quarterly team building',
        start_time: new Date(now.getTime() + 1209600000).toISOString(), // +14 days
        end_time: new Date(now.getTime() + 1209600000 + 28800000).toISOString(),
        type: 'meeting',
        location: 'Conference Room A',
        all_day: false
      },
    ]

    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .insert(calendarEvents)
      .select()

    if (eventsError) {
      console.log('   Calendar events error:', eventsError.message)
    } else {
      console.log(`   ✅ ${events.length} calendar events added`)
    }
  }

  // 4. Final verification
  console.log('\n========================================')
  console.log('Final Verification')
  console.log('========================================\n')

  const tables = ['clients', 'invoices', 'projects', 'tasks', 'time_entries', 'team_members', 'calendar_events', 'teams']

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', DEMO_USER_ID)

    if (error && !error.message.includes('user_id')) {
      // Try owner_id for teams
      const { count: count2 } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', DEMO_USER_ID)
      console.log(`${table}: ${count2 || 0}`)
    } else {
      console.log(`${table}: ${count || 0}`)
    }
  }

  console.log('\n✅ Demo data seeding complete!')
}

seed().catch(console.error)
