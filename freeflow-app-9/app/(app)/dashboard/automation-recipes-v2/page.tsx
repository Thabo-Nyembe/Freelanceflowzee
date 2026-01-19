'use client';

// Automation Recipe Builder - Visual Workflow Builder
// Competing with: Zapier, Make (Integromat), n8n, Pipedream

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  Settings,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Download,
  Upload,
  ExternalLink,
  Eye,
  Edit,
  RefreshCw,
  Mail,
  MessageSquare,
  Globe,
  FileText,
  DollarSign,
  Users,
  Folder,
  Calendar,
  Bell,
  Code,
  Database,
  Send,
  Timer,
  GitBranch,
  Repeat,
  Activity,
  TrendingUp,
  Target,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAutomationRecipes, Recipe, RecipeTemplate, RecipeExecution, Integration, DashboardStats, RecipeNode } from '@/lib/hooks/use-automation-recipes';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  Workflow,
  Zap,
  Mail,
  MessageSquare,
  Globe,
  FileText,
  DollarSign,
  Users,
  Folder,
  Calendar,
  Bell,
  Code,
  Database,
  Send,
  Timer,
  GitBranch,
  Repeat,
  Clock,
  CheckCircle,
  Target,
  Wand2,
  UserPlus: Users,
  CheckSquare: CheckCircle,
  Plus,
  Edit,
  Pause,
  Filter,
  RefreshCw,
  Shuffle: RefreshCw,
  ArrowDownCircle: Download,
  ArrowUpCircle: Upload,
  Sparkles,
  Circle: Activity,
};

const getIcon = (name: string) => iconMap[name] || Workflow;

