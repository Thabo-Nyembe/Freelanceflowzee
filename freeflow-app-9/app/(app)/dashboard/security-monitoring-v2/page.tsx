/**
 * Security Monitoring Dashboard
 *
 * Enterprise security monitoring with anomaly detection, alerts, and threat analysis
 */

import { Metadata } from 'next'
import SecurityMonitoringClient from './security-monitoring-client'

export const metadata: Metadata = {
  title: 'Security Monitoring | FreeFlow',
  description: 'Monitor security events, manage alerts, and configure anomaly detection rules',
}

export default function SecurityMonitoringPage() {
  return <SecurityMonitoringClient />
}
