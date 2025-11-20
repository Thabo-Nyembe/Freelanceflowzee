'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface NumberFlowProps {
  value: number
  className?: string
  format?: 'number' | 'currency' | 'compact'
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export function NumberFlow({
  value,
  className = '',
  format = 'number',
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5
}: NumberFlowProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0
  })

  useEffect(() => {
    springValue.set(value)

    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest)
    })

    return () => unsubscribe()
  }, [value, springValue])

  const formatNumber = (num: number): string => {
    const rounded = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString()

    if (format === 'currency') {
      const numValue = parseFloat(rounded)
      return '$' + numValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
    }

    if (format === 'compact') {
      const numValue = parseFloat(rounded)
      if (numValue >= 1000000) {
        return (numValue / 1000000).toFixed(1) + 'M'
      }
      if (numValue >= 1000) {
        return (numValue / 1000).toFixed(1) + 'K'
      }
      return numValue.toString()
    }

    return parseFloat(rounded).toLocaleString('en-US')
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </motion.span>
  )
}