// Status badge colors
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const executionStatusColors: Record<string, string> = {
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function AutomationRecipesPage() {
  const {
    recipes,
    templates,
    integrations,
    dashboard,
    isLoading,
    fetchRecipes,
    fetchTemplates,
    fetchIntegrations,
    fetchDashboard,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    cloneRecipe,
    executeRecipe,
    createFromTemplate,
    activateRecipe,
    pauseRecipe,
  } = useAutomationRecipes();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    category: 'general',
  });

  // Handle opening recipe editor
  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsEditorDialogOpen(true);
  };

  // Handle saving recipe edits
  const handleSaveRecipeEdit = async () => {
    if (!editingRecipe) return;
    await updateRecipe(editingRecipe.id, {
      name: editingRecipe.name,
      description: editingRecipe.description,
      category: editingRecipe.category,
    });
    setIsEditorDialogOpen(false);
    setEditingRecipe(null);
    toast.success('Recipe updated successfully');
  };

  // Handle integration OAuth connection
  const handleConnectIntegration = async (integration: Integration) => {
    const state = crypto.randomUUID();
    const redirectUrl = `${window.location.origin}/api/integrations/callback`;

    // Store state for verification
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('integration_id', integration.id);

    let authUrl = '';

    switch (integration.id) {
      case 'slack':
        authUrl = `https://slack.com/oauth/v2/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `scope=${encodeURIComponent('chat:write channels:read users:read')}&` +
          `state=${state}`;
        break;
      case 'github':
        authUrl = `https://github.com/login/oauth/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `scope=${encodeURIComponent('repo user')}&` +
          `state=${state}`;
        break;
      case 'google':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar')}&` +
          `access_type=offline&` +
          `state=${state}`;
        break;
      case 'notion':
        authUrl = `https://api.notion.com/v1/oauth/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_NOTION_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `state=${state}`;
        break;
      case 'airtable':
        authUrl = `https://airtable.com/oauth2/v1/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_AIRTABLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent('data.records:read data.records:write')}&` +
          `state=${state}`;
        break;
      case 'stripe':
        authUrl = `https://connect.stripe.com/oauth/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `scope=read_write&` +
          `state=${state}`;
        break;
      default:
        // For integrations without OAuth, show settings dialog
        setSelectedIntegration(integration);
        setIsIntegrationDialogOpen(true);
        toast.info(`Configure ${integration.name}`, { description: 'Enter your API credentials' });
        return;
    }

    // Redirect to OAuth flow
    toast.loading(`Connecting to ${integration.name}...`);
    window.location.href = authUrl;
  };

  // Load data on mount
  useEffect(() => {
    fetchRecipes();
    fetchTemplates();
    fetchIntegrations();
    fetchDashboard();
  }, [fetchRecipes, fetchTemplates, fetchIntegrations, fetchDashboard]);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || recipe.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(recipes.map(r => r.category))];

  // Handle create recipe
  const handleCreateRecipe = async () => {
    if (!newRecipe.name.trim()) {
      toast.error('Please enter a recipe name');
      return;
    }

    await createRecipe(newRecipe);
    setIsCreateDialogOpen(false);
    setNewRecipe({ name: '', description: '', category: 'general' });
  };

  // Handle create from template
  const handleCreateFromTemplate = async (template: RecipeTemplate) => {
    await createFromTemplate(template.id);
    setIsTemplateDialogOpen(false);
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Format time saved
  const formatTimeSaved = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Workflow className="h-8 w-8 text-purple-600" />
              Automation Recipes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Build powerful automations with our visual workflow builder
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Recipe Templates</DialogTitle>
                  <DialogDescription>
                    Choose a pre-built template to get started quickly
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {templates.map(template => {
                    const IconComponent = getIcon(template.icon);
                    return (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleCreateFromTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/30`}>
                              <IconComponent className={`h-5 w-5 text-${template.color}-600`} />
                            </div>
                            {template.is_featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between pt-0">
                          <div className="flex gap-1">
                            {template.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {template.use_count} uses
                          </span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Recipe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                  <DialogDescription>
                    Start from scratch or use a template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newRecipe.name}
                      onChange={e => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Automation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newRecipe.description}
                      onChange={e => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What does this automation do?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newRecipe.category}
                      onValueChange={value => setNewRecipe(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="client-management">Client Management</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="project-management">Project Management</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="notifications">Notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRecipe}>Create Recipe</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.totalRecipes || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.activeRecipes || 0} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.totalRuns || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.last30DaysExecutions || 0} in last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.successRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.last30DaysSuccess || 0} successful this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTimeSaved(dashboard?.timeSaved || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total automation time saved</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Latest automation runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboard?.recentExecutions || []).map((execution: RecipeExecution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            execution.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : execution.status === 'error'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}
                        >
                          {execution.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : execution.status === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {execution.automation_recipes?.name || 'Unknown Recipe'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(execution.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={executionStatusColors[execution.status]}>
                          {execution.status}
                        </Badge>
                        {execution.duration && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDuration(execution.duration)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(dashboard?.recentExecutions || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No recent executions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsCreateDialogOpen(true)}>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Recipe</h3>
                    <p className="text-sm text-gray-500">Start from scratch</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsTemplateDialogOpen(true)}>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Use Template</h3>
                    <p className="text-sm text-gray-500">Pre-built automations</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('integrations')}>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Connect Apps</h3>
                    <p className="text-sm text-gray-500">Set up integrations</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredRecipes.map((recipe, index) => {
                  const IconComponent = getIcon(recipe.icon);
                  return (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="h-full flex flex-col">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg bg-${recipe.color || 'gray'}-100 dark:bg-${recipe.color || 'gray'}-900/30`}>
                              <IconComponent className={`h-5 w-5 text-${recipe.color || 'gray'}-600`} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[recipe.status]}>
                                {recipe.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditRecipe(recipe)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => executeRecipe(recipe.id)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Run Now
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => cloneRecipe(recipe.id)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {recipe.status === 'active' ? (
                                    <DropdownMenuItem onClick={() => pauseRecipe(recipe.id)}>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Pause
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => activateRecipe(recipe.id)}>
                                      <Play className="mr-2 h-4 w-4" />
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deleteRecipe(recipe.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <CardTitle className="text-lg mt-2">{recipe.name}</CardTitle>
                          {recipe.description && (
                            <CardDescription className="text-sm line-clamp-2">
                              {recipe.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="flex flex-wrap gap-1 mb-4">
                            {recipe.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {recipe.total_runs} runs
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {recipe.total_runs > 0
                                ? Math.round((recipe.successful_runs / recipe.total_runs) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          {recipe.last_run_at && (
                            <span className="text-xs text-gray-400">
                              Last run: {new Date(recipe.last_run_at).toLocaleDateString()}
                            </span>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No recipes found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first automation recipe'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Recipe
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Featured Templates */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Featured Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.filter(t => t.is_featured).map(template => {
                  const IconComponent = getIcon(template.icon);
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCreateFromTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/30`}>
                            <IconComponent className={`h-5 w-5 text-${template.color}-600`} />
                          </div>
                          <Badge variant="secondary">Featured</Badge>
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {template.required_integrations.map(int => (
                            <Badge key={int} variant="outline" className="text-xs">
                              {int}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{template.use_count} uses</span>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* All Templates */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => {
                  const IconComponent = getIcon(template.icon);
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCreateFromTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/30 w-fit`}>
                          <IconComponent className={`h-5 w-5 text-${template.color}-600`} />
                        </div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between pt-0">
                        <div className="flex gap-1">
                          {template.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm">
                          Use <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map(integration => {
                const IconComponent = getIcon(integration.icon);
                return (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        {integration.connected ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Connected</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Triggers</span>
                          <span className="font-medium">{integration.triggers.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Actions</span>
                          <span className="font-medium">{integration.actions.length}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={integration.connected ? 'outline' : 'default'}
                        className="w-full"
                        onClick={() => handleConnectIntegration(integration)}
                      >
                        {integration.connected ? (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recipe Editor Dialog */}
      <Dialog open={isEditorDialogOpen} onOpenChange={setIsEditorDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Recipe
            </DialogTitle>
            <DialogDescription>
              Modify the recipe configuration and workflow
            </DialogDescription>
          </DialogHeader>
          {editingRecipe && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Recipe Name</Label>
                <Input
                  id="edit-name"
                  value={editingRecipe.name}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                  placeholder="My Automation Recipe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingRecipe.description || ''}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                  placeholder="What does this recipe do?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingRecipe.category}
                  onValueChange={(value) => setEditingRecipe({ ...editingRecipe, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Workflow Steps</Label>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {editingRecipe.trigger_count || 0} triggers
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {editingRecipe.action_count || 0} actions
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => {
                      window.open(`/dashboard/kazi-workflows-v2?recipe=${editingRecipe.id}`, '_blank');
                    }}
                  >
                    <GitBranch className="mr-2 h-4 w-4" />
                    Open Visual Workflow Builder
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRecipeEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Settings Dialog */}
      <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect this integration
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                />
              </div>
              {selectedIntegration.id === 'webhook' && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-webhook-endpoint.com"
                  />
                </div>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <p className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Need help? Check the integration documentation.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(`${selectedIntegration?.name} configured successfully!`);
              setIsIntegrationDialogOpen(false);
            }}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
