'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BarChart3, Sparkles, CheckCircle, Award, DollarSign, TrendingUp, Star, ArrowRight, ShieldCheck, BrainCircuit, MessageSquare, LayoutDashboard } from 'lucide-react';

// Built-in demo data
const demoData = {
  metrics: {
    totalRevenue: 45600,
    activeProjects: 12,
    completedProjects: 24,
    userRating: 4.9,
    completionRate: 94.2
  },
  projects: [
    {
      title: "E-commerce Website Redesign",
      description: "Complete UI/UX overhaul for modern online store",
      budget: "$5,500",
      status: "In Progress",
      category: "Web Design",
      progress: 65
    },
    {
      title: "Mobile App Development",
      description: "iOS/Android app for fitness tracking platform",
      budget: "$8,200",
      status: "Active",
      category: "Mobile Development",
      progress: 40
    },
    {
      title: "Brand Identity Package",
      description: "Logo design and complete brand guidelines",
      budget: "$2,800",
      status: "Completed",
      category: "Branding",
      progress: 100
    },
    {
      title: "Video Marketing Campaign",
      description: "Series of promotional videos for product launch",
      budget: "$4,500",
      status: "Active",
      category: "Video Production",
      progress: 80
    }
  ],
  testimonials: [
    {
      text: "FreeflowZee helped us find the perfect freelancer for our web development project. The quality exceeded our expectations!",
      author: "Sarah Johnson",
      role: "Tech Startup CEO",
      rating: 5
    },
    {
      text: "The escrow system gave us confidence in the payment process. Communication tools made collaboration seamless.",
      author: "Michael Chen",
      role: "Marketing Director",
      rating: 5
    }
  ]
};

