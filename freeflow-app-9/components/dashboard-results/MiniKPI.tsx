'use client'

interface MiniKPIProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'same'
  change?: string
}

export default function MiniKPI({ label, value, trend, change }: MiniKPIProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      {change && (
        <div className={`text-sm font-medium mt-1 ${
          trend === 'up' ? 'text-green-600 dark:text-green-400' :
          trend === 'down' ? 'text-red-600 dark:text-red-400' :
          'text-slate-600 dark:text-slate-400'
        }`}>
          {change}
        </div>
      )}
    </div>
  )
}
