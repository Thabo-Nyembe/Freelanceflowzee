'use client''

import React from 'react';'

export function InvestorDemo() {
  return (
    <div className= "investor-demo p-6 bg-gray-50 min-h-screen">
      <div className= "max-w-6xl mx-auto">
        <div className= "flex justify-between items-center mb-8">
          <h1 className= "text-3xl font-bold">FreeflowZee: Investment Opportunity</h1>
          <Badge className= "bg-green-100 text-green-800">📈 Growth Focused</Badge>
        </div>
        
        <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <DollarSign className= "h-5 w-5 text-green-500" />
                Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className= "text-2xl font-bold text-green-600">+127%</div>
              <p className= "text-sm text-gray-500">Year over year</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <Users className= "h-5 w-5 text-blue-500" />
                User Acquisition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className= "text-2xl font-bold text-blue-600">+89%</div>
              <p className= "text-sm text-gray-500">Monthly growth</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <BarChart3 className= "h-5 w-5 text-purple-500" />
                Market Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className= "text-2xl font-bold text-purple-600">12.4%</div>
              <p className= "text-sm text-gray-500">In target segment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <TrendingUp className= "h-5 w-5 text-orange-500" />
                Retention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className= "text-2xl font-bold text-orange-600">94.2%</div>
              <p className= "text-sm text-gray-500">Client retention</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Opportunity & Growth Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className= "text-gray-600 mb-4">
              FreeflowZee is positioned to capture significant market share in the $400B global freelance economy.
              Our platform combines cutting-edge technology with proven business models to deliver exceptional value.
            </p>
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className= "text-center p-4 bg-blue-50 rounded-lg">
                <div className= "text-xl font-bold text-blue-600">$400B</div>
                <div className= "text-sm text-gray-600">Global Market Size</div>
              </div>
              <div className= "text-center p-4 bg-green-50 rounded-lg">
                <div className= "text-xl font-bold text-green-600">36%</div>
                <div className= "text-sm text-gray-600">Annual Growth Rate</div>
              </div>
              <div className= "text-center p-4 bg-purple-50 rounded-lg">
                <div className= "text-xl font-bold text-purple-600">$2.4B</div>
                <div className= "text-sm text-gray-600">Addressable Market</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}