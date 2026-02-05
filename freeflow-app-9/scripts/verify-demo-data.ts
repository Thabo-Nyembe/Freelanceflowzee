import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { DEMO_USER_ID } from '../lib/utils/demo-mode'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)


async function verifyDemoData() {
  console.log('========================================')
  console.log('Demo Data Verification')
  console.log('========================================\n')

  // Check clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, company, status')
    .eq('user_id', DEMO_USER_ID)

  const clientCount = clients?.length || 0
  console.log('CLIENTS:', clientsError ? 'Error: ' + clientsError.message : clientCount + ' found')
  if (clients && clients.length > 0) {
    clients.forEach(c => console.log('  - ' + c.name + ' (' + c.company + ') [' + c.status + ']'))
  }

  // Check invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .limit(10)

  const invoiceCount = invoices?.length || 0
  console.log('\nINVOICES:', invoicesError ? 'Error: ' + invoicesError.message : invoiceCount + ' found')

  // Check projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, status')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  const projectCount = projects?.length || 0
  console.log('\nPROJECTS:', projectsError ? 'Error: ' + projectsError.message : projectCount + ' found')

  // Check tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, status')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  const taskCount = tasks?.length || 0
  console.log('\nTASKS:', tasksError ? 'Error: ' + tasksError.message : taskCount + ' found')

  // Check time entries
  const { data: timeEntries, error: timeError } = await supabase
    .from('time_entries')
    .select('id, description')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  const timeCount = timeEntries?.length || 0
  console.log('\nTIME ENTRIES:', timeError ? 'Error: ' + timeError.message : timeCount + ' found')

  // Check team members
  const { data: team, error: teamError } = await supabase
    .from('team_members')
    .select('id, name')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  const teamCount = team?.length || 0
  console.log('\nTEAM MEMBERS:', teamError ? 'Error: ' + teamError.message : teamCount + ' found')

  // Check calendar events
  const { data: events, error: eventsError } = await supabase
    .from('calendar_events')
    .select('id, title')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  const eventCount = events?.length || 0
  console.log('\nCALENDAR EVENTS:', eventsError ? 'Error: ' + eventsError.message : eventCount + ' found')

  console.log('\n========================================')
  console.log('Summary')
  console.log('========================================')
  console.log('Clients: ' + clientCount + (clientCount > 0 ? ' OK' : ' (needs seeding)'))
  console.log('Invoices: ' + invoiceCount + ' (needs migration)')
  console.log('Projects: ' + projectCount + ' (needs migration)')
  console.log('Tasks: ' + taskCount + ' (needs migration)')
  console.log('Time Entries: ' + timeCount + ' (needs migration)')
  console.log('Team: ' + teamCount + ' (needs migration)')
  console.log('Calendar: ' + eventCount + ' (needs migration)')
}

verifyDemoData()
