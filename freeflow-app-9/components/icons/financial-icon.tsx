"use client"

import { Wallet } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Financial icon component
 * This component wraps the Wallet icon from Lucide in a gradient container
 */
export function FinancialIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <Wallet className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function FinancialIconRaw(props) {
  return <Wallet {...props} />
}
