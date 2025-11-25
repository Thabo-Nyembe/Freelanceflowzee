'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, DollarSign, TrendingUp, Zap } from 'lucide-react'
import { ProjectIntelligence } from '@/components/ai/project-intelligence'
import { PricingIntelligence } from '@/components/ai/pricing-intelligence'

export default function AIBusinessAdvisorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Business Advisor</h1>
        </div>
        <p className="text-gray-600">
          Get intelligent insights to grow your business, optimize projects, and maximize profitability
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="project">
            <Brain className="w-4 h-4 mr-2" />
            Project Intelligence
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing Strategy
          </TabsTrigger>
          <TabsTrigger value="growth">
            <TrendingUp className="w-4 h-4 mr-2" />
            Growth Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="mt-6">
          <ProjectIntelligence />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PricingIntelligence />
        </TabsContent>

        <TabsContent value="growth" className="mt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Zap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Growth Insights Coming Soon</h3>
              <p className="text-gray-600">
                AI-powered growth forecasting and recommendations
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
