'use client'

import { Check, X, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface ComparisonRow {
    feature: string
    kazi: string
    competitor: string
    kaziDetail?: string
}

interface DynamicComparisonTableProps {
    competitorName: string
    rows: ComparisonRow[]
}

export function DynamicComparisonTable({ competitorName, rows }: DynamicComparisonTableProps) {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-800 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-950 p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="col-span-12 md:col-span-5 font-semibold text-gray-500 dark:text-gray-400 mb-2 md:mb-0">Feature</div>
                <div className="col-span-6 md:col-span-4 font-bold text-xl md:text-2xl text-blue-600 flex items-center gap-2">
                    KAZI
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 pointer-events-none text-[10px] md:text-xs">
                        Everything
                    </Badge>
                </div>
                <div className="col-span-6 md:col-span-3 font-semibold text-gray-500 dark:text-gray-400">{competitorName}</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {rows.map((row, index) => (
                    <motion.div
                        key={row.feature}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-12 p-4 md:p-6 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        {/* Feature Name */}
                        <div className="col-span-12 md:col-span-5 flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium mb-2 md:mb-0">
                            {row.feature}
                            {row.kaziDetail && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{row.kaziDetail}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {/* KAZI Column */}
                        <div className="col-span-6 md:col-span-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                                <Check className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <span className="text-sm md:text-base font-medium">{row.kazi}</span>
                        </div>

                        {/* Competitor Column */}
                        <div className="col-span-6 md:col-span-3 text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base">{row.competitor}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-blue-600 p-4 text-center text-white text-sm font-medium">
                Try risk-free. 14-day free trial.
            </div>
        </div>
    )
}
