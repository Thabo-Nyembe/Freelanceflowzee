'use client'

interface Activity {
  action: string
  subject: string
  time: string
  type: 'success' | 'warning' | 'error' | 'info'
}

interface ActivityFeedProps {
  activities: Activity[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getTypeStyles = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300"
          >
            <span className={`px-2 py-1 rounded-lg text-xs border ${getTypeStyles(activity.type)}`}>
              {activity.type}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {activity.action}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {activity.subject}
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
