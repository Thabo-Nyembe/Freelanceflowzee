"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, DollarSign, Users, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: "Activity",
      value: "89%",
      change: "+2.1%",
      icon: Activity,
      color: "text-blue-600",
      bgColor: 'bg-blue-100'
    },
    {
      title: "Revenue",
      value: "$45,231",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: 'bg-green-100'
    },
    {
      title: "Clients",
      value: "2,300",
      change: "+3.2%",
      icon: Users,
      color: "text-purple-600",
      bgColor: 'bg-purple-100'
    },
    {
      title: "Growth",
      value: "15.3%",
      change: "+4.3%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="mr-1">
                    {stat.change}
                  </Badge>
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}