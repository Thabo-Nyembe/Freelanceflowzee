import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interactive Demo - FreeflowZee',
  description: 'Experience how FreeflowZee works with this fully interactive demo project showcasing our platform\'s capabilities.',
  keywords: ['demo', 'project', 'freelance', 'portfolio', 'showcase', 'interactive'],
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 