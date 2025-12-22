'use client'

interface RankingItem {
  label: string
  value: string
  rank: number
  trend?: 'up' | 'down' | 'same'
}

interface RankingListProps {
  title: string
  items: RankingItem[]
}

export default function RankingList({ title, items }: RankingListProps) {
  const getTrendIcon = (trend?: RankingItem['trend']) => {
    switch (trend) {
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      default:
        return '→'
    }
  }

  const getTrendColor = (trend?: RankingItem['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold">
              {item.rank}
            </span>
            <span className="flex-1 text-sm text-slate-900 dark:text-white">
              {item.label}
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {item.value}
            </span>
            <span className={`text-sm ${getTrendColor(item.trend)}`}>
              {getTrendIcon(item.trend)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
