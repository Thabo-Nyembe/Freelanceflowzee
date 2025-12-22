'use client'

interface QuickAction {
  label: string
  icon: string
  onClick: () => void
}

interface BentoQuickActionProps {
  actions: QuickAction[]
}

export default function BentoQuickAction({ actions }: BentoQuickActionProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 text-center whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
