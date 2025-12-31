import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from "./dashboard-layout-client"

// Force dynamic rendering to prevent SSG issues with client components
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children, }: {
  children: React.ReactNode
}) {
  // Get real session from NextAuth
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Transform NextAuth session to expected user format
  const user = {
    id: session.user.id || '',
    email: session.user.email || '',
    user_metadata: { name: session.user.name || 'User' }
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
} 