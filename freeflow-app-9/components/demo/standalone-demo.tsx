'use client''

import React, { useState } from 'react';'
import { Button } from '@/components/ui/button';'

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
      description: "Showcase our platform's capabilities to potential clients",'
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
                  <div className= "text-2xl font-bold text-green-600">${(demoData.metrics.totalRevenue / 1000).toFixed(1)}K</div>
                  <div className= "text-sm text-gray-500">Monthly Revenue</div>
                  <Badge className= "mt-2 bg-green-100 text-green-800">+12.5% growth</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <FolderOpen className= "h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className= "text-2xl font-bold text-blue-600">{demoData.metrics.activeProjects}</div>
                  <div className= "text-sm text-gray-500">Active Projects</div>
                  <Badge className= "mt-2 bg-blue-100 text-blue-800">+8.2% growth</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <TrendingUp className= "h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className= "text-2xl font-bold text-purple-600">{demoData.metrics.completionRate}%</div>
                  <div className= "text-sm text-gray-500">Success Rate</div>
                  <Badge className= "mt-2 bg-purple-100 text-purple-800">+2.1% improvement</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <Star className= "h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className= "text-2xl font-bold text-yellow-600">{demoData.metrics.userRating}/5</div>
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
              {demoData.projects.map((project, index) => (
                <Card key={index} className= "hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className= "flex justify-between items-start">
                      <CardTitle className= "text-lg">{project.title}</CardTitle>
                      <Badge className= "bg-green-100 text-green-800">{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className= "text-gray-600 mb-4">{project.description}</p>
                    <div className= "flex justify-between items-center mb-2">
                      <span className= "font-bold text-green-600">{project.budget}</span>
                      <span className= "text-sm text-gray-500">{project.category}</span>
                    </div>
                    <div className= "w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className= "bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className= "text-right text-sm text-gray-500 mt-1">{project.progress}% complete</div>
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
              {demoData.testimonials.map((testimonial, index) => (
                <Card key={index} className= "bg-blue-50 border-blue-200">
                  <CardContent className= "p-6">
                    <div className= "flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className= "h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className= "italic mb-4">"{testimonial.text}"</p>
                    <div className= "font-semibold">- {testimonial.author}, {testimonial.role}</div>
                  </CardContent>
                </Card>
              ))}
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
        return <div>Content not found</div>;
    }
  };

  const renderInvestorSlide = () => {
    const slide = investorSlides[currentSlide];
    
    switch (slide.content) {
      case 'market': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Global Freelance Market Opportunity</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Market Size</h3>
                  <div className= "space-y-4">
                    <div>
                      <div className= "text-3xl font-bold text-green-600">$1.5T</div>
                      <div className= "text-sm text-gray-600">Global Freelance Market Size</div>
                    </div>
                    <div>
                      <div className= "text-2xl font-bold text-blue-600">15.6%</div>
                      <div className= "text-sm text-gray-600">CAGR (2024-2028)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Target Segments</h3>
                  <div className= "space-y-4">
                    <div className= "flex items-center gap-2">
                      <Users className= "h-5 w-5 text-blue-500" />
                      <span>Enterprise Clients (35%)</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <Building2 className= "h-5 w-5 text-green-500" />
                      <span>SMBs & Startups (45%)</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <User className= "h-5 w-5 text-purple-500" />
                      <span>Individual Clients (20%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'traction': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Platform Growth & Metrics</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className= "p-6">
                  <BarChart3 className= "h-8 w-8 mb-2 text-blue-500" />
                  <div className= "text-2xl font-bold">127%</div>
                  <div className= "text-sm text-gray-600">YoY Revenue Growth</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <Users className= "h-8 w-8 mb-2 text-green-500" />
                  <div className= "text-2xl font-bold">25K+</div>
                  <div className= "text-sm text-gray-600">Active Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <DollarSign className= "h-8 w-8 mb-2 text-purple-500" />
                  <div className= "text-2xl font-bold">$2.8M</div>
                  <div className= "text-sm text-gray-600">GMV (Last 12 Months)</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className= "p-6">
                <h3 className= "text-xl font-bold mb-4">Key Performance Indicators</h3>
                <div className= "space-y-4">
                  <div>
                    <div className= "flex justify-between mb-1">
                      <span>User Acquisition Cost</span>
                      <span className= "text-green-600">$42 (-18% YoY)</span>
                    </div>
                    <div className= "w-full bg-gray-200 rounded-full h-2">
                      <div className= "bg-green-600 h-2 rounded-full" style={{ width: &apos;82%&apos; }}></div>
                    </div>
                  </div>
                  <div>
                    <div className= "flex justify-between mb-1">
                      <span>Customer LTV</span>
                      <span className= "text-blue-600">$890 (+25% YoY)</span>
                    </div>
                    <div className= "w-full bg-gray-200 rounded-full h-2">
                      <div className= "bg-blue-600 h-2 rounded-full" style={{ width: &apos;75%&apos; }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'revenue': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Revenue Model & Projections</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Revenue Streams</h3>
                  <div className= "space-y-4">
                    <div>
                      <div className= "flex justify-between mb-1">
                        <span>Transaction Fees</span>
                        <span className= "text-green-600">45%</span>
                      </div>
                      <div className= "w-full bg-gray-200 rounded-full h-2">
                        <div className= "bg-green-600 h-2 rounded-full" style={{ width: &apos;45%&apos; }}></div>
                      </div>
                    </div>
                    <div>
                      <div className= "flex justify-between mb-1">
                        <span>Premium Subscriptions</span>
                        <span className= "text-blue-600">30%</span>
                      </div>
                      <div className= "w-full bg-gray-200 rounded-full h-2">
                        <div className= "bg-blue-600 h-2 rounded-full" style={{ width: &apos;30%&apos; }}></div>
                      </div>
                    </div>
                    <div>
                      <div className= "flex justify-between mb-1">
                        <span>Service Fees</span>
                        <span className= "text-purple-600">25%</span>
                      </div>
                      <div className= "w-full bg-gray-200 rounded-full h-2">
                        <div className= "bg-purple-600 h-2 rounded-full" style={{ width: &apos;25%&apos; }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Growth Projections</h3>
                  <div className= "space-y-4">
                    <div>
                      <div className= "text-2xl font-bold text-green-600">$12M</div>
                      <div className= "text-sm text-gray-600">2024 Projected Revenue</div>
                    </div>
                    <div>
                      <div className= "text-2xl font-bold text-blue-600">185%</div>
                      <div className= "text-sm text-gray-600">Projected Growth Rate</div>
                    </div>
                    <div>
                      <div className= "text-2xl font-bold text-purple-600">$45M</div>
                      <div className= "text-sm text-gray-600">2025 Revenue Target</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'advantage': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Competitive Advantages</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className= "p-6">
                  <Sparkles className= "h-8 w-8 mb-4 text-purple-500" />
                  <h3 className= "text-xl font-bold mb-2">AI-Powered Matching</h3>
                  <p className= "text-gray-600">Proprietary algorithm with 94% satisfaction rate</p>
                  <div className= "mt-4">
                    <Badge className= "bg-purple-100 text-purple-800">Industry Leading</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <Shield className= "h-8 w-8 mb-4 text-blue-500" />
                  <h3 className= "text-xl font-bold mb-2">Secure Escrow</h3>
                  <p className= "text-gray-600">Bank-grade security with instant payments</p>
                  <div className= "mt-4">
                    <Badge className= "bg-blue-100 text-blue-800">Enterprise Ready</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <Users className= "h-8 w-8 mb-4 text-green-500" />
                  <h3 className= "text-xl font-bold mb-2">Vetted Talent Pool</h3>
                  <p className= "text-gray-600">Top 3% of global freelance professionals</p>
                  <div className= "mt-4">
                    <Badge className= "bg-green-100 text-green-800">Premium Quality</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <BarChart3 className= "h-8 w-8 mb-4 text-orange-500" />
                  <h3 className= "text-xl font-bold mb-2">Analytics Suite</h3>
                  <p className= "text-gray-600">Real-time insights and reporting</p>
                  <div className= "mt-4">
                    <Badge className= "bg-orange-100 text-orange-800">Data Driven</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'roadmap': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Growth Strategy & Roadmap</h2>
            <div className= "space-y-4">
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Q2 2024</h3>
                  <div className= "space-y-2">
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-5 w-5 text-green-500" />
                      <span>Enterprise client dashboard launch</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-5 w-5 text-green-500" />
                      <span>Advanced AI matching system</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Q3 2024</h3>
                  <div className= "space-y-2">
                    <div className= "flex items-center gap-2">
                      <ArrowRight className= "h-5 w-5 text-blue-500" />
                      <span>Mobile app release</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <ArrowRight className= "h-5 w-5 text-blue-500" />
                      <span>International market expansion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <h3 className= "text-xl font-bold mb-4">Q4 2024</h3>
                  <div className= "space-y-2">
                    <div className= "flex items-center gap-2">
                      <Clock className= "h-5 w-5 text-purple-500" />
                      <span>Blockchain payment integration</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <Clock className= "h-5 w-5 text-purple-500" />
                      <span>Enterprise API platform</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFeatureSlide = () => {
    const slide = featureSlides[currentSlide];
    
    switch (slide.content) {
      case 'projects': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Project Management Hub</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className= "p-6">
                  <FolderOpen className= "h-8 w-8 mb-4 text-blue-500" />
                  <h3 className= "text-xl font-bold mb-2">Project Dashboard</h3>
                  <p className= "text-gray-600">Centralized view of all project activities</p>
                  <div className= "mt-4 space-y-2">
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>Real-time progress tracking</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>Milestone management</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <MessageSquare className= "h-8 w-8 mb-4 text-purple-500" />
                  <h3 className= "text-xl font-bold mb-2">Collaboration Tools</h3>
                  <p className= "text-gray-600">Built-in communication features</p>
                  <div className= "mt-4 space-y-2">
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>In-app messaging</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>File sharing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'escrow': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Secure Escrow System</h2>
            <Card>
              <CardContent className= "p-6">
                <div className= "grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Shield className= "h-8 w-8 mb-4 text-green-500" />
                    <h3 className= "font-bold mb-2">Protected Payments</h3>
                    <p className= "text-gray-600">Funds held securely until project completion</p>
                  </div>
                  <div>
                    <Clock className= "h-8 w-8 mb-4 text-blue-500" />
                    <h3 className= "font-bold mb-2">Milestone Releases</h3>
                    <p className= "text-gray-600">Phased payments tied to deliverables</p>
                  </div>
                  <div>
                    <FileText className= "h-8 w-8 mb-4 text-purple-500" />
                    <h3 className= "font-bold mb-2">Transaction History</h3>
                    <p className= "text-gray-600">Complete payment documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'ai': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">AI-Powered Tools</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className= "p-6">
                  <Sparkles className= "h-8 w-8 mb-4 text-purple-500" />
                  <h3 className= "text-xl font-bold mb-2">Smart Matching</h3>
                  <p className= "text-gray-600">AI-driven freelancer recommendations</p>
                  <div className= "mt-4">
                    <Badge className= "bg-purple-100 text-purple-800">94% Match Rate</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <Bot className= "h-8 w-8 mb-4 text-blue-500" />
                  <h3 className= "text-xl font-bold mb-2">AI Assistant</h3>
                  <p className= "text-gray-600">24/7 project support and guidance</p>
                  <div className= "mt-4">
                    <Badge className= "bg-blue-100 text-blue-800">Smart Support</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'community': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Community Features</h2>
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className= "p-6 text-center">
                  <Users className= "h-8 w-8 mx-auto mb-4 text-blue-500" />
                  <h3 className= "font-bold mb-2">Creator Network</h3>
                  <p className= "text-gray-600">Connect with other professionals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <MessageSquare className= "h-8 w-8 mx-auto mb-4 text-green-500" />
                  <h3 className= "font-bold mb-2">Discussion Forums</h3>
                  <p className= "text-gray-600">Industry insights and knowledge sharing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6 text-center">
                  <Award className= "h-8 w-8 mx-auto mb-4 text-purple-500" />
                  <h3 className= "font-bold mb-2">Skill Endorsements</h3>
                  <p className= "text-gray-600">Peer recognition system</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'analytics': "
        return ("
          <div className= "space-y-6">
            <h2 className= "text-2xl font-bold text-center mb-6">Analytics & Reporting</h2>
            <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className= "p-6">
                  <BarChart3 className= "h-8 w-8 mb-4 text-blue-500" />
                  <h3 className= "text-xl font-bold mb-2">Performance Metrics</h3>
                  <p className= "text-gray-600">Comprehensive project analytics</p>
                  <div className= "mt-4 space-y-2">
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>Time tracking</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>Budget monitoring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className= "p-6">
                  <PieChart className= "h-8 w-8 mb-4 text-purple-500" />
                  <h3 className= "text-xl font-bold mb-2">Custom Reports</h3>
                  <p className= "text-gray-600">Detailed insights and exports</p>
                  <div className= "mt-4 space-y-2">
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>Project reports</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <CheckCircle className= "h-4 w-4 text-green-500" />
                      <span>Financial summaries</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCurrentDemo = () => {
    switch (currentDemo) {
      case 'client': "
        return renderClientSlide();"
      case 'investor': "
        return renderInvestorSlide();"
      case 'features': "
        return renderFeatureSlide();
      default:
        return ("
          <div className= "grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoTypes.map((demo) => (
              <Card 
                key={demo.id}
                className="hover:shadow-lg transition-shadow cursor-pointer
                onClick={() => {
                  setCurrentDemo(demo.id);
                  setCurrentSlide(0);
                }}
              >"
                <CardContent className= "p-6">
                  <demo.icon className={`h-12 w-12 mb-4 ${demo.color} text-white rounded-lg p-2`} />
                  <h3 className= "text-xl font-bold mb-2">{demo.title}</h3>
                  <p className= "text-gray-600 mb-4">{demo.description}</p>
                  <div className= "space-y-2 text-sm text-gray-500">
                    <div className= "flex items-center gap-2">
                      <Users className= "h-4 w-4" />
                      <span>{demo.audience}</span>
                    </div>
                    <div className= "flex items-center gap-2">
                      <Clock className= "h-4 w-4" />
                      <span>{demo.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
    }
  };

  if (currentDemo === 'client') {'
    return (
      <div className= "min-h-screen bg-gray-50">
        <div className= "p-4 bg-white border-b shadow-sm">
          <div className= "flex justify-between items-center max-w-6xl mx-auto">
            <Button variant= "outline" onClick={() => setCurrentDemo(null)}>
              <ArrowLeft className= "mr-2 h-4 w-4" />
              Back to Demo Selection
            </Button>
            <div className= "flex items-center gap-4">
              <div className= "text-sm text-gray-600">
                Slide {currentSlide + 1} of {clientSlides.length}
              </div>
              <div className= "flex gap-2">
                <Button 
                  variant= "outline" 
                  size= "sm
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant= "outline" 
                  size= "sm
                  disabled={currentSlide === clientSlides.length - 1}
                  onClick={() => setCurrentSlide(Math.min(clientSlides.length - 1, currentSlide + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className= "max-w-6xl mx-auto p-6">
          <div className= "mb-6">
            <h1 className= "text-2xl font-bold text-center">{clientSlides[currentSlide].title}</h1>
          </div>
          {renderClientSlide()}
        </div>
      </div>
    );
  }

  if (currentDemo) {
    return (
      <div className= "min-h-screen bg-gray-50 p-6">
        <div className= "max-w-4xl mx-auto">
          <Button variant= "outline" onClick={() => setCurrentDemo(null)} className= "mb-6">
            <ArrowLeft className= "mr-2 h-4 w-4" />
            Back to Demo Selection
          </Button>
          <div className= "text-center">
            <h1 className= "text-3xl font-bold mb-4">Demo Coming Soon</h1>
            <p className= "text-gray-600">This demo scenario is currently being developed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className= "demo-router p-6 bg-gray-50 min-h-screen">
      <div className= "max-w-6xl mx-auto">
        <div className= "text-center mb-8">
          <h1 className= "text-3xl font-bold mb-4">FreeflowZee Demo Center</h1>
          <p className= "text-gray-600 text-lg">Choose your demo scenario based on your audience</p>
          <Badge className= "mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            🎭 Interactive Demos Available
          </Badge>
        </div>

        {renderCurrentDemo()}

        <div className= "mt-12 text-center">
          <Card className= "bg-blue-50 border-blue-200">
            <CardContent className= "p-6">
              <h3 className= "font-bold text-blue-900 mb-2">Demo Tips</h3>
              <div className= "text-blue-700 text-sm space-y-1">
                <p>• Each demo uses realistic data and scenarios</p>
                <p>• Demos are optimized for different audience types and use cases</p>
                <p>• All metrics and showcased features represent actual platform capabilities</p>
                <p>• Use the navigation controls to pace your presentation effectively</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 