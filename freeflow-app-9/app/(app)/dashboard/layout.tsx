import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import DashboardLayoutClient from "./dashboard-layout-client"
import { Metadata } from 'next'

// Force dynamic rendering to prevent SSG issues with client components
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard | KAZI',
  description: 'KAZI Dashboard - Manage your freelance projects, clients, and analytics',
}

// Demo user for showcase mode - uses Alexandra Chen's real ID for database access
const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex@freeflow.io',
  user_metadata: { name: 'Alexandra Chen' }
}

export default async function DashboardLayout({
  children, }: {
  children: React.ReactNode
}) {
  // Get real session from NextAuth
  const session = await getServerSession(authOptions)

  // Use real user if authenticated, otherwise use demo user for showcase
  const user = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    user_metadata: { name: session.user.name || 'User' }
  } : DEMO_USER

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
} 