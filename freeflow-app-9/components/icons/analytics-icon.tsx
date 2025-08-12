"use client"

import { TrendingUp } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Analytics icon component
 * This component wraps the TrendingUp icon from Lucide in a gradient container
 */
export function AnalyticsIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <TrendingUp className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function AnalyticsIconRaw(props) {
  return <TrendingUp {...props} />
}
