import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

interface AnalyticsData {
  earnings: {
    daily: unknown[];
    monthly: unknown[];
    yearly: unknown[];
  };
  projects: {
    completion: unknown[];
    categoryDistribution: unknown[];
    statusDistribution: unknown[];
  };
  clients: {
    satisfaction: unknown[];
    retention: unknown[];
    geography: unknown[];
  };
  skills: {
    demand: unknown[];
    revenue: unknown[];
    growth: unknown[];
  };
  videoMetrics: {
    views: unknown[];
    engagement: unknown[];
    portfolioPerformance: unknown[];
  };
}

export const _FreelancerAnalytics = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = React.<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = React.<'daily' | 'monthly' | 'yearly'>('monthly');

  React.useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    // Fetch earnings data
    const { data: earnings } = await supabase
      .from('projects')
      .select('spent, created_at')
      .order('created_at', { ascending: true });

    // Fetch project data
    const { data: projects } = await supabase
      .from('projects')
      .select('*');

    // Fetch client satisfaction data
    const { data: reviews } = await supabase
      .from('review_sessions')
      .select('*');

    // Fetch portfolio video metrics
    const { data: portfolioVideos } = await supabase
      .from('portfolio_videos')
      .select('*');

    // Process and transform data
    const processedData: AnalyticsData = {
      earnings: processEarningsData(earnings),
      projects: processProjectData(projects),
      clients: processClientData(reviews),
      skills: processSkillsData(projects),
      videoMetrics: processVideoMetrics(portfolioVideos),
    };

    setData(processedData);
  };

  const processEarningsData = (earnings: unknown[]) => {
    // Process earnings data for different timeframes
    return {
      daily: groupDataByTimeframe(earnings, 'day'),
      monthly: groupDataByTimeframe(earnings, 'month'),
      yearly: groupDataByTimeframe(earnings, 'year'),
    };
  };

  const groupDataByTimeframe = (data: unknown[], timeframe: 'day' | 'month' | 'year') => {
    // Group and aggregate data based on timeframe
    return data.reduce((acc, curr) => {
      const date = new Date(curr.created_at);
      const key = format(date, 
        timeframe === 'day' ? 'yyyy-MM-dd' :
        timeframe === 'month' ? 'yyyy-MM' : 'yyyy'
      );
      
      if (!acc[key]) {
        acc[key] = { date: key, value: 0 };
      }
      acc[key].value += curr.spent || 0;
      return acc;
    }, {});
  };

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Tabs value={timeframe} onValueChange={(v: unknown) => setTimeframe(v)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Financial Metrics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Financial Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.earnings[timeframe]}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Project Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.projects.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data?.projects.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Project Completion Rate</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.projects.completion}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Client Metrics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Client Satisfaction & Retention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.clients.satisfaction}>
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.clients.retention}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="returnRate" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Portfolio Video Metrics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Portfolio Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.videoMetrics.views}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.videoMetrics.engagement}>
                <XAxis dataKey="videoTitle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagementScore" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Skills Analysis */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Skills & Revenue Analysis</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.skills.revenue}>
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}; 