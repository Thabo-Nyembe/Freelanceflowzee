'use client'

import SupportTicketsClient from './support-tickets-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <SupportTicketsClient initialTickets={[]} />
}
