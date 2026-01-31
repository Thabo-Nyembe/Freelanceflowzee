'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'

export function VercelAnalytics() {
  const [isVercel, setIsVercel] = useState(false)

  useEffect(() => {
    // Only load on Vercel deployments
    const hostname = window.location.hostname
    const isVercelDeployment = hostname.includes('vercel.app') ||
                               hostname.includes('kazi.app') ||
                               process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    setIsVercel(isVercelDeployment)
  }, [])

  if (!isVercel) return null

  return <Analytics />
}
