"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export function GradientContainer({
  children,
  size = "md",
  variant = "primary",
  className,
  ...props
}: GradientContainerProps) {
  // Size mappings
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }
  
  // Gradient mappings
  const gradientMap = {
    primary: "bg-gradient-to-br from-blue-500 to-indigo-600",
    secondary: "bg-gradient-to-br from-purple-500 to-pink-600",
    success: "bg-gradient-to-br from-green-500 to-emerald-600",
    warning: "bg-gradient-to-br from-yellow-500 to-amber-600",
    danger: "bg-gradient-to-br from-red-500 to-rose-600"
  }
  
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md",
        sizeMap[size],
        gradientMap[variant],
        className
      )}
      {...props}
    >
      <div className="text-white">
        {children}
      </div>
    </div>
  )
}
