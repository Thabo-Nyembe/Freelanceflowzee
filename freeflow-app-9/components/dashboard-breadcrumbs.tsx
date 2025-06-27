'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export function DashboardBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname?.split('/').filter(Boolean) || []'

  return (
    <nav className= "flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href= "/dashboard"
        className= "hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>
      {segments.slice(1).map((segment, index) => (
        <div key={segment} className= "flex items-center">
          <ChevronRight className= "h-4 w-4" />
          <Link
            href={`/${segments.slice(0, index + 2).join('/')}`}'
            className= "ml-1 capitalize hover:text-foreground transition-colors"
          >
            {segment.replace(/-/g, ' ')}'
          </Link>
        </div>
      ))}
    </nav>
  )
} 