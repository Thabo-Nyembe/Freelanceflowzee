'use client'

import React, { useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { PortfolioEnhancer } from '../video/ai/portfolio-enhancer';
import { ClientReviewEnhancer } from '../video/ai/client-review-enhancer';
import { Button } from '../ui/button';
import { PlusCircle, Video, Users, FileText, BarChart, Download, RefreshCw, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardStats {
  totalEarnings: number;
  activeProjects: number;
  pendingReviews: number;
  completedProjects: number;
}

interface NewProjectData {
  title: string;
  description: string;
  client_name: string;
  budget: string;
  status: string;
}

export const FreelancerDashboard = () => {
  const supabase = createClient();
  const [activeProject, setActiveProject] = React.useState<any>(null);
  const [stats, setStats] = React.useState<DashboardStats>({
    totalEarnings: 0,
    activeProjects: 0,
    pendingReviews: 0,
    completedProjects: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);
  const [newProject, setNewProject] = React.useState<NewProjectData>({
    title: '',
    description: '',
    client_name: '',
    budget: '',
    status: 'planning'
  });

  // Load dashboard stats from Supabase
  const loadDashboardStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to view your dashboard');
        setIsLoading(false);
        return;
      }

      // Fetch projects with real data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status, budget, spent')
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      // Fetch invoices/payments for earnings
      const { data: payments, error: paymentsError } = await supabase
        .from('invoices')
        .select('total, status')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      // Fetch pending reviews count
      const { count: reviewsCount, error: reviewsError } = await supabase
        .from('project_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Calculate stats from real data
      const projectList = projects || [];
      const paymentList = payments || [];

      const totalEarnings = paymentList.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
      const activeProjects = projectList.filter((p: any) => p.status === 'active' || p.status === 'in_progress').length;
      const completedProjects = projectList.filter((p: any) => p.status === 'completed').length;

      setStats({
        totalEarnings,
        activeProjects,
        pendingReviews: reviewsCount || 0,
        completedProjects
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Load stats on mount
  React.useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  // Create new project handler with real Supabase integration
  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    setIsCreatingProject(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create a project');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: newProject.title,
          description: newProject.description,
          client_name: newProject.client_name,
          budget: parseFloat(newProject.budget) || 0,
          status: newProject.status,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created successfully!');
      setShowNewProjectDialog(false);
      setNewProject({ title: '', description: '', client_name: '', budget: '', status: 'planning' });
      loadDashboardStats(); // Refresh stats
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Export dashboard data as CSV using Blob/URL.createObjectURL
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to export data');
        return;
      }

      // Fetch all projects for export
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!projects || projects.length === 0) {
        toast.info('No data to export');
        return;
      }

      // Generate CSV content
      const headers = ['Title', 'Client', 'Status', 'Budget', 'Spent', 'Progress', 'Created At'];
      const rows = projects.map((p: any) => [
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.client_name || '').replace(/"/g, '""')}"`,
        p.status || '',
        p.budget || 0,
        p.spent || 0,
        `${p.progress || 0}%`,
        new Date(p.created_at).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download file using Blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `freelancer-dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
          <Button variant="outline" onClick={loadDashboardStats} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">Client Name</Label>
                  <Input
                    id="client"
                    value={newProject.client_name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value) => setNewProject(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={isCreatingProject}>
                  {isCreatingProject ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Earnings</span>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-bold">${(stats?.totalEarnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            )}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Active Projects</span>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-bold">{stats.activeProjects}</span>
            )}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Pending Reviews</span>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-bold">{stats.pendingReviews}</span>
            )}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Completed Projects</span>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-bold">{stats.completedProjects}</span>
            )}
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

// Projects List Component with real data and actions
const ProjectsList = ({ onProjectSelect }: { onProjectSelect: (project: any) => void }) => {
  const supabase = createClient();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const loadProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to view projects');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Delete project with confirmation
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(projectId);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  // Export single project details
  const handleExportProject = async (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const jsonContent = JSON.stringify(project, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-${project.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || project.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Project exported!');
    } catch (error) {
      console.error('Error exporting project:', error);
      toast.error('Failed to export project');
    }
  };

  // Export all projects as CSV
  const handleExportAllProjects = async () => {
    setIsExporting(true);
    try {
      if (projects.length === 0) {
        toast.info('No projects to export');
        return;
      }

      const headers = ['ID', 'Title', 'Client', 'Status', 'Budget', 'Spent', 'Progress', 'Created At', 'Updated At'];
      const rows = projects.map(p => [
        p.id,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.client_name || '').replace(/"/g, '""')}"`,
        p.status || '',
        p.budget || 0,
        p.spent || 0,
        `${p.progress || 0}%`,
        new Date(p.created_at).toLocaleDateString(),
        new Date(p.updated_at).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-projects-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('All projects exported!');
    } catch (error) {
      console.error('Error exporting projects:', error);
      toast.error('Failed to export projects');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded ml-auto" />
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadProjects}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportAllProjects} disabled={isExporting || projects.length === 0}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            Export All
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Projects Yet</h3>
          <p className="text-gray-500 mt-2">Create your first project to get started</p>
        </Card>
      ) : (
        projects.map(project => (
          <Card
            key={project.id}
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => onProjectSelect(project)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{project.title || 'Untitled Project'}</h3>
                <p className="text-sm text-gray-500">{project.client_name || 'No client'}</p>
                {project.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{project.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">${(project.budget || 0).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'active' || project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status || 'planning'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleExportProject(project, e)}
                    title="Export project"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    disabled={deletingId === project.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete project"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-sm">Delete</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

// Analytics Component with real data
const FreelancerAnalytics = () => {
  const supabase = createClient();
  const [analytics, setAnalytics] = React.useState<{
    earningsData: { month: string; amount: number }[];
    completionRate: number;
    averageSatisfaction: number;
    skillsBreakdown: { skill: string; count: number; percentage: number }[];
    totalProjects: number;
    completedProjects: number;
  }>({
    earningsData: [],
    completionRate: 0,
    averageSatisfaction: 0,
    skillsBreakdown: [],
    totalProjects: 0,
    completedProjects: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  const loadAnalytics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch projects for analytics
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, budget, spent, created_at, metadata')
        .eq('user_id', user.id);

      // Fetch invoices for earnings trend
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, paid_at, created_at')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('paid_at', { ascending: true });

      // Fetch reviews for satisfaction
      const { data: reviews } = await supabase
        .from('project_reviews')
        .select('rating')
        .eq('user_id', user.id);

      const projectList = projects || [];
      const invoiceList = invoices || [];
      const reviewList = reviews || [];

      // Calculate earnings by month
      const earningsByMonth: Record<string, number> = {};
      invoiceList.forEach((inv: any) => {
        const date = new Date(inv.paid_at || inv.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + (inv.total || 0);
      });

      // Convert to array and sort
      const earningsData = Object.entries(earningsByMonth)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      // Calculate completion rate
      const totalProjects = projectList.length;
      const completedProjects = projectList.filter((p: any) => p.status === 'completed').length;
      const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

      // Calculate average satisfaction
      const totalRatings = reviewList.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
      const averageSatisfaction = reviewList.length > 0 ? Math.round((totalRatings / reviewList.length) * 20) : 0; // Convert 5-star to percentage

      // Extract skills from project metadata
      const skillCounts: Record<string, number> = {};
      projectList.forEach((p: any) => {
        const tags = p.metadata?.tags || [];
        tags.forEach((tag: string) => {
          skillCounts[tag] = (skillCounts[tag] || 0) + 1;
        });
      });

      const totalSkillCount = Object.values(skillCounts).reduce((sum, count) => sum + count, 0);
      const skillsBreakdown = Object.entries(skillCounts)
        .map(([skill, count]) => ({
          skill,
          count,
          percentage: totalSkillCount > 0 ? Math.round((count / totalSkillCount) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        earningsData,
        completionRate,
        averageSatisfaction,
        skillsBreakdown,
        totalProjects,
        completedProjects
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Export analytics as PDF-ready HTML
  const handleExportAnalytics = async () => {
    setIsExporting(true);
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Freelancer Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #007bff; }
    .stat-label { color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; }
    .bar { background: #007bff; height: 20px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Freelancer Analytics Report</h1>
  <p>Generated on ${new Date().toLocaleDateString()}</p>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-value">${analytics.completionRate}%</div>
      <div class="stat-label">Project Completion Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analytics.averageSatisfaction}%</div>
      <div class="stat-label">Average Client Satisfaction</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analytics.totalProjects}</div>
      <div class="stat-label">Total Projects</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analytics.completedProjects}</div>
      <div class="stat-label">Completed Projects</div>
    </div>
  </div>

  <h2>Earnings Trend (Last 6 Months)</h2>
  <table>
    <tr><th>Month</th><th>Earnings</th></tr>
    ${analytics.earningsData.map(e => `<tr><td>${e.month}</td><td>$${e.amount.toLocaleString()}</td></tr>`).join('')}
  </table>

  <h2>Skills Breakdown</h2>
  <table>
    <tr><th>Skill</th><th>Projects</th><th>Percentage</th></tr>
    ${analytics.skillsBreakdown.map(s => `<tr><td>${s.skill}</td><td>${s.count}</td><td>${s.percentage}%</td></tr>`).join('')}
  </table>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `freelancer-analytics-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Analytics report exported!');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Performance Analytics</h3>
          <Button variant="outline" onClick={handleExportAnalytics} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Earnings Trend</h4>
            {isLoading ? (
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
            ) : analytics.earningsData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No earnings data yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.earningsData.map((item) => (
                  <div key={item.month} className="flex items-center gap-2">
                    <span className="w-16 text-sm text-gray-600">{item.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className="bg-primary h-4 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (item.amount / Math.max(...analytics.earningsData.map(e => e.amount))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="w-20 text-sm font-medium text-right">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Project Completion Rate</h4>
            {isLoading ? (
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="text-4xl font-bold text-primary">{analytics.completionRate}%</div>
                <p className="text-gray-500 text-sm mt-2">
                  {analytics.completedProjects} of {analytics.totalProjects} projects completed
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Client Satisfaction</h4>
            {isLoading ? (
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="text-4xl font-bold text-green-600">{analytics.averageSatisfaction}%</div>
                <p className="text-gray-500 text-sm mt-2">Based on client reviews</p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-medium mb-4">Skills Analysis</h4>
            {isLoading ? (
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
            ) : analytics.skillsBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No skills data yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.skillsBreakdown.map((skill) => (
                  <div key={skill.skill} className="flex items-center gap-2">
                    <span className="w-24 text-sm text-gray-600 truncate">{skill.skill}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right">{skill.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Card>
  );
}; 