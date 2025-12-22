'use client'

import CustomerSuccessClient from './customer-success-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <CustomerSuccessClient initialCustomers={[]} />
}
