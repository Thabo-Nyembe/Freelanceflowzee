"use client"

import { Monitor } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Canvas icon component
 * This component wraps the Monitor icon from Lucide in a gradient container
 */
export function CanvasIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <Monitor className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function CanvasIconRaw(props) {
  return <Monitor {...props} />
}
