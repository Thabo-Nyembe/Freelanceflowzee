'use client''

import React, { useState } from 'react';'
import { Button } from '@/components/ui/button';'
import { useDashboardMetrics, useDemoContent } from '@/components/dashboard/demo-content-provider';'

export function ClientPresentationDemo() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dashboardMetrics = useDashboardMetrics();
  const { content } = useDemoContent(); const projects = content?.projects; const users = content?.users;

  const slides = [
    {
      title: "FreeflowZee: Your Complete Freelance Solution",
      content: "overview",
      description: 'Comprehensive platform for project management and collaboration'
    },
    {
      title: "Proven Results & Success Metrics", 
      content: "metrics",
      description: 'Real performance data from our thriving community'
    },
    {
      title: "Project Portfolio Showcase",
      content: "portfolio", 
      description: 'Successful projects delivered through our platform'
    },
    {
      title: "Client Success Stories",
      content: "testimonials",
      description: 'What our clients say about working with our freelancers'
    },
    {
      title: "Ready to Get Started?",
      content: "cta",
      description: 'Join thousands of satisfied clients and freelancers'
    }
  ];

  const renderSlideContent = () => {
    const slide = slides[currentSlide];
    
    switch (slide.content) {
      case 'overview': "
        return ("
          <div className= "text-center space-y-6">
            <div className= "bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl">
              <h2 className= "text-3xl font-bold mb-4">Welcome to FreeflowZee</h2>
              <p className= "text-xl opacity-90">The premier platform connecting clients with top-tier freelancers</p>
            </div>
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className= "p-6 text-center">
                  <Users className= "h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className= "font-bold mb-2">Expert Freelancers</h3>
                  <p className= "text-gray-600">Vetted professionals ready for your projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <CheckCircle className= "h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className= "font-bold mb-2">Secure Payments</h3>
                  <p className= "text-gray-600">Protected escrow system for all transactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <Award className= "h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <h3 className= "font-bold mb-2">Quality Guaranteed</h3>
                  <p className= "text-gray-600">Satisfaction guaranteed on every project</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'metrics': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Platform Performance</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className= "p-6 text-center">
                  <DollarSign className= "h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className= "text-2xl font-bold text-green-600">$45.6K</div>
                  <div className= "text-sm text-gray-500">Monthly Revenue</div>
                  <Badge className= "mt-2 bg-green-100 text-green-800">+12.5% growth</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <Users className= "h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className= "text-2xl font-bold text-blue-600">1,247</div>
                  <div className= "text-sm text-gray-500">Active Users</div>
                  <Badge className= "mt-2 bg-blue-100 text-blue-800">+8.2% growth</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <TrendingUp className= "h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className= "text-2xl font-bold text-purple-600">94.2%</div>
                  <div className= "text-sm text-gray-500">Success Rate</div>
                  <Badge className= "mt-2 bg-purple-100 text-purple-800">+2.1% improvement</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <Star className= "h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className= "text-2xl font-bold text-yellow-600">4.9/5</div>
                  <div className= "text-sm text-gray-500">Client Rating</div>
                  <Badge className= "mt-2 bg-yellow-100 text-yellow-800">Excellent</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'portfolio': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Featured Projects</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects?.slice(0, 4).map((project, index) => (
                <Card key={index} className= "hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className= "flex justify-between items-start">
                      <CardTitle className= "text-lg">{project.title}</CardTitle>
                      <Badge className= "bg-green-100 text-green-800">{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className= "text-gray-600 mb-4">{project.description}</p>
                    <div className= "flex justify-between items-center">
                      <span className= "font-bold text-green-600">{project.budget}</span>
                      <span className= "text-sm text-gray-500">{project.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'testimonials': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">What Our Clients Say</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className= "bg-blue-50 border-blue-200">
                <CardContent className= "p-6">
                  <div className= "flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className= "h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className= "italic mb-4">"FreeflowZee helped us find the perfect freelancer for our web development project. The quality exceeded our expectations!&quot;</p>
                  <div className= "font-semibold">- Sarah Johnson, Tech Startup CEO</div>
                </CardContent>
              </Card>
              <Card className= "bg-green-50 border-green-200">
                <CardContent className= "p-6">
                  <div className= "flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className= "h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className= "italic mb-4">"The escrow system gave us confidence in the payment process. Communication tools made collaboration seamless.&quot;</p>
                  <div className= "font-semibold">- Michael Chen, Marketing Director</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'cta': "
        return ("
          <div className= "text-center space-y-6">
            <div className= "bg-gradient-to-r from-purple-500 to-blue-600 text-white p-8 rounded-xl">
              <h2 className= "text-3xl font-bold mb-4">Ready to Start Your Next Project?</h2>
              <p className= "text-xl opacity-90 mb-6">Join thousands of satisfied clients who trust FreeflowZee</p>
              <div className= "space-y-4">
                <Button size= "lg" className= "bg-white text-purple-600 hover:bg-gray-100">
                  Start Your Project Today
                  <ArrowRight className= "ml-2 h-5 w-5" />
                </Button>
                <div className= "text-sm opacity-80">
                  ✓ No setup fees ✓ Secure payments ✓ 24/7 support
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Slide content not found</div>;
    }
  };

  return (
    <div className= "client-presentation-demo min-h-screen bg-gray-50 p-6">
      <div className= "max-w-6xl mx-auto">
        {/* Header */}
        <div className= "flex justify-between items-center mb-8">
          <div>
            <h1 className= "text-2xl font-bold">Client Presentation</h1>
            <p className= "text-gray-600">Professional demo for potential clients</p>
          </div>
          <Badge className= "bg-blue-100 text-blue-800">
            🎭 Demo Mode - Client Focused
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className= "mb-8">
          <div className= "flex justify-between text-sm text-gray-500 mb-2">
            <span>Slide {currentSlide + 1} of {slides.length}</span>
            <span>{slides[currentSlide].title}</span>
          </div>
          <div className= "w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Slide Content */}"
        <div className= "bg-white rounded-xl shadow-lg p-8 mb-8 min-h-[500px]">
          {renderSlideContent()}
        </div>

        {/* Navigation */}
        <div className= "flex justify-between items-center">
          <Button 
            variant= "outline" 
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            Previous
          </Button>
          
          <div className= "flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <Button 
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ArrowRight className= "ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}