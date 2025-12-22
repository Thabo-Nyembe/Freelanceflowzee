'use client'

interface ProgressItem {
  label: string
  value: number
  total: number
  color: 'green' | 'red' | 'orange' | 'yellow' | 'blue'
}

interface ProgressCardProps {
  title: string
  items: ProgressItem[]
}

export default function ProgressCard({ title, items }: ProgressCardProps) {
  const getColorClasses = (color: ProgressItem['color']) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 dark:bg-green-400'
      case 'red':
        return 'bg-red-500 dark:bg-red-400'
      case 'orange':
        return 'bg-orange-500 dark:bg-orange-400'
      case 'yellow':
        return 'bg-yellow-500 dark:bg-yellow-400'
      default:
        return 'bg-blue-500 dark:bg-blue-400'
    }
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.value} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getColorClasses(item.color)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
