import QAClient from './qa-client'

export const dynamic = 'force-dynamic'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <QAClient initialTestCases={[]} />
}
