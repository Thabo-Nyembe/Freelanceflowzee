"use client"

import { useState } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight,
  Download,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function RateCalculatorPage() {
  const [inputs, setInputs] = useState({
    desiredAnnualSalary: 60000,
    workingWeeksPerYear: 48,
    workingHoursPerWeek: 40,
    businessExpenses: 15000,
    profitMargin: 20,
    nonBillableHours: 10
  })

  const [results, setResults] = useState({
    hourlyRate: 0,
    dayRate: 0,
    weeklyRate: 0,
    monthlyRate: 0
  })

  const calculateRates = () => {
    const totalWorkingHours = inputs.workingWeeksPerYear * inputs.workingHoursPerWeek
    const billableHours = totalWorkingHours * (1 - inputs.nonBillableHours / 100)
    const totalCost = inputs.desiredAnnualSalary + inputs.businessExpenses
    const totalRevenue = totalCost * (1 + inputs.profitMargin / 100)
    const hourlyRate = totalRevenue / billableHours

    setResults({
      hourlyRate: Math.ceil(hourlyRate),
      dayRate: Math.ceil(hourlyRate * 8),
      weeklyRate: Math.ceil(hourlyRate * inputs.workingHoursPerWeek),
      monthlyRate: Math.ceil(hourlyRate * inputs.workingHoursPerWeek * 4.33)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }))
    calculateRates()
  }

  // Calculate on initial load
  useState(() => {
    calculateRates()
  })

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700">
              <Calculator className="w-4 h-4 mr-2" />
              Free Tool • No Registration Required
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Freelance Rate{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Calculate your optimal freelance rates based on your desired income, expenses, and market conditions. 
              Used by over 25,000+ freelancers worldwide.
            </p>
            
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                25,000+ Users
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-500" />
                2 Minutes Setup
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Always Free
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-purple-600" />
                  Your Business Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="salary">Desired Annual Salary ($)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={inputs.desiredAnnualSalary}
                      onChange={(e) => handleInputChange('desiredAnnualSalary', Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weeks">Working Weeks Per Year</Label>
                    <Input
                      id="weeks"
                      type="number"
                      value={inputs.workingWeeksPerYear}
                      onChange={(e) => handleInputChange('workingWeeksPerYear', Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hours">Working Hours Per Week</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={inputs.workingHoursPerWeek}
                      onChange={(e) => handleInputChange('workingHoursPerWeek', Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expenses">Annual Business Expenses ($)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={inputs.businessExpenses}
                      onChange={(e) => handleInputChange('businessExpenses', Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="profit">Desired Profit Margin (%)</Label>
                    <Input
                      id="profit"
                      type="number"
                      value={inputs.profitMargin}
                      onChange={(e) => handleInputChange('profitMargin', Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nonbillable">Non-Billable Hours (%)</Label>
                    <Input
                      id="nonbillable"
                      type="number"
                      value={inputs.nonBillableHours}
                      onChange={(e) => handleInputChange('nonBillableHours', Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                  Your Optimal Rates
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="text-3xl font-bold text-purple-600">${results.hourlyRate}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Day Rate (8 hours)</span>
                      <span className="text-2xl font-bold text-blue-600">${results.dayRate}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Weekly Rate</span>
                      <span className="text-2xl font-bold text-green-600">${results.weeklyRate}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Monthly Rate</span>
                      <span className="text-2xl font-bold text-orange-600">${results.monthlyRate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href="/signup">
                      Save Results & Get More Tools
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/resources">
                      <Download className="w-4 h-4 mr-2" />
                      Download Rate Guide
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Take Your Freelance Business to the Next Level
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Join FreeflowZee and get access to advanced rate optimization tools, client management, and automated invoicing.
          </p>
          
          <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4" asChild>
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 