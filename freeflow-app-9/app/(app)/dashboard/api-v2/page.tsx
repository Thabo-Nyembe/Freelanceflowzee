'use client'

import ApiClient from './api-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <ApiClient initialData={[]} />
}
