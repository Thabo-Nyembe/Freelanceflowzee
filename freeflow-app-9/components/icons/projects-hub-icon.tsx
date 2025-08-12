"use client"

import { FolderOpen } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * Projects Hub icon component
 * This component wraps the FolderOpen icon from Lucide in a gradient container
 */
export function ProjectsHubIcon({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <FolderOpen className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function ProjectsHubIconRaw(props) {
  return <FolderOpen {...props} />
}
