'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calculator, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const defaultCompetitors = [
    { id: 'project_mgmt', name: 'Project Management (Monday/ClickUp)', cost: 24, enabled: true },
    { id: 'ai_writing', name: 'AI Writing (Jasper/Copy.ai)', cost: 49, enabled: true },
    { id: 'video_tools', name: 'Video Tools (Loom/Descript)', cost: 15, enabled: true },
    { id: 'storage', name: 'Cloud Storage (Dropbox/Box)', cost: 12, enabled: true },
    { id: 'invoicing', name: 'Invoicing (FreshBooks)', cost: 15, enabled: false },
]

export function ROICalculator() {
    const [competitors, setCompetitors] = useState(defaultCompetitors)
    const [upworkRevenue, setUpworkRevenue] = useState(0)

    // KAZI Costs
    const kaziMonthly = 29
    const kaziEscrowFeePercent = 0.029 // 2.9%
    const upworkFeePercent = 0.20 // 20% (avg)

    const [totalMonthlySpend, setTotalMonthlySpend] = useState(0)
    const [annualSavings, setAnnualSavings] = useState(0)

    useEffect(() => {
        // Calculate Tool Spend
        const toolSpend = competitors
            .filter(c => c.enabled)
            .reduce((acc, curr) => acc + curr.cost, 0)

        // Calculate Upwork Fees
        const upworkFees = upworkRevenue * upworkFeePercent
        const kaziFees = upworkRevenue * kaziEscrowFeePercent

        const totalCompetitorCost = toolSpend + upworkFees
        const totalKaziCost = kaziMonthly + kaziFees

        const monthlySavings = totalCompetitorCost - totalKaziCost

        setTotalMonthlySpend(totalCompetitorCost)
        setAnnualSavings(monthlySavings * 12)
    }, [competitors, upworkRevenue])

    const toggleCompetitor = (id: string) => {
        setCompetitors(prev => prev.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
        ))
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-2 border-blue-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Calculator className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">ROI Calculator</h2>
                </div>
                <p className="text-blue-100">See how much you can save by consolidating your stack.</p>
            </div>

            <div className="grid md:grid-cols-2">
                <div className="p-8 space-y-8 border-r border-gray-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            1. Current Software Subscriptions
                        </h3>
                        <div className="space-y-3">
                            {competitors.map(comp => (
                                <div key={comp.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id={comp.id}
                                            checked={comp.enabled}
                                            onCheckedChange={() => toggleCompetitor(comp.id)}
                                        />
                                        <Label htmlFor={comp.id} className="cursor-pointer text-gray-600 dark:text-gray-300">
                                            {comp.name}
                                        </Label>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${comp.cost}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            2. Marketplace Revenue (Optional)
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Monthly</span>
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Monthly Freelance Revenue</span>
                                <span className="font-bold">${upworkRevenue.toLocaleString()}</span>
                            </div>
                            <Slider
                                value={[upworkRevenue]}
                                min={0}
                                max={10000}
                                step={100}
                                onValueChange={(val) => setUpworkRevenue(val[0])}
                                className="py-4"
                            />
                            <p className="text-xs text-gray-500">
                                Calculates savings on platform fees (20% Upwork vs 2.9% KAZI)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-slate-900/50 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-gray-500 font-medium">Your Estimated Annual Savings</p>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={annualSavings}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600"
                            >
                                ${Math.max(0, Math.round(annualSavings)).toLocaleString()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-2 w-full max-w-xs">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Current Monthly Spend:</span>
                            <span className="font-semibold text-red-500">${Math.round(totalMonthlySpend)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">KAZI Monthly Cost:</span>
                            <span className="font-semibold text-green-600">
                                ${Math.round(kaziMonthly + (upworkRevenue * kaziEscrowFeePercent))}*
                            </span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <p className="text-xs text-gray-400 text-left">*Includes $29 subscription + 2.9% payment processing fees on revenue.</p>
                        </div>
                    </div>

                    <Link href="/signup">
                        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                            Start Saving Today
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}
