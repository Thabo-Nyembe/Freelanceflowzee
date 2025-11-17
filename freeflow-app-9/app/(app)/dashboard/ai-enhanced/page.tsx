'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Palette, 
  MessageSquare, 
  Clock, 
  Target,
  TrendingUp,
  Zap,
  Star,
  Rocket,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import SimpleAIChat from '@/components/ai/simple-ai-chat';

export default function AIEnhancedPage() {
  const [_activeDemo, setActiveDemo] = useState<string | null>(null);

  // Handlers
  const handleTryDemo = (featureId: string, demoPrompt: string) => { console.log('🎯 TRY DEMO:', featureId); setActiveDemo(featureId); alert(`🎯 AI Demo\n\nFeature: ${featureId}\n\nPrompt: ${demoPrompt}\n\nInitializing AI assistant...`) }
  const handleProjectAnalysis = () => { console.log('🧠 PROJECT ANALYSIS'); alert('🧠 AI Project Analysis\n\nAnalyzing:\n• Requirements\n• Timeline\n• Budget\n• Resources\n• Risks') }
  const handleGenerateAssets = () => { console.log('🎨 GENERATE ASSETS'); alert('🎨 Creative Asset Generation\n\nCreating:\n• Color palettes\n• Typography\n• Style guide\n• Brand assets') }
  const handleDraftCommunication = (type: string) => { console.log('✉️ DRAFT:', type); alert(`✉️ Professional Communication\n\nDrafting ${type}...\n\nAnalyzing context\nMatching tone\nGenerating content`) }
  const handleOptimizeWorkflow = () => { console.log('⚡ OPTIMIZE'); alert('⚡ Workflow Optimization\n\nAnalyzing:\n• Time allocation\n• Resource distribution\n• Phase prioritization\n• Efficiency opportunities') }
  const handleAIConsultation = () => { console.log('💡 CONSULT'); alert('💡 AI Consultation\n\nGet personalized business insights and recommendations') }
  const handleGenerateProposal = () => { console.log('📄 PROPOSAL'); alert('📄 AI Proposal Generator\n\nCreating professional project proposal...') }
  const handleAnalyzeCompetition = () => { console.log('🔍 COMPETITION'); alert('🔍 Competitor Analysis\n\nResearching market positioning and pricing') }
  const handleBudgetOptimization = () => { console.log('💰 BUDGET'); alert('💰 Budget Optimization\n\nOptimizing resource allocation and cost structure') }
  const handleTimelineEstimation = () => { console.log('📅 TIMELINE'); alert('📅 AI Timeline Estimation\n\nCalculating optimal project timeline...') }
  const handleRiskAssessment = () => { console.log('⚠️ RISK'); alert('⚠️ Risk Assessment\n\nIdentifying potential project risks and mitigation strategies') }
  const handleGenerateContract = () => { console.log('📝 CONTRACT'); alert('📝 Contract Generator\n\nCreating customized service agreement...') }
  const handleClientProfiling = () => { console.log('👤 PROFILE'); alert('👤 Client Profiling\n\nAnalyzing client preferences and communication style') }
  const handleScopeAnalysis = () => { console.log('🎯 SCOPE'); alert('🎯 Scope Analysis\n\nDefining project boundaries and deliverables') }
  const handlePricingStrategy = () => { console.log('💵 PRICING'); alert('💵 AI Pricing Strategy\n\nCalculating optimal pricing based on:\n• Market rates\n• Project complexity\n• Client budget\n• Your experience') }
  const handleQualityCheck = () => { console.log('✅ QUALITY'); alert('✅ AI Quality Check\n\nReviewing deliverables for:\n• Standards compliance\n• Best practices\n• Client requirements') }
  const handleGenerateMilestones = () => { console.log('🎯 MILESTONES'); alert('🎯 Milestone Generation\n\nCreating project checkpoints and deliverables') }
  const handleResourcePlanning = () => { console.log('📊 RESOURCES'); alert('📊 Resource Planning\n\nOptimizing team allocation and tool usage') }
  const handlePerformanceInsights = () => { console.log('📈 INSIGHTS'); alert('📈 Performance Insights\n\nAnalyzing your business metrics and growth opportunities') }
  const handleAutomateReporting = () => { console.log('📊 AUTO REPORT'); alert('📊 Automated Reporting\n\nGenerating comprehensive progress reports') }
  const handleSentimentAnalysis = () => { console.log('😊 SENTIMENT'); alert('😊 Client Sentiment Analysis\n\nAnalyzing client feedback and satisfaction levels') }
  const handleTrendAnalysis = () => { console.log('📈 TRENDS'); alert('📈 Industry Trend Analysis\n\nIdentifying emerging opportunities in your niche') }
  const handleSkillRecommendations = () => { console.log('🎓 SKILLS'); alert('🎓 Skill Recommendations\n\nSuggesting skills to learn based on market demand') }

  const aiFeatures = [
    {
      id: 'project-analysis',
      icon: Brain,
      title: 'Intelligent Project Analysis',
      description: 'AI-powered project requirements analysis with automated workflow suggestions',
      benefits: [
        'Automated timeline estimation',
        'Risk factor identification',
        'Budget optimization',
        'Resource allocation',
      ],
      demoPrompt: 'Analyze a website project for a restaurant with $3,000 budget',
      color: 'blue',
    },
    {
      id: 'creative-assets',
      icon: Palette,
      title: 'Creative Asset Generation',
      description: 'Generate color palettes, typography, and design assets tailored to your projects',
      benefits: [
        'Industry-specific palettes',
        'Typography recommendations',
        'Brand-aligned suggestions',
        'Style guide creation',
      ],
      demoPrompt: 'Generate assets for a fintech startup targeting young professionals',
      color: 'purple',
    },
    {
      id: 'client-communication',
      icon: MessageSquare,
      title: 'Professional Communication',
      description: 'Draft emails, proposals, and updates with the perfect tone and structure',
      benefits: [
        'Context-aware messaging',
        'Professional tone matching',
        'Template generation',
        'Follow-up suggestions',
      ],
      demoPrompt: 'Draft a project update email for Brand Redesign project',
      color: 'green',
    },
    {
      id: 'optimization',
      icon: TrendingUp,
      title: 'Workflow Optimization',
      description: 'Optimize time allocation, budget distribution, and project phases',
      benefits: [
        'Phase prioritization',
        'Resource optimization',
        'Timeline compression',
        'Efficiency improvements',
      ],
      demoPrompt: 'Optimize a 40-hour, $4,000 e-commerce project timeline',
      color: 'orange',
    },
  ];

  const performanceMetrics = [
    { label: 'Response Time', value: '<2s', icon: Clock },
    { label: 'Accuracy Rate', value: '96%', icon: Target },
    { label: 'User Satisfaction', value: '4.8/5', icon: Star },
    { label: 'Projects Optimized', value: '1,200+', icon: Rocket },
  ];

  const useCases = [
    {
      title: 'Freelance Web Developer',
      description: 'Streamlines project scoping, generates accurate quotes, and optimizes development workflows',
      results: '+40% efficiency, -60% quote preparation time',
    },
    {
      title: 'Design Agency',
      description: 'Accelerates creative asset generation and maintains brand consistency across projects',
      results: '+30% creative output, 100% brand alignment',
    },
    {
      title: 'Digital Marketing Consultant',
      description: 'Enhances client communication and automates campaign optimization strategies',
      results: '+50% client retention, -70% planning overhead',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
      purple: 'border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100',
      green: 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100',
      orange: 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            A+++ Grade AI
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
          Enhanced AI Features
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience next-generation AI capabilities designed specifically for creative professionals and freelancers. 
          Our advanced AI tools understand your workflow and amplify your productivity.
        </p>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
          {performanceMetrics.map((metric, idx) => (
            <div key={idx} className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <metric.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="font-bold text-lg">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${getColorClasses(feature.color)}`}
            onClick={() => setActiveDemo(feature.id)}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm opacity-80 font-normal">{feature.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3" />
                    {benefit}
                  </div>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-between group"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDemo(feature.id);
                }}
              >
                Try: &apos;{feature.demoPrompt}&apos;
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Real-World Success Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{useCase.description}</p>
                <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {useCase.results}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card className="border-2 border-dashed border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Live AI Assistant Demo
          </CardTitle>
          <p className="text-gray-600">
            Try our AI assistant with real FreeflowZee tools. Ask questions about projects, 
            request asset generation, or get workflow optimization suggestions.
          </p>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-[600px] border-t">
            <SimpleAIChat />
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Technical Excellence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">AI Model</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GPT-4o (Latest OpenAI)</li>
                <li>• Context-aware responses</li>
                <li>• Streaming capabilities</li>
                <li>• Tool integration</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time streaming</li>
                <li>• Custom tool definitions</li>
                <li>• Metadata tracking</li>
                <li>• Error handling</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Integration</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI SDK 5.0</li>
                <li>• TypeScript support</li>
                <li>• React components</li>
                <li>• API endpoints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to transform your workflow?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          These AI features are now live in FreeflowZee. Start using them today to boost 
          your productivity and deliver better results for your clients.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Rocket className="w-4 h-4 mr-2" />
            Explore Dashboard
          </Button>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Start Chat Demo
          </Button>
        </div>
      </div>
    </div>
  );
} 