export function StandaloneDemo() {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const demoTypes = [
    {
      id: "client",
      title: "Client Presentation",
      description: "Showcase our platform's capabilities to potential clients",
      icon: Users,
      color: "bg-blue-500",
      audience: "Business clients, decision makers",
      duration: "10-15 minutes",
      type: 'client'
    },
    {
      id: "investor",
      title: "Investor Pitch",
      description: "Present growth metrics and business potential",
      icon: BarChart3,
      color: "bg-green-500",
      audience: "Investors, stakeholders",
      duration: "15-20 minutes",
      type: 'investor'
    },
    {
      id: "features",
      title: "Feature Walkthrough",
      description: "Detailed demonstration of platform features",
      icon: Sparkles,
      color: "bg-purple-500",
      audience: "Product evaluators, new users",
      duration: "12-18 minutes",
      type: 'features'
    }
  ];

  const clientSlides = [
    {
      title: "FreeflowZee: Your Complete Freelance Solution",
      content: 'overview'
    },
    {
      title: "Proven Results & Success Metrics",
      content: 'metrics'
    },
    {
      title: "Project Portfolio Showcase",
      content: 'portfolio'
    },
    {
      title: "Client Success Stories",
      content: 'testimonials'
    },
    {
      title: "Ready to Get Started?",
      content: 'cta'
    }
  ];

  const investorSlides = [
    {
      title: "Market Opportunity & Growth",
      content: 'market'
    },
    {
      title: "Platform Metrics & Traction",
      content: 'traction'
    },
    {
      title: "Revenue Model & Projections",
      content: 'revenue'
    },
    {
      title: "Competitive Advantage",
      content: 'advantage'
    },
    {
      title: "Growth Strategy & Roadmap",
      content: 'roadmap'
    }
  ];

  const featureSlides = [
    {
      title: "Project Management Hub",
      content: 'projects'
    },
    {
      title: "Secure Escrow System",
      content: 'escrow'
    },
    {
      title: "AI-Powered Tools",
      content: 'ai'
    },
    {
      title: "Community & Collaboration",
      content: 'community'
    },
    {
      title: "Analytics & Reporting",
      content: 'analytics'
    }
  ];

  const renderClientSlide = () => {
    const slide = clientSlides[currentSlide];

    switch (slide.content) {
      case 'overview':
        return (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl">
              <h2 className="text-3xl font-bold mb-4">Welcome to FreeflowZee</h2>
              <p className="text-xl opacity-90">The premier platform connecting clients with top-tier freelancers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="font-bold mb-2">Expert Freelancers</h3>
                  <p className="text-gray-600">Vetted professionals ready for your projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-bold mb-2">Secure Payments</h3>
                  <p className="text-gray-600">Protected escrow system for all transactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="font-bold mb-2">Quality Guaranteed</h3>
                  <p className="text-gray-600">Satisfaction guaranteed on every project</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'metrics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Platform Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">${demoData.metrics.totalRevenue / 1000}K</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                  <Badge className="mt-2 bg-green-100 text-green-800">+12.5% growth</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-purple-600">{demoData.metrics.completionRate}%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">+2.1% improvement</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-yellow-600">{demoData.metrics.userRating}/5</div>
                  <div className="text-sm text-gray-500">Client Rating</div>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Excellent</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'portfolio':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoData.projects.map((project, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">{project.budget}</span>
                      <span className="text-sm text-gray-500">{project.category}</span>
                    </div>
                    <Progress value={project.progress} className="mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoData.testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="italic mb-4">"{testimonial.text}"</p>
                    <div className="font-semibold">- {testimonial.author}, {testimonial.role}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-8 rounded-xl">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Next Project?</h2>
              <p className="text-xl opacity-90 mb-6">Join thousands of satisfied clients who trust FreeflowZee</p>
              <div className="space-y-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Start Your Project Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="text-sm opacity-80">
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

  const renderInvestorSlide = () => {
    // ... Implementation for investor slides
    return <div>Investor slide content here...</div>
  }

  const renderFeatureSlide = () => {
    // ... Implementation for feature slides
    return <div>Feature slide content here...</div>
  }


  const renderCurrentDemo = () => {
    switch (currentDemo) {
      case 'client':
        return (
          <div>
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-bold">{clientSlides[currentSlide].title}</h2>
              <div>
                <Button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0}>Prev</Button>
                <Button onClick={() => setCurrentSlide(s => Math.min(clientSlides.length - 1, s + 1))} disabled={currentSlide === clientSlides.length - 1}>Next</Button>
              </div>
            </div>
            <div className="p-4">{renderClientSlide()}</div>
          </div>
        )
      case 'investor':
        return (
          <div>
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-bold">{investorSlides[currentSlide].title}</h2>
              <div>
                <Button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0}>Prev</Button>
                <Button onClick={() => setCurrentSlide(s => Math.min(investorSlides.length - 1, s + 1))} disabled={currentSlide === investorSlides.length - 1}>Next</Button>
              </div>
            </div>
            <div className="p-4">{renderInvestorSlide()}</div>
          </div>
        )
      case 'features':
        return (
          <div>
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-bold">{featureSlides[currentSlide].title}</h2>
              <div>
                <Button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0}>Prev</Button>
                <Button onClick={() => setCurrentSlide(s => Math.min(featureSlides.length - 1, s + 1))} disabled={currentSlide === featureSlides.length - 1}>Next</Button>
              </div>
            </div>
            <div className="p-4">{renderFeatureSlide()}</div>
          </div>
        )
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to the Standalone Demo</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoTypes.map(demo => (
                <Card key={demo.id} className="cursor-pointer hover:shadow-lg" onClick={() => { setCurrentDemo(demo.type); setCurrentSlide(0); }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${demo.color}`}>
                        <demo.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle>{demo.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{demo.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  }

  return (
    <div className="standalone-demo bg-gray-100 min-h-screen">
      {currentDemo && (
        <div className="p-4 bg-white border-b">
          <Button variant="outline" onClick={() => setCurrentDemo(null)}>
            ← Back to Demo Selection
          </Button>
        </div>
      )}
      {renderCurrentDemo()}
    </div>
  );
} 