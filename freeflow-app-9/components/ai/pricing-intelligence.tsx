'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DollarSign, TrendingUp, Target, Star, Loader2 } from 'lucide-react'
import { generatePricingIntelligence } from '@/lib/ai/business-intelligence'

export function PricingIntelligence() {
  const [loading, setLoading] = useState(false)
  const [pricing, setPricing] = useState<any>(null)

  const [userData, setUserData] = useState({
    skills: '',
    experience: '',
    market: '',
    currentRate: ''
  })

  const handleGeneratePricing = async () => {
    if (!userData.skills || !userData.experience || !userData.market) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const skillsArray = userData.skills.split(',').map(s => s.trim())
      const result = await generatePricingIntelligence({
        userId: `user-${Date.now()}`,
        skills: skillsArray,
        experience: parseInt(userData.experience),
        market: userData.market,
        currentRate: userData.currentRate ? parseFloat(userData.currentRate) : undefined
      })

      setPricing(result)

      toast.success('Pricing strategy generated', {
        description: `${result.recommendations.length} pricing tiers recommended`
      })
    } catch (error) {
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Target className="w-5 h-5 text-blue-600" />
      case 'standard':
        return <DollarSign className="w-5 h-5 text-green-600" />
      case 'premium':
        return <Star className="w-5 h-5 text-purple-600" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'border-blue-200 bg-blue-50'
      case 'standard':
        return 'border-green-200 bg-green-50'
      case 'premium':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            AI Pricing Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="skills">Skills (comma-separated) *</Label>
              <Input
                id="skills"
                placeholder="Web Development, React, Node.js, UI/UX Design"
                value={userData.skills}
                onChange={(e) => setUserData({ ...userData, skills: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                type="number"
                placeholder="5"
                value={userData.experience}
                onChange={(e) => setUserData({ ...userData, experience: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="market">Market/Location *</Label>
              <Input
                id="market"
                placeholder="e.g., US, Europe, Asia, Remote"
                value={userData.market}
                onChange={(e) => setUserData({ ...userData, market: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="currentRate">Current Rate ($/hour) - Optional</Label>
              <Input
                id="currentRate"
                type="number"
                placeholder="75"
                value={userData.currentRate}
                onChange={(e) => setUserData({ ...userData, currentRate: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={handleGeneratePricing}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Pricing Strategy...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Pricing Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      {pricing && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.recommendations.map((rec: any, index: number) => (
              <Card key={index} className={`border-2 ${getTierColor(rec.tier)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {getTierIcon(rec.tier)}
                    <Badge variant="outline" className="capitalize">
                      {rec.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mt-4">
                    ${rec.price.toFixed(0)}
                    <span className="text-base font-normal text-gray-600">/hour</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">What's Included</h4>
                    <p className="text-sm text-gray-700">{rec.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Target Client</h4>
                    <p className="text-sm text-gray-700">{rec.targetClient}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Reasoning</h4>
                    <p className="text-sm text-gray-700">{rec.reasoning}</p>
                  </div>

                  {rec.tier === 'standard' && (
                    <Badge className="w-full justify-center bg-green-600 text-white">
                      Recommended
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{pricing.marketAnalysis}</p>
            </CardContent>
          </Card>

          {/* Rate Increase Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Increase Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{pricing.rateIncreaseStrategy}</p>
            </CardContent>
          </Card>

          {/* Competitive Position */}
          <Card>
            <CardHeader>
              <CardTitle>Your Competitive Position</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{pricing.competitivePosition}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
