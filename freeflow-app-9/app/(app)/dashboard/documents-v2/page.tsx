export const dynamic = 'force-dynamic';

import DocumentsClient from './documents-client'

export default function DocumentsPage() {
  // Auth is handled by NextAuth middleware and the useDocuments hook
  // No need for server-side Supabase auth check
  return <DocumentsClient initialDocuments={[]} />
}
