// =====================================================
// KAZI Reporting & Exports Service
// World-class analytics, reports & data exports
// =====================================================

import { createClient } from '@/lib/supabase/client';

// =====================================================
// Types
// =====================================================

export interface Report {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: ReportSchedule;
  is_template: boolean;
  is_public: boolean;
  last_generated_at?: string;
  generation_count: number;
  created_at: string;
  updated_at: string;
}

export type ReportType =
  | 'revenue'
  | 'clients'
  | 'projects'
  | 'invoices'
  | 'time_tracking'
  | 'expenses'
  | 'bookings'
  | 'team_performance'
  | 'custom';

export interface ReportConfig {
  date_range: DateRange;
  filters?: ReportFilters;
  grouping?: string;
  metrics?: string[];
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'table';
  columns?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
}

export interface DateRange {
  type: 'preset' | 'custom';
  preset?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'all_time';
  start_date?: string;
  end_date?: string;
}

export interface ReportFilters {
  client_ids?: string[];
  project_ids?: string[];
  status?: string[];
  tags?: string[];
  team_member_ids?: string[];
  categories?: string[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  time: string; // HH:mm
  timezone: string;
  email_recipients: string[];
  export_format: ExportFormat;
  is_active: boolean;
}

export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

export interface ReportResult {
  report_id: string;
  generated_at: string;
  date_range: { start: string; end: string };
  summary: Record<string, any>;
  data: any[];
  charts?: ChartData[];
  totals?: Record<string, number>;
}

export interface ChartData {
  type: string;
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface Export {
  id: string;
  user_id: string;
  report_id?: string;
  type: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  error_message?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
}

export interface DashboardMetrics {
  revenue: {
    total: number;
    trend: number;
    by_month: { month: string; amount: number }[];
  };
  clients: {
    total: number;
    active: number;
    new_this_month: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  invoices: {
    total_outstanding: number;
    total_paid: number;
    overdue_count: number;
    average_payment_days: number;
  };
  bookings: {
    upcoming: number;
    completed_this_month: number;
    cancelled_rate: number;
  };
}

// =====================================================
// Reports Service Class
// =====================================================

class ReportsService {
  private static instance: ReportsService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  // =====================================================
  // Report CRUD
  // =====================================================

  async createReport(userId: string, input: {
    name: string;
    description?: string;
    type: ReportType;
    config: ReportConfig;
    schedule?: ReportSchedule;
    is_template?: boolean;
    is_public?: boolean;
  }): Promise<Report> {
    const { data, error } = await this.supabase
      .from('reports')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        type: input.type,
        config: input.config,
        schedule: input.schedule,
        is_template: input.is_template || false,
        is_public: input.is_public || false,
        generation_count: 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create report: ${error.message}`);
    return data;
  }

  async getReports(userId: string, type?: ReportType): Promise<Report[]> {
    let query = this.supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get reports: ${error.message}`);
    return data || [];
  }

  async getReport(reportId: string): Promise<Report | null> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) return null;
    return data;
  }

