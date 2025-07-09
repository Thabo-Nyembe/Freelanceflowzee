const fs = require('fs');
const path = require('path');

class DashboardAnalyzer {
  constructor() {
    this.results = {
      components: {},
      pages: {},
      functionality: {},
      issues: [],
      status: {}
    };
  }

  analyzeComponentStructure() {
    console.log('📊 Analyzing component structure...');
    
    // Check main dashboard page
    const dashboardPath = path.join(__dirname, 'app/(app)/dashboard/page.tsx');
    if (fs.existsSync(dashboardPath)) {
      const content = fs.readFileSync(dashboardPath, 'utf8');
      
      this.results.components.mainDashboard = {
        exists: true,
        hasTabNavigation: content.includes('Tabs') && content.includes('TabsTrigger'),
        hasOverview: content.includes('DashboardOverview'),
        hasProjectsHub: content.includes('ProjectsHubPlaceholder'),
        hasAICreate: content.includes('AICreatePlaceholder'),
        hasVideoStudio: content.includes('VideoStudioPlaceholder'),
        hasFilesHub: content.includes('FilesHubPlaceholder'),
        hasCommunity: content.includes('CommunityPlaceholder'),
        hasMyDay: content.includes('MyDayPlaceholder'),
        hasEscrow: content.includes('EscrowPlaceholder'),
        hasGlobalSearch: content.includes('GlobalSearch'),
        hasAnimations: content.includes('framer-motion'),
        hasMockData: content.includes('mockData'),
        hasInteractiveElements: content.includes('onClick') || content.includes('onValueChange')
      };
    }
    
    // Check individual page implementations
    const pages = [
      'projects-hub',
      'ai-create',
      'video-studio',
      'files-hub',
      'community-hub',
      'my-day',
      'escrow'
    ];
    
    pages.forEach(page => {
      const pagePath = path.join(__dirname, `app/(app)/dashboard/${page}/page.tsx`);
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        this.results.pages[page] = {
          exists: true,
          hasContent: content.length > 200,
          hasInteractivity: content.includes('onClick') || content.includes('useState'),
          hasDataLoading: content.includes('useEffect') || content.includes('async'),
          hasErrorHandling: content.includes('try') || content.includes('catch'),
          isPlaceholder: content.includes('coming soon') || content.includes('Coming Soon')
        };
      } else {
        this.results.pages[page] = {
          exists: false,
          issue: 'Page file not found'
        };
        this.results.issues.push(`Missing page: ${page}`);
      }
    });
  }

  analyzeComponents() {
    console.log('🔍 Analyzing key components...');
    
    // Check AI Create component
    const aiCreatePath = path.join(__dirname, 'components/ai/ai-create.tsx');
    if (fs.existsSync(aiCreatePath)) {
      const content = fs.readFileSync(aiCreatePath, 'utf8');
      this.results.components.aiCreate = {
        exists: true,
        hasAPIKeyInput: content.includes('type="password"'),
        hasProviderTabs: content.includes('AI_PROVIDERS'),
        hasValidation: content.includes('validation') || content.includes('validate'),
        hasErrorHandling: content.includes('setError'),
        hasLoadingState: content.includes('saving') || content.includes('loading'),
        hasTestIds: content.includes('data-testid')
      };
    }
    
    // Check Global Search component
    const globalSearchPath = path.join(__dirname, 'components/global-search.tsx');
    if (fs.existsSync(globalSearchPath)) {
      const content = fs.readFileSync(globalSearchPath, 'utf8');
      this.results.components.globalSearch = {
        exists: true,
        hasKeyboardShortcuts: content.includes('keydown') && content.includes('Cmd'),
        hasDialog: content.includes('Dialog'),
        hasSearch: content.includes('Search'),
        hasFiltering: content.includes('filter'),
        hasNavigation: content.includes('router.push')
      };
    }
    
    // Check Video Studio component
    const videoStudioPath = path.join(__dirname, 'components/collaboration/enterprise-video-studio.tsx');
    if (fs.existsSync(videoStudioPath)) {
      const content = fs.readFileSync(videoStudioPath, 'utf8');
      this.results.components.videoStudio = {
        exists: true,
        hasRecording: content.includes('record') || content.includes('Record'),
        hasEditing: content.includes('edit') || content.includes('Edit'),
        hasSharing: content.includes('share') || content.includes('Share'),
        hasExport: content.includes('export') || content.includes('Export')
      };
    }
  }

  checkDataFlow() {
    console.log('💾 Checking data flow and API integration...');
    
    // Check for API routes
    const apiPath = path.join(__dirname, 'app/api');
    if (fs.existsSync(apiPath)) {
      const apiDirs = fs.readdirSync(apiPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      this.results.functionality.apiRoutes = apiDirs;
      this.results.functionality.hasAPIIntegration = apiDirs.length > 0;
    }
    
    // Check for database integration
    const libPath = path.join(__dirname, 'lib');
    if (fs.existsSync(libPath)) {
      const libFiles = fs.readdirSync(libPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
      
      this.results.functionality.hasSupabase = libFiles.some(f => f.includes('supabase'));
      this.results.functionality.hasDatabase = libFiles.some(f => f.includes('database'));
      this.results.functionality.hasStorage = libFiles.some(f => f.includes('storage'));
    }
  }

  checkInteractivity() {
    console.log('🎮 Checking interactive elements...');
    
    // Check for UI components
    const uiPath = path.join(__dirname, 'components/ui');
    if (fs.existsSync(uiPath)) {
      const uiComponents = fs.readdirSync(uiPath)
        .filter(f => f.endsWith('.tsx'))
        .map(f => f.replace('.tsx', ''));
      
      this.results.functionality.uiComponents = uiComponents;
      this.results.functionality.hasButtons = uiComponents.includes('button');
      this.results.functionality.hasModals = uiComponents.includes('dialog');
      this.results.functionality.hasForms = uiComponents.includes('form');
      this.results.functionality.hasTabs = uiComponents.includes('tabs');
    }
    
    // Check for hooks
    const hooksPath = path.join(__dirname, 'hooks');
    if (fs.existsSync(hooksPath)) {
      const hookFiles = fs.readdirSync(hooksPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
      
      this.results.functionality.hooks = hookFiles;
      this.results.functionality.hasCustomHooks = hookFiles.length > 0;
    }
  }

  analyzeIssues() {
    console.log('🔍 Analyzing potential issues...');
    
    // Check for common issues
    const dashboardPath = path.join(__dirname, 'app/(app)/dashboard/page.tsx');
    if (fs.existsSync(dashboardPath)) {
      const content = fs.readFileSync(dashboardPath, 'utf8');
      
      // Check for placeholder content
      if (content.includes('placeholder') || content.includes('coming soon')) {
        this.results.issues.push('Dashboard contains placeholder content');
      }
      
      // Check for missing error handling
      if (!content.includes('try') && !content.includes('catch')) {
        this.results.issues.push('Dashboard lacks error handling');
      }
      
      // Check for hardcoded data
      if (content.includes('mockData') || content.includes('Mock data')) {
        this.results.issues.push('Dashboard uses mock/hardcoded data');
      }
    }
    
    // Check for missing implementations
    const missingPages = Object.entries(this.results.pages)
      .filter(([_, page]) => !page.exists || page.isPlaceholder)
      .map(([name, _]) => name);
    
    if (missingPages.length > 0) {
      this.results.issues.push(`Missing or placeholder pages: ${missingPages.join(', ')}`);
    }
  }

  generateSummary() {
    console.log('📊 Generating summary...');
    
    const totalPages = Object.keys(this.results.pages).length;
    const workingPages = Object.values(this.results.pages).filter(p => p.exists && !p.isPlaceholder).length;
    const placeholderPages = Object.values(this.results.pages).filter(p => p.isPlaceholder).length;
    
    this.results.status = {
      totalPages,
      workingPages,
      placeholderPages,
      completionRate: Math.round((workingPages / totalPages) * 100),
      totalIssues: this.results.issues.length,
      hasMainDashboard: this.results.components.mainDashboard?.exists || false,
      hasTabNavigation: this.results.components.mainDashboard?.hasTabNavigation || false,
      hasInteractiveElements: this.results.components.mainDashboard?.hasInteractiveElements || false,
      hasAPIIntegration: this.results.functionality.hasAPIIntegration || false,
      hasDatabaseIntegration: this.results.functionality.hasDatabase || false
    };
  }

  generateReport() {
    console.log('📄 Generating comprehensive report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      dashboardAnalysis: this.results,
      findings: {
        workingFeatures: [],
        brokenFeatures: [],
        placeholderFeatures: [],
        recommendations: []
      }
    };
    
    // Categorize findings
    Object.entries(this.results.pages).forEach(([name, page]) => {
      if (page.exists && !page.isPlaceholder) {
        report.findings.workingFeatures.push(name);
      } else if (page.isPlaceholder) {
        report.findings.placeholderFeatures.push(name);
      } else {
        report.findings.brokenFeatures.push(name);
      }
    });
    
    // Add recommendations
    if (report.findings.placeholderFeatures.length > 0) {
      report.findings.recommendations.push('Complete placeholder page implementations');
    }
    
    if (this.results.issues.length > 0) {
      report.findings.recommendations.push('Fix identified issues: ' + this.results.issues.join(', '));
    }
    
    if (!this.results.functionality.hasAPIIntegration) {
      report.findings.recommendations.push('Add API integration for data fetching');
    }
    
    if (this.results.components.mainDashboard?.hasMockData) {
      report.findings.recommendations.push('Replace mock data with real data sources');
    }
    
    // Write report
    const reportPath = path.join(__dirname, 'dashboard-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  async run() {
    try {
      console.log('🚀 Starting dashboard analysis...');
      
      this.analyzeComponentStructure();
      this.analyzeComponents();
      this.checkDataFlow();
      this.checkInteractivity();
      this.analyzeIssues();
      this.generateSummary();
      
      const report = this.generateReport();
      
      console.log('\n🎉 Dashboard analysis completed!');
      console.log('📊 Status:', this.results.status);
      console.log('🔧 Issues found:', this.results.issues.length);
      console.log('💡 Recommendations:', report.findings.recommendations.length);
      
      return report;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }
}

// Run the analysis
const analyzer = new DashboardAnalyzer();
analyzer.run().catch(console.error);