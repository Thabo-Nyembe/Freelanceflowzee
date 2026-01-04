export const dynamic = 'force-dynamic';

import SupportTicketsClient from './support-tickets-client'

// Default stats for demo/initial load
const defaultStats = {
  open: 24,
  inProgress: 18,
  resolved: 156,
  critical: 3,
  avgResponseTime: 15,
  satisfactionScore: 94,
  todayNew: 12,
  overdue: 5
}

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <SupportTicketsClient initialTickets={[]} initialStats={defaultStats} />
}
