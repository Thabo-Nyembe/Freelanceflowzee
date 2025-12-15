import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MyDayClient from './my-day-client'

export const dynamic = 'force-dynamic'

/**
 * My Day V2 - Groundbreaking Productivity Dashboard
 * Server-side rendered with real-time client updates
 */
export default async function MyDayV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let tasks: any[] = []
  let sessions: any[] = []

  if (user) {
    const today = new Date().toISOString().split('T')[0]

    const [tasksResult, sessionsResult] = await Promise.all([
      supabase
        .from('my_day_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('due_time', { ascending: true, nullsFirst: false }),
      supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00`)
        .order('start_time', { ascending: false })
    ])

    tasks = tasksResult.data || []
    sessions = sessionsResult.data || []
  }

  return (
    <MyDayClient
      initialTasks={tasks}
      initialSessions={sessions}
    />
  )
}
