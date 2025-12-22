'use client'

interface Stat {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'same'
  subtitle?: string
}

interface StatGridProps {
  stats: Stat[]
}

export default function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            {stat.label}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {stat.value}
          </div>
          <div className="flex items-center gap-2">
            {stat.change && (
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-slate-600 dark:text-slate-400'
              }`}>
                {stat.change}
              </span>
            )}
            {stat.subtitle && (
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {stat.subtitle}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
