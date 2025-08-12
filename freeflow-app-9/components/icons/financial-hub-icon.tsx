"use client"

import { DollarSign } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Financial Hub icon component
 * This component wraps the DollarSign icon from Lucide in a gradient container
 */
export function FinancialHubIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <DollarSign className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function FinancialHubIconRaw(props) {
  return <DollarSign {...props} />
}
