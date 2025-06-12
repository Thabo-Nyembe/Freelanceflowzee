'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardBreadcrumbs } from '@/components/dashboard-breadcrumbs'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export function DashboardLayoutClient({
  children
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="!px-0">
                <div className="space-y-4 py-4">
                  <DashboardNav setOpen={setOpen} />
                </div>
              </SheetContent>
            </Sheet>
            <DashboardBreadcrumbs />
          </div>
          <DashboardHeader />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 lg:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col lg:flex">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
} 