'use client'

export const dynamic = 'force-dynamic';

import CryptoPaymentsClient from '@/app/v2/dashboard/crypto-payments/crypto-payments-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <CryptoPaymentsClient />
}
