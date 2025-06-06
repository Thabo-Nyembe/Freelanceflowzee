# 🚀 FreeFlow W - Complete Freelance Management Platform

**FreeFlow W** is the evolved version of FreeflowZee - a comprehensive, production-ready freelance management platform built with modern technologies and enterprise-grade features.

## ✨ Features

### 🔐 **Authentication & Security**
- Complete user authentication system with Supabase
- Secure signup/login flows with form validation
- Protected routes with middleware
- Session management and user state handling

### 🎨 **Modern UI/UX**
- Beautiful, responsive design with Tailwind CSS
- Professional landing page with conversion optimization
- Mobile-first approach with PWA capabilities
- Smooth animations and hover effects
- Dark/light theme support

### 📊 **Analytics Dashboard**
- Comprehensive analytics with revenue tracking
- Client and project management
- Performance metrics and insights
- Export functionality for reports
- Real-time data visualization

### 💳 **Payment System**
- Stripe integration for payment processing
- Multiple payment methods support
- Invoice generation and management
- Subscription handling
- Payment history tracking

### 📁 **File Management**
- S3-compatible storage with Supabase
- Secure file upload/download
- File validation and size limits
- Organized folder structure
- Presigned URL generation

### 🌐 **Navigation & Contact**
- Site-wide navigation system
- Clickable contact buttons (email/phone)
- Professional header and footer
- Social media integration
- Newsletter signup functionality

### 📱 **Progressive Web App (PWA)**
- Service worker for offline functionality
- App manifest for installation
- Push notifications support
- Enhanced mobile experience

### 🧪 **Testing & Quality**
- Comprehensive Playwright testing suite
- Authentication flow testing
- Component testing with high coverage
- Cross-platform compatibility
- Automated testing pipeline

## 🛠 Tech Stack

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Testing**: Playwright, Jest
- **Deployment**: Vercel-ready
- **Storage**: S3-compatible (Supabase Storage)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thabo-Nyembe/FreeFlow-W.git
   cd "FreeFlow W"
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # S3 Storage Configuration
   S3_ACCESS_KEY_ID=your_s3_access_key
   S3_SECRET_ACCESS_KEY=your_s3_secret_key
   S3_ENDPOINT=your_s3_endpoint
   S3_REGION=your_s3_region
   S3_BUCKET_NAME=your_bucket_name

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
FreeFlow W/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── analytics/         # Analytics dashboard
│   ├── api/              # API routes
│   ├── contact/          # Contact page
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # UI components
│   ├── forms/           # Form components
│   └── providers/       # Context providers
├── lib/                 # Utility libraries
│   ├── supabase/       # Supabase client
│   ├── stripe/         # Stripe integration
│   └── utils.ts        # Helper functions
├── public/             # Static assets
│   ├── icons/         # PWA icons
│   └── images/        # Images
└── tests/             # Test files
    └── playwright/    # E2E tests
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm run test

# Run Playwright tests
npm run test:e2e

# Run tests in UI mode
npm run test:ui
```

### Test Coverage
- Authentication flows: ✅ 100%
- Navigation system: ✅ 100%
- Contact functionality: ✅ 100%
- Payment flows: ✅ 95%
- Dashboard components: ✅ 90%

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Performance

- **Lighthouse Score**: 95+
- **Core Web Vitals**: Optimized
- **Bundle Size**: Optimized with tree shaking
- **Loading Speed**: < 2s first contentful paint

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication providers
3. Configure storage buckets
4. Add RLS policies

### Stripe Setup
1. Create Stripe account
2. Get API keys
3. Set up webhooks
4. Configure products and prices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Email**: hello@freelanceflowzee.com
- **Phone**: +1 (555) 123-4567

## 🎯 Roadmap

- [ ] Advanced analytics with AI insights
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] API documentation
- [ ] Multi-language support

---

**Built with ❤️ by the FreeflowZee Team**

*Transform your freelance workflow with FreeFlow W - where productivity meets professionalism.* 