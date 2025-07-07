'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  items: {
    title: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    disabled?: boolean
    external?: boolean
    label?: string
  }[]
  children?: React.ReactNode
}

export function MobileMenu({ items, children }: MobileMenuProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold">FreeFlowZee</span>
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="pl-1 pr-7">
            {items.map((item, index) => {
              const Icon = item.icon
              return (
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline',
                      item.disabled && 'cursor-not-allowed opacity-60',
                      pathname === item.href
                        ? 'bg-muted font-medium text-primary'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setOpen(false)}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                  >
                    {Icon && (
                      <Icon className="mr-2 h-4 w-4" />
                    )}
                    {item.title}
                    {item.label && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              )
            })}
          </div>
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

interface MobileSubMenuProps {
  title: string
  items: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

export function MobileSubMenu({ title, items }: MobileSubMenuProps) {
  const pathname = usePathname()

  return (
    <div className="pl-1 pr-7">
      <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">
        {title}
      </h4>
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            'block rounded-md px-2 py-1 text-sm hover:underline',
            item.disabled && 'cursor-not-allowed opacity-60',
            pathname === item.href
              ? 'font-medium text-primary'
              : 'text-muted-foreground'
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  )
}

interface MobileNavProps {
  items: MobileMenuProps['items']
  children?: React.ReactNode
}

export function MobileNav({ items, children }: MobileNavProps) {
  return (
    <div className="lg:hidden">
      <MobileMenu items={items}>{children}</MobileMenu>
    </div>
  )
} 