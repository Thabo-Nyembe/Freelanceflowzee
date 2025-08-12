"use client"

import { Receipt } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Invoices icon component
 * This component wraps the Receipt icon from Lucide in a gradient container
 */
export function InvoicesIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <Receipt className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function InvoicesIconRaw(props) {
  return <Receipt {...props} />
}
