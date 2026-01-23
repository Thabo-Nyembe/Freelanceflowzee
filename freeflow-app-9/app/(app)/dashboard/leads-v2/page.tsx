'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Leads V2 Page
 *
 * Lead management functionality is integrated into CRM-v2 which provides
 * comprehensive contact management including lead scoring, pipeline tracking,
 * and activity management.
 *
 * This page redirects to CRM for unified lead/contact management.
 */
export default function LeadsPage() {
  useEffect(() => {
    // Client-side redirect with message
    window.location.href = '/dashboard/crm-v2?view=leads'
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500">Redirecting to CRM Lead Management...</p>
      </div>
    </div>
  )
}
