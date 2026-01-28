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

const comparisons = [
    {
        feature: 'Project Management',
        kazi: true,
        kaziDetail: 'Unlimited Projects',
        competitor: 'Monday.com',
        competitorPrice: '$24/mo',
        competitorHas: true,
    },
    {
        feature: 'AI Content Studio',
        kazi: true,
        kaziDetail: 'GPT-4o, Claude, DALL-E',
        competitor: 'Jasper',
        competitorPrice: '$49/mo',
        competitorHas: true,
    },
    {
        feature: 'Video & Screen Recording',
        kazi: true,
        kaziDetail: 'Unlimited with AI Transcription',
        competitor: 'Loom',
        competitorPrice: '$12/mo',
        competitorHas: true,
    },
    {
        feature: 'Secure Escrow Payments',
        kazi: true,
        kaziDetail: '2.9% Fee (vs 20%)',
        competitor: 'Upwork',
        competitorPrice: '20% Fees',
        competitorHas: true,
    },
    {
        feature: 'Client Portals & Galleries',
        kazi: true,
        kaziDetail: 'White-labeled',
        competitor: 'Dropbox Replay',
        competitorPrice: '$12/mo',
        competitorHas: true,
    },
    {
        feature: 'Total Monthly Cost',
        kazi: '$29',
        competitor: '$117+',
        isFooter: true,
    },
]

export function PricingComparisonTable() {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-800 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-950 p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="col-span-5 font-semibold text-gray-500 dark:text-gray-400">Feature</div>
                <div className="col-span-4 font-bold text-2xl text-blue-600 flex items-center gap-2">
                    KAZI
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 pointer-events-none text-xs">
                        Everything
                    </Badge>
                </div>
                <div className="col-span-3 font-semibold text-gray-500 dark:text-gray-400">Others</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {comparisons.map((row, index) => (
                    <motion.div
                        key={row.feature}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={`grid grid-cols-12 p-6 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${row.isFooter ? 'bg-blue-50/50 dark:bg-blue-900/10 font-bold' : ''
                            }`}
                    >
                        {/* Feature Name */}
                        <div className="col-span-5 flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                            {row.feature}
                            {row.kaziDetail && !row.isFooter && (
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
                        <div className="col-span-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            {row.isFooter ? (
                                <span className="text-3xl text-blue-600 dark:text-blue-400">{row.kazi}</span>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium ml-1">Included</span>
                                </>
                            )}
                        </div>

                        {/* Competitor Column */}
                        <div className="col-span-3 text-gray-500 dark:text-gray-400">
                            {row.isFooter ? (
                                <div className="flex flex-col">
                                    <span className="text-xl line-through text-red-400 decoration-2">{row.competitor}</span>
                                    <span className="text-xs text-red-500 font-normal">Multiple subscriptions</span>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{row.competitor}</span>
                                    <span className="text-xs text-red-500 font-medium">{row.competitorPrice}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-blue-600 p-4 text-center text-white text-sm font-medium">
                You save ~$1,000/year switching to KAZI
            </div>
        </div>
    )
}
