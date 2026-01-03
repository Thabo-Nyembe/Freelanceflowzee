export const dynamic = 'force-dynamic';

import ThirdPartyIntegrationsClient from './third-party-integrations-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <ThirdPartyIntegrationsClient initialIntegrations={[]} />
}
