import React from 'react'
import { SassExampleCard } from '@/components/examples/sass-example-card'
import { Code, Palette, Zap, Layers } from 'lucide-react'

export default function SassDemoPage() {
  const examples = [
    {
      title: "Glass Morphism Design",
      description: "Beautiful glass morphism effects with backdrop blur and subtle transparency for modern UI components.",
      image: "/images/glass-demo.jpg",
      rating: 4.9,
      likes: 156
    },
    {
      title: "Responsive Typography",
      description: "Fluid typography that scales perfectly across all devices using Sass mixins and responsive design patterns.",
      image: "/images/typography-demo.jpg", 
      rating: 4.7,
      likes: 89
    },
    {
      title: "Touch-Friendly Interactions",
      description: "44px minimum touch targets and smooth animations that provide excellent user experience on mobile devices.",
      image: "/images/touch-demo.jpg",
      rating: 4.8,
      likes: 124
    },
    {
      title: "Advanced Animations",
      description: "Smooth micro-interactions and hover effects that bring your interface to life with professional polish.",
      image: "/images/animation-demo.jpg",
      rating: 4.6,
      likes: 67
    }
  ]

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Design System Variables",
      description: "Comprehensive Sass variables for colors, typography, spacing, and more."
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Reusable Mixins",
      description: "Powerful mixins for glass morphism, responsive design, and animations."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Optimized",
      description: "CSS modules with tree-shaking and optimized bundle sizes."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Developer Experience",
      description: "IntelliSense support, type safety, and excellent debugging tools."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Sass Integration Demo
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Experience the power of Sass in FreeflowZee with our comprehensive design system, 
            featuring glass morphism, responsive design, and advanced styling capabilities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
              <span className="text-sm font-medium text-slate-700">✨ Glass Morphism</span>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
              <span className="text-sm font-medium text-slate-700">📱 Mobile-First</span>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
              <span className="text-sm font-medium text-slate-700">🎨 Design System</span>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
              <span className="text-sm font-medium text-slate-700">⚡ Performance</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Example Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Interactive Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center">
            {examples.map((example, index) => (
              <SassExampleCard
                key={index}
                title={example.title}
                description={example.description}
                image={example.image}
                rating={example.rating}
                likes={example.likes}
              />
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Sass Usage Example</h2>
          <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`// Import FreeflowZee design system
@import '../../styles/variables';
@import '../../styles/mixins';

.card {
  @include glass-card(0.6, 20px, 0.2);
  @include hover-lift;
  border-radius: $rounded-xl;
  padding: $spacing-6;
  
  &:hover {
    box-shadow: $glass-shadow-lg;
  }
}

.button {
  @include touch-friendly-button;
  @include glass-button;
  background: linear-gradient(135deg, $primary-500, $primary-600);
  
  @include mobile-only {
    width: 100%;
  }
}`}
            </pre>
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            Why Sass + FreeflowZee?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Maintainable Code</h3>
              <p className="text-slate-600">
                Organized variables, mixins, and modular architecture make your styles easy to maintain and scale.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Design Consistency</h3>
              <p className="text-slate-600">
                Centralized design tokens ensure consistent spacing, colors, and typography across your entire application.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Developer Productivity</h3>
              <p className="text-slate-600">
                Powerful mixins and utilities speed up development while maintaining high code quality and best practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 