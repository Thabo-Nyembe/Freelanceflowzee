import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from './dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    redirect('/login')
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
} 