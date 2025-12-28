import CloudStorageClient from './cloud-storage-client'

export const dynamic = 'force-dynamic'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <CloudStorageClient initialFiles={[]} />
}
