"use client"

import { MessageSquare } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Messages icon component
 * This component wraps the MessageSquare icon from Lucide in a gradient container
 */
export function MessagesIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <MessageSquare className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function MessagesIconRaw(props) {
  return <MessageSquare {...props} />
}