  // Alias for getReport - used for ownership verification
  async getReportById(reportId: string, userId: string): Promise<Report | null> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateReport(reportId: string, userId: string, updates: Partial<Report>): Promise<Report> {
    const { data, error } = await this.supabase
      .from('reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update report: ${error.message}`);
    return data;
  }

  async deleteReport(reportId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete report: ${error.message}`);
  }

  // =====================================================
  // Report Generation
  // =====================================================

  async generateReport(userId: string, reportId: string): Promise<ReportResult> {
    const report = await this.getReport(reportId);
    if (!report) throw new Error('Report not found');
    if (report.user_id !== userId) throw new Error('Access denied');

    const dateRange = this.resolveDateRange(report.config.date_range);

    let result: ReportResult;

    switch (report.type) {
      case 'revenue':
        result = await this.generateRevenueReport(userId, report.config, dateRange);
        break;
      case 'clients':
        result = await this.generateClientsReport(userId, report.config, dateRange);
        break;
      case 'projects':
        result = await this.generateProjectsReport(userId, report.config, dateRange);
        break;
      case 'invoices':
        result = await this.generateInvoicesReport(userId, report.config, dateRange);
        break;
      case 'time_tracking':
        result = await this.generateTimeTrackingReport(userId, report.config, dateRange);
        break;
      case 'expenses':
        result = await this.generateExpensesReport(userId, report.config, dateRange);
        break;
      case 'bookings':
        result = await this.generateBookingsReport(userId, report.config, dateRange);
        break;
      case 'team_performance':
        result = await this.generateTeamPerformanceReport(userId, report.config, dateRange);
        break;
      default:
        result = await this.generateCustomReport(userId, report.config, dateRange);
    }

    // Update report stats
    await this.supabase
      .from('reports')
      .update({
        last_generated_at: new Date().toISOString(),
        generation_count: report.generation_count + 1,
      })
      .eq('id', reportId);

    return {
      ...result,
      report_id: reportId,
      generated_at: new Date().toISOString(),
      date_range: dateRange,
    };
  }

  private async generateRevenueReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    // Get invoices for revenue calculation
    const { data: invoices } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const paidInvoices = (invoices || []).filter(i => i.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingRevenue = (invoices || [])
      .filter(i => i.status === 'sent' || i.status === 'pending')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    // Group by month
    const byMonth: Record<string, number> = {};
    paidInvoices.forEach(invoice => {
      const month = invoice.paid_at?.substring(0, 7) || invoice.created_at.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + (invoice.total || 0);
    });

    // Group by client if requested
    const byClient: Record<string, number> = {};
    if (config.grouping === 'client') {
      paidInvoices.forEach(invoice => {
        const clientId = invoice.client_id || 'unknown';
        byClient[clientId] = (byClient[clientId] || 0) + (invoice.total || 0);
      });
    }

    return {
      summary: {
        total_revenue: totalRevenue,
        pending_revenue: pendingRevenue,
        invoice_count: paidInvoices.length,
        average_invoice: paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0,
      },
      data: invoices || [],
      charts: [
        {
          type: 'line',
          title: 'Revenue Over Time',
          labels: Object.keys(byMonth).sort(),
          datasets: [{
            label: 'Revenue',
            data: Object.keys(byMonth).sort().map(k => byMonth[k]),
          }],
        },
      ],
      totals: {
        revenue: totalRevenue,
        pending: pendingRevenue,
        count: paidInvoices.length,
      },
    };
  }

  private async generateClientsReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    const { data: clients } = await this.supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const activeClients = (clients || []).filter(c => c.status === 'active');
    const newClients = (clients || []).filter(c => {
      const created = new Date(c.created_at);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return created >= monthStart;
    });

    // Get client revenue
    const { data: invoices } = await this.supabase
      .from('invoices')
      .select('client_id, total, status')
      .eq('user_id', userId)
      .eq('status', 'paid');

    const clientRevenue: Record<string, number> = {};
    (invoices || []).forEach(inv => {
      if (inv.client_id) {
        clientRevenue[inv.client_id] = (clientRevenue[inv.client_id] || 0) + (inv.total || 0);
      }
    });

    const enrichedClients = (clients || []).map(client => ({
      ...client,
      total_revenue: clientRevenue[client.id] || 0,
    }));

    return {
      summary: {
        total_clients: (clients || []).length,
        active_clients: activeClients.length,
        new_this_month: newClients.length,
        total_client_revenue: Object.values(clientRevenue).reduce((a, b) => a + b, 0),
      },
      data: enrichedClients,
      charts: [
        {
          type: 'pie',
          title: 'Clients by Status',
          labels: ['Active', 'Inactive', 'Archived'],
          datasets: [{
            label: 'Clients',
            data: [
              (clients || []).filter(c => c.status === 'active').length,
              (clients || []).filter(c => c.status === 'inactive').length,
              (clients || []).filter(c => c.status === 'archived').length,
            ],
          }],
        },
      ],
      totals: {
        total: (clients || []).length,
        active: activeClients.length,
        new: newClients.length,
      },
    };
  }

  private async generateProjectsReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    const { data: projects } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const byStatus: Record<string, number> = {};
    (projects || []).forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });

    const overdue = (projects || []).filter(p =>
      p.due_date && new Date(p.due_date) < new Date() && p.status !== 'completed'
    );

    return {
      summary: {
        total_projects: (projects || []).length,
        active_projects: (projects || []).filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completed_projects: (projects || []).filter(p => p.status === 'completed').length,
        overdue_projects: overdue.length,
        total_budget: (projects || []).reduce((sum, p) => sum + (p.budget || 0), 0),
      },
      data: projects || [],
      charts: [
        {
          type: 'pie',
          title: 'Projects by Status',
          labels: Object.keys(byStatus),
          datasets: [{
            label: 'Projects',
            data: Object.values(byStatus),
          }],
        },
      ],
      totals: byStatus,
    };
  }

  private async generateInvoicesReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    const { data: invoices } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const byStatus: Record<string, { count: number; amount: number }> = {};
    (invoices || []).forEach(inv => {
      if (!byStatus[inv.status]) {
        byStatus[inv.status] = { count: 0, amount: 0 };
      }
      byStatus[inv.status].count += 1;
      byStatus[inv.status].amount += inv.total || 0;
    });

    const overdue = (invoices || []).filter(inv =>
      inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid'
    );

    // Calculate average payment time
    const paidInvoices = (invoices || []).filter(inv => inv.status === 'paid' && inv.paid_at);
    const avgPaymentDays = paidInvoices.length > 0
      ? paidInvoices.reduce((sum, inv) => {
          const created = new Date(inv.created_at);
          const paid = new Date(inv.paid_at);
          return sum + Math.ceil((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoices.length
      : 0;

    return {
      summary: {
        total_invoices: (invoices || []).length,
        total_amount: (invoices || []).reduce((sum, i) => sum + (i.total || 0), 0),
        paid_amount: byStatus['paid']?.amount || 0,
        pending_amount: (byStatus['sent']?.amount || 0) + (byStatus['pending']?.amount || 0),
        overdue_count: overdue.length,
        overdue_amount: overdue.reduce((sum, i) => sum + (i.total || 0), 0),
        average_payment_days: Math.round(avgPaymentDays),
      },
      data: invoices || [],
      charts: [
        {
          type: 'bar',
          title: 'Invoices by Status',
          labels: Object.keys(byStatus),
          datasets: [
            {
              label: 'Count',
              data: Object.values(byStatus).map(s => s.count),
            },
            {
              label: 'Amount',
              data: Object.values(byStatus).map(s => s.amount),
            },
          ],
        },
      ],
      totals: {
        count: (invoices || []).length,
        amount: (invoices || []).reduce((sum, i) => sum + (i.total || 0), 0),
      },
    };
  }

  private async generateTimeTrackingReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    const { data: entries } = await this.supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', dateRange.start)
      .lte('end_time', dateRange.end);

    const totalHours = (entries || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;
    const billableHours = (entries || [])
      .filter(e => e.is_billable)
      .reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;

    // Group by project
    const byProject: Record<string, number> = {};
    (entries || []).forEach(entry => {
      const projectId = entry.project_id || 'no_project';
      byProject[projectId] = (byProject[projectId] || 0) + (entry.duration_minutes || 0) / 60;
    });

    // Group by day
    const byDay: Record<string, number> = {};
    (entries || []).forEach(entry => {
      const day = entry.start_time.substring(0, 10);
      byDay[day] = (byDay[day] || 0) + (entry.duration_minutes || 0) / 60;
    });

    return {
      summary: {
        total_hours: Math.round(totalHours * 100) / 100,
        billable_hours: Math.round(billableHours * 100) / 100,
        non_billable_hours: Math.round((totalHours - billableHours) * 100) / 100,
        billable_percentage: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
        entry_count: (entries || []).length,
      },
      data: entries || [],
      charts: [
        {
          type: 'bar',
          title: 'Hours by Day',
          labels: Object.keys(byDay).sort(),
          datasets: [{
            label: 'Hours',
            data: Object.keys(byDay).sort().map(k => Math.round(byDay[k] * 100) / 100),
          }],
        },
      ],
      totals: {
        hours: totalHours,
        billable: billableHours,
      },
    };
  }

  private async generateExpensesReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    const { data: expenses } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const reimbursable = (expenses || [])
      .filter(e => e.is_reimbursable)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    (expenses || []).forEach(expense => {
      const category = expense.category || 'uncategorized';
      byCategory[category] = (byCategory[category] || 0) + (expense.amount || 0);
    });

    return {
      summary: {
        total_expenses: totalExpenses,
        reimbursable_amount: reimbursable,
        non_reimbursable: totalExpenses - reimbursable,
        expense_count: (expenses || []).length,
        average_expense: (expenses || []).length > 0 ? totalExpenses / (expenses || []).length : 0,
      },
      data: expenses || [],
      charts: [
        {
          type: 'pie',
          title: 'Expenses by Category',
          labels: Object.keys(byCategory),
          datasets: [{
            label: 'Amount',
            data: Object.values(byCategory),
          }],
        },
      ],
      totals: byCategory,
    };
  }

  private async generateBookingsReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', dateRange.start)
      .lte('start_time', dateRange.end);

    const byStatus: Record<string, number> = {};
    (bookings || []).forEach(b => {
      byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    });

    const completed = (bookings || []).filter(b => b.status === 'completed');
    const cancelled = (bookings || []).filter(b => b.status === 'cancelled');
    const noShow = (bookings || []).filter(b => b.status === 'no_show');

    return {
      summary: {
        total_bookings: (bookings || []).length,
        completed_bookings: completed.length,
        cancelled_bookings: cancelled.length,
        no_shows: noShow.length,
        cancellation_rate: (bookings || []).length > 0
          ? Math.round((cancelled.length / (bookings || []).length) * 100)
          : 0,
        no_show_rate: (bookings || []).length > 0
          ? Math.round((noShow.length / (bookings || []).length) * 100)
          : 0,
      },
      data: bookings || [],
      charts: [
        {
          type: 'pie',
          title: 'Bookings by Status',
          labels: Object.keys(byStatus),
          datasets: [{
            label: 'Bookings',
            data: Object.values(byStatus),
          }],
        },
      ],
      totals: byStatus,
    };
  }

  private async generateTeamPerformanceReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    // Get team tasks
    const { data: tasks } = await this.supabase
      .from('team_tasks')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Group by assignee
    const byMember: Record<string, { completed: number; total: number }> = {};
    (tasks || []).forEach(task => {
      const assignee = task.assigned_to || 'unassigned';
      if (!byMember[assignee]) {
        byMember[assignee] = { completed: 0, total: 0 };
      }
      byMember[assignee].total += 1;
      if (task.status === 'done') {
        byMember[assignee].completed += 1;
      }
    });

    const totalTasks = (tasks || []).length;
    const completedTasks = (tasks || []).filter(t => t.status === 'done').length;

    return {
      summary: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        team_members: Object.keys(byMember).length,
      },
      data: Object.entries(byMember).map(([member, stats]) => ({
        member_id: member,
        completed: stats.completed,
        total: stats.total,
        completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      })),
      charts: [
        {
          type: 'bar',
          title: 'Tasks by Team Member',
          labels: Object.keys(byMember),
          datasets: [
            {
              label: 'Completed',
              data: Object.values(byMember).map(s => s.completed),
            },
            {
              label: 'Total',
              data: Object.values(byMember).map(s => s.total),
            },
          ],
        },
      ],
      totals: {
        tasks: totalTasks,
        completed: completedTasks,
      },
    };
  }

  private async generateCustomReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: string; end: string }
  ): Promise<Partial<ReportResult>> {
    // Custom report - return empty structure
    return {
      summary: {},
      data: [],
      charts: [],
      totals: {},
    };
  }

  // =====================================================
  // Dashboard Metrics
  // =====================================================

  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Revenue metrics
    const { data: invoices } = await this.supabase
      .from('invoices')
      .select('total, status, paid_at, created_at')
      .eq('user_id', userId)
      .eq('status', 'paid');

    const totalRevenue = (invoices || []).reduce((sum, i) => sum + (i.total || 0), 0);
    const thisMonthRevenue = (invoices || [])
      .filter(i => i.paid_at && new Date(i.paid_at) >= thisMonth)
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const lastMonthRevenue = (invoices || [])
      .filter(i => i.paid_at && new Date(i.paid_at) >= lastMonth && new Date(i.paid_at) < thisMonth)
      .reduce((sum, i) => sum + (i.total || 0), 0);

    const revenueTrend = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    // Group by month for chart
    const byMonth: Record<string, number> = {};
    (invoices || []).forEach(inv => {
      if (inv.paid_at) {
        const month = inv.paid_at.substring(0, 7);
        byMonth[month] = (byMonth[month] || 0) + (inv.total || 0);
      }
    });

    // Clients metrics
    const { data: clients } = await this.supabase
      .from('clients')
      .select('id, status, created_at')
      .eq('user_id', userId);

    const activeClients = (clients || []).filter(c => c.status === 'active').length;
    const newThisMonth = (clients || []).filter(c => new Date(c.created_at) >= thisMonth).length;

    // Projects metrics
    const { data: projects } = await this.supabase
      .from('projects')
      .select('id, status, due_date')
      .eq('user_id', userId);

    const activeProjects = (projects || []).filter(p => p.status === 'active' || p.status === 'in_progress').length;
    const completedProjects = (projects || []).filter(p => p.status === 'completed').length;
    const overdueProjects = (projects || []).filter(p =>
      p.due_date && new Date(p.due_date) < now && p.status !== 'completed'
    ).length;

    // Invoice metrics
    const { data: allInvoices } = await this.supabase
      .from('invoices')
      .select('total, status, due_date, paid_at, created_at')
      .eq('user_id', userId);

    const outstanding = (allInvoices || [])
      .filter(i => i.status === 'sent' || i.status === 'pending')
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const totalPaid = (allInvoices || [])
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const overdueInvoices = (allInvoices || []).filter(i =>
      i.due_date && new Date(i.due_date) < now && i.status !== 'paid'
    );

    const paidInvoicesForAvg = (allInvoices || []).filter(i => i.status === 'paid' && i.paid_at);
    const avgPaymentDays = paidInvoicesForAvg.length > 0
      ? paidInvoicesForAvg.reduce((sum, inv) => {
          const created = new Date(inv.created_at);
          const paid = new Date(inv.paid_at);
          return sum + Math.ceil((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoicesForAvg.length
      : 0;

    // Bookings metrics
    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('id, status, start_time')
      .eq('user_id', userId);

    const upcomingBookings = (bookings || []).filter(b =>
      b.status === 'confirmed' && new Date(b.start_time) > now
    ).length;
    const completedThisMonth = (bookings || []).filter(b =>
      b.status === 'completed' && new Date(b.start_time) >= thisMonth
    ).length;
    const cancelledCount = (bookings || []).filter(b => b.status === 'cancelled').length;
    const cancelledRate = (bookings || []).length > 0
      ? Math.round((cancelledCount / (bookings || []).length) * 100)
      : 0;

    return {
      revenue: {
        total: totalRevenue,
        trend: revenueTrend,
        by_month: Object.keys(byMonth).sort().slice(-6).map(month => ({
          month,
          amount: byMonth[month],
        })),
      },
      clients: {
        total: (clients || []).length,
        active: activeClients,
        new_this_month: newThisMonth,
      },
      projects: {
        total: (projects || []).length,
        active: activeProjects,
        completed: completedProjects,
        overdue: overdueProjects,
      },
      invoices: {
        total_outstanding: outstanding,
        total_paid: totalPaid,
        overdue_count: overdueInvoices.length,
        average_payment_days: Math.round(avgPaymentDays),
      },
      bookings: {
        upcoming: upcomingBookings,
        completed_this_month: completedThisMonth,
        cancelled_rate: cancelledRate,
      },
    };
  }

  // =====================================================
  // Export Operations
  // =====================================================

  async createExport(userId: string, input: {
    report_id?: string;
    type: string;
    format: ExportFormat;
    data?: any;
  }): Promise<Export> {
    const { data, error } = await this.supabase
      .from('exports')
      .insert({
        user_id: userId,
        report_id: input.report_id,
        type: input.type,
        format: input.format,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create export: ${error.message}`);

    // In production, this would trigger a background job
    // For now, we'll mark it as processing
    await this.supabase
      .from('exports')
      .update({ status: 'processing' })
      .eq('id', data.id);

    return data;
  }

