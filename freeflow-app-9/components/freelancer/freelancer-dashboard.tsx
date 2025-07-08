import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { PortfolioEnhancer } from '../video/ai/portfolio-enhancer';
import { ClientReviewEnhancer } from '../video/ai/client-review-enhancer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '../ui/button';
import { PlusCircle, Video, Users, FileText, BarChart } from 'lucide-react';

export const FreelancerDashboard = () => {
  const supabase = createClientComponentClient();
  const [activeProject, setActiveProject] = React.useState<any>(null);
  const [stats, setStats] = React.useState({
    totalEarnings: 0,
    activeProjects: 0,
    pendingReviews: 0,
    completedProjects: 0
  });

  React.useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Load projects count
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('status, spent', { count: 'exact' });

    if (!projectsError && projects) {
      const activeCount = projects.filter(p => p.status === 'active').length;
      const completedCount = projects.filter(p => p.status === 'completed').length;
      const totalEarnings = projects.reduce((sum, p) => sum + (p.spent || 0), 0);

      // Load pending reviews
      const { count: pendingReviews } = await supabase
        .from('review_sessions')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      setStats({
        totalEarnings,
        activeProjects: activeCount,
        pendingReviews: pendingReviews || 0,
        completedProjects: completedCount
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Earnings</span>
            <span className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Active Projects</span>
            <span className="text-2xl font-bold">{stats.activeProjects}</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Pending Reviews</span>
            <span className="text-2xl font-bold">{stats.pendingReviews}</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Completed Projects</span>
            <span className="text-2xl font-bold">{stats.completedProjects}</span>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Video className="mr-2 h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="mr-2 h-4 w-4" />
            Client Reviews
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <Card className="p-6">
            <PortfolioEnhancer />
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card className="p-6">
            {activeProject ? (
              <ClientReviewEnhancer projectId={activeProject.id} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold">Select a Project</h3>
                <p className="text-gray-500">Choose a project to manage its reviews</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsList onProjectSelect={setActiveProject} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FreelancerAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Projects List Component
const ProjectsList = ({ onProjectSelect }: { onProjectSelect: (project: any) => void }) => {
  const supabase = createClientComponentClient();
  const [projects, setProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <Card
          key={project.id}
          className="p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => onProjectSelect(project)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-sm text-gray-500">{project.client_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${project.budget}</p>
              <p className="text-sm text-gray-500">{project.status}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Analytics Component
const FreelancerAnalytics = () => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Performance Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Earnings Trend</h4>
            {/* Add earnings chart component here */}
          </Card>
          
          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Project Completion Rate</h4>
            {/* Add completion rate chart component here */}
          </Card>
          
          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Client Satisfaction</h4>
            {/* Add satisfaction metrics component here */}
          </Card>
          
          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Skills Analysis</h4>
            {/* Add skills breakdown component here */}
          </Card>
        </div>
      </div>
    </Card>
  );
}; 