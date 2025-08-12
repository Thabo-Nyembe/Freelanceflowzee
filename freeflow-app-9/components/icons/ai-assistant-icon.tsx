"use client"

import { Zap } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * AI Assistant icon component
 * This component wraps the Zap icon from Lucide in a gradient container
 */
export function AiAssistantIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <Zap className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function AiAssistantIconRaw(props) {
  return <Zap {...props} />
}
