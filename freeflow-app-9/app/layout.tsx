import type { Metadata } from 'next'
import './globals.css'
import { Context7Provider } from '@/components/providers/context7-provider'

export const metadata: Metadata = {
  title: 'FreeflowZee - Ultimate Freelance Management Platform',
  description: 'Comprehensive freelance management platform with universal feedback, project tracking, financial management, and team collaboration.',
  keywords: 'freelance, project management, feedback system, invoicing, collaboration, supabase',
  authors: [{ name: 'FreeflowZee Team' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Context7Provider>
          {children}
        </Context7Provider>
      </body>
    </html>
  )
}
