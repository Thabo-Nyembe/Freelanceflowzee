import { Metadata } from 'next'
import TaxIntelligenceClient from './tax-intelligence-client'

export const metadata: Metadata = {
  title: 'Tax Intelligence | FreeFlow',
  description: 'Intelligent tax management, deduction tracking, and compliance for freelancers'
}

export default function TaxIntelligencePage() {
  return <TaxIntelligenceClient />
}