  async getExports(userId: string): Promise<Export[]> {
    const { data, error } = await this.supabase
      .from('exports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(`Failed to get exports: ${error.message}`);
    return data || [];
  }

  async getExport(exportId: string): Promise<Export | null> {
    const { data, error } = await this.supabase
      .from('exports')
      .select('*')
      .eq('id', exportId)
      .single();

    if (error) return null;
    return data;
  }

  // =====================================================
  // Helpers
  // =====================================================

  private resolveDateRange(dateRange: DateRange): { start: string; end: string } {
    if (dateRange.type === 'custom' && dateRange.start_date && dateRange.end_date) {
      return {
        start: dateRange.start_date,
        end: dateRange.end_date,
      };
    }

    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (dateRange.preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'this_week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        break;
      case 'last_week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        end = new Date(now);
        end.setDate(now.getDate() - now.getDay());
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'last_quarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        start = new Date(now.getFullYear(), lastQuarter * 3, 1);
        end = new Date(now.getFullYear(), lastQuarter * 3 + 3, 1);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all_time':
      default:
        start = new Date(2020, 0, 1);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }
}

// Export singleton instance
export const reportsService = ReportsService.getInstance();

// Export convenience functions
export const generateReport = (userId: string, reportId: string) =>
  reportsService.generateReport(userId, reportId);

export const getDashboardMetrics = (userId: string) =>
  reportsService.getDashboardMetrics(userId);
