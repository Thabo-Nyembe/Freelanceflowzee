export const dynamic = 'force-dynamic';

import MyDayClient from './my-day-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <MyDayClient initialData={[]} />
}
