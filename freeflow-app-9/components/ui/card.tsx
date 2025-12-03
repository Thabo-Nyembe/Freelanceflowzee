'use client'

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'glass' | 'gradient' | 'bordered'
  hover?: boolean
  glow?: boolean
}

const Card = React.memo(React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, glow = false, ...props }, ref) => {
    const baseClasses = "rounded-lg text-card-foreground transition-all duration-300"

    const variantClasses = {
      default: "border bg-card shadow-sm",
      premium: "relative border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-xl backdrop-blur-sm overflow-hidden group",
      glass: "relative border border-slate-700/30 bg-slate-900/20 backdrop-blur-xl shadow-2xl overflow-hidden",
      gradient: "relative border-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 shadow-xl backdrop-blur-sm overflow-hidden",
      bordered: "relative border-2 border-slate-700 bg-slate-900/80 shadow-lg"
    }

    const hoverClasses = hover ? "hover:scale-[1.02] hover:shadow-2xl cursor-pointer" : ""
    const glowClasses = glow ? "hover:shadow-purple-500/20 hover:border-purple-500/30" : ""

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], hoverClasses, glowClasses, className)}
        {...props}
      >
        {variant === 'premium' && glow && (
          <>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent opacity-50" />
          </>
        )}
        <div className="relative z-10">
          {props.children}
        </div>
      </div>
    )
  }
));
Card.displayName = "Card";

const CardHeader = React.memo(React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)));
CardHeader.displayName = "CardHeader";

const CardTitle = React.memo(React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
)));
CardTitle.displayName = "CardTitle";

const CardDescription = React.memo(React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
)));
CardDescription.displayName = "CardDescription";

const CardContent = React.memo(React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
)));
CardContent.displayName = "CardContent";

const CardFooter = React.memo(React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
)));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
