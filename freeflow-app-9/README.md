# 🚀 FreeflowT - Modern Freelance Management Platform

*The next generation of freelance project management with Framework7-inspired design*

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)

## ✨ Overview

FreeflowT is a **modern, Framework7-inspired freelance management platform** built with cutting-edge web technologies. It provides a comprehensive solution for freelancers, agencies, and creative professionals to manage projects, clients, time tracking, and financial operations with a beautiful, intuitive interface.

### 🎯 Key Features

- **🎨 Framework7-Inspired Design** - Modern, iOS-style interface with smooth animations
- **📊 Comprehensive Dashboard** - Real-time analytics and project overview
- **👥 Advanced Client Management** - Relationship tracking with detailed profiles
- **⏱️ Smart Time Tracking** - Automated time logging with project categorization
- **💰 Financial Management** - Invoice generation, payment tracking, and revenue analytics
- **🚀 Project Management** - Full project lifecycle management with team collaboration
- **📱 Responsive Design** - Perfect experience across all devices
- **🔐 Secure Authentication** - Supabase-powered auth with role-based access

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: Custom components inspired by Framework7 design principles
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui with modern customizations
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks with context for global state

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Supabase Storage (S3-compatible)
- **Payment Processing**: Stripe integration
- **API Layer**: Next.js API routes with TypeScript

### Development & Testing
- **Language**: TypeScript with strict typing
- **Testing**: Playwright for E2E testing
- **Linting**: ESLint with Next.js configuration
- **Development**: Hot reload with Turbopack

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/freeflowt.git
   cd freeflowt
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Environment Variables**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
   STRIPE_SECRET_KEY=your_stripe_sk
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   ```
   http://localhost:3000
   ```

## 📱 Features Overview

### 🏠 Modern Dashboard
- **Framework7-inspired cards** with hover animations and gradients
- **Real-time metrics** for projects, revenue, and client satisfaction
- **Quick actions** for common tasks
- **Today's schedule** with task management
- **Project overview** with progress tracking

### 👥 Client Management
- **Beautiful client cards** with tier badges and status indicators
- **Comprehensive client profiles** with project history
- **Communication tracking** and relationship management
- **Revenue analytics** per client
- **Client satisfaction ratings** with visual indicators

### 📊 Project Tracking
- **Kanban-style boards** for project visualization
- **Progress tracking** with milestone management
- **Team collaboration** features
- **File management** with version control
- **Time tracking integration**

### ⏰ Time Management
- **Automatic time tracking** with project categorization
- **Manual time entry** with detailed descriptions
- **Time reports** and analytics
- **Billable hours calculation**
- **Integration with invoicing**

### 💰 Financial Tools
- **Professional invoice generation**
- **Payment tracking** with Stripe integration
- **Revenue analytics** and reporting
- **Expense management**
- **Financial dashboards**

### 🔧 Additional Features
- **Team collaboration** tools
- **File storage** and sharing
- **Notification system**
- **Mobile-responsive design**
- **Dark/light theme support**

## 🎨 Design System

FreeflowT uses a **Framework7-inspired design language** with:

### Color Palette
```css
/* Primary Colors */
--primary: #007AFF;        /* iOS Blue */
--secondary: #5856D6;      /* iOS Purple */
--success: #34C759;        /* iOS Green */
--warning: #FF9500;        /* iOS Orange */
--danger: #FF3B30;         /* iOS Red */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #007AFF, #5856D6);
--gradient-success: linear-gradient(135deg, #34C759, #007AFF);
--gradient-warning: linear-gradient(135deg, #FF9500, #FF3B30);
```

### Typography
- **Headers**: SF Pro Display inspired fonts
- **Body**: System font stack for optimal readability
- **Code**: JetBrains Mono for technical content

### Components
- **Cards**: Elevated surfaces with subtle shadows
- **Buttons**: iOS-style with haptic feedback animations
- **Forms**: Clean, minimal design with focus states
- **Navigation**: Bottom tab bar + sidebar combination

## 📁 Project Structure

```
freeflowt/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Main application routes
│   │   └── dashboard/           # Dashboard pages
│   │       ├── clients/         # Client management
│   │       ├── projects/        # Project management
│   │       ├── time-tracking/   # Time tracking
│   │       └── financial/       # Financial management
│   ├── (auth)/                  # Authentication pages
│   ├── (marketing)/             # Public pages
│   └── api/                     # API routes
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── dashboard/               # Dashboard-specific components
│   └── forms/                   # Form components
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client
│   ├── stripe/                 # Stripe integration
│   └── utils/                  # Helper functions
├── types/                       # TypeScript type definitions
├── styles/                      # Global styles
└── public/                      # Static assets
```

## 🧪 Testing

FreeflowT includes comprehensive testing coverage:

### E2E Testing with Playwright
```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:dashboard
npm run test:payment

# Debug mode
npm run test:debug

# UI mode
npm run test:ui
```

### Test Coverage
- ✅ **Authentication flows** - Login, signup, logout
- ✅ **Dashboard functionality** - Navigation, stats, quick actions
- ✅ **Client management** - CRUD operations, filtering, search
- ✅ **Project tracking** - Creation, updates, progress tracking
- ✅ **Payment system** - Stripe integration, invoice generation
- ✅ **Responsive design** - Mobile, tablet, desktop viewports

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t freeflowt .

# Run container
docker run -p 3000:3000 freeflowt
```

### Manual Deployment
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication providers
3. Configure RLS policies
4. Import database schema from `/supabase/migrations`

### Stripe Setup
1. Create Stripe account
2. Configure webhooks
3. Set up products and pricing
4. Test payment flows

## 📈 Performance

FreeflowT is optimized for performance:

- **Core Web Vitals**: Excellent scores across all metrics
- **Bundle Size**: Optimized with tree shaking and code splitting
- **Loading**: Progressive loading with skeleton states
- **Caching**: Intelligent caching strategies
- **Images**: Next.js Image optimization
- **API**: Efficient data fetching with React Query

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Conventional commits
- Component documentation
- Test coverage requirements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.freeflowt.com](https://docs.freeflowt.com)
- **Community**: [Discord Server](https://discord.gg/freeflowt)
- **Issues**: [GitHub Issues](https://github.com/your-username/freeflowt/issues)
- **Email**: support@freeflowt.com

## 🎯 Roadmap

### Q1 2025
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API integrations (Zapier, etc.)
- [ ] Advanced reporting

### Q2 2025
- [ ] AI-powered insights
- [ ] Multi-language support
- [ ] Advanced team features
- [ ] Enterprise features

## 🙏 Acknowledgments

- **Framework7** - Design inspiration
- **Vercel** - Deployment platform
- **Supabase** - Backend infrastructure
- **Stripe** - Payment processing
- **Open Source Community** - Amazing tools and libraries

---

**Built with ❤️ by the FreeflowT team**

*Empowering freelancers and creative professionals worldwide* 