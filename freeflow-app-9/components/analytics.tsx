'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { TrendingUp } from "lucide-react";
import { GradientContainer } from "@/components/ui/gradient-container";

export function Analytics() {
  return <VercelAnalytics />
} 