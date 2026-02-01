import { Card, CardContent } from '@/components/ui/card'
import { Users, Globe, Star, TrendingUp } from 'lucide-react'

const stats = [
  { value: '25,000+', label: 'Active Users', icon: Users },
  { value: '40+', label: 'Countries', icon: Globe },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '$2.5M+', label: 'Processed', icon: TrendingUp }
]

export function StatsSection() {
  return (
    <section
      className="py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
      aria-labelledby="stats-heading"
      role="region"
    >
      <h2 id="stats-heading" className="sr-only">Platform statistics and achievements</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="text-center border-2 hover:border-blue-600 transition-all hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                role="status"
                aria-label={`${stat.label}: ${stat.value}`}
              >
                <CardContent className="p-6">
                  <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-600" aria-hidden="true" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" role="status">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
