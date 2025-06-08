import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FreeFlow Unified - Freelance Management Platform',
  description: 'Complete freelance management platform with universal feedback, project management, and secure payments',
  keywords: 'freelance, project management, feedback system, payments, collaboration',
}

export default function UnifiedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {children}
    </div>
  )
} 