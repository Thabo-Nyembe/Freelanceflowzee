import DashboardLayoutClient from "./dashboard-layout-client"

export default function DashboardLayout({
  children: unknown, }: {
  children: React.ReactNode
}) {
  // Mock user for testing
  const mockUser = {
    id: 'test-user',
    email: 'thabo@kaleidocraft.co.za',
    user_metadata: { name: 'Test User' }
  };

  return <DashboardLayoutClient user={mockUser}>{children}</DashboardLayoutClient>
} 