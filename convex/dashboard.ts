import { query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

/**
 * Get comprehensive dashboard metrics
 */
export const getMetrics = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Get all projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Get all proposals
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Filter projects by status
    const leads = projects.filter(p => p.status === "Lead");
    const proposalsSent = projects.filter(p => p.status === "Proposal");
    const workOrders = projects.filter(p => p.status === "Work Order");
    const invoices = projects.filter(p => p.status === "Invoice");

    // Calculate revenue metrics
    const totalRevenue = invoices.reduce((sum, inv) => {
      const proposal = proposals.find(p => p.projectId === inv._id);
      return sum + (proposal?.finalPrice || 0);
    }, 0);

    const totalCosts = invoices.reduce((sum, inv) => {
      const proposal = proposals.find(p => p.projectId === inv._id);
      return sum + (proposal?.totalCost || 0);
    }, 0);

    const grossProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Revenue by service type
    const revenueByService: Record<string, number> = {};
    invoices.forEach(inv => {
      const serviceType = inv.serviceType || "Unknown";
      const proposal = proposals.find(p => p.projectId === inv._id);
      const revenue = proposal?.finalPrice || 0;
      revenueByService[serviceType] = (revenueByService[serviceType] || 0) + revenue;
    });

    // Average job value
    const avgJobValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    // Pipeline value (proposals)
    const pipelineValue = proposalsSent.reduce((sum, proj) => {
      const proposal = proposals.find(p => p.projectId === proj._id);
      return sum + (proposal?.finalPrice || 0);
    }, 0);

    // Conversion rates
    const leadToProposal = leads.length > 0
      ? (proposalsSent.length / (leads.length + proposalsSent.length)) * 100
      : 0;

    const proposalToClose = proposalsSent.length > 0
      ? ((workOrders.length + invoices.length) / (proposalsSent.length + workOrders.length + invoices.length)) * 100
      : 0;

    // Time-based metrics (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentInvoices = invoices.filter(inv => (inv.createdAt || 0) >= thirtyDaysAgo);
    const monthlyRevenue = recentInvoices.reduce((sum, inv) => {
      const proposal = proposals.find(p => p.projectId === inv._id);
      return sum + (proposal?.finalPrice || 0);
    }, 0);

    const recentProposals = proposalsSent.filter(p => (p.createdAt || 0) >= thirtyDaysAgo);

    // Job completion metrics
    const completedJobs = invoices.length;
    const activeJobs = workOrders.length;
    const completionRate = (completedJobs + activeJobs) > 0
      ? (completedJobs / (completedJobs + activeJobs)) * 100
      : 0;

    // Customer service metrics (mock for now - will be real when we add customer feedback)
    const avgResponseTime = "2.3 hours"; // Mock
    const customerSatisfaction = 4.7; // Mock (out of 5)
    const repeatCustomerRate = 34; // Mock percentage

    return {
      // Revenue & Profit
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      monthlyRevenue,
      avgJobValue,

      // Pipeline
      pipelineValue,
      totalLeads: leads.length,
      totalProposals: proposalsSent.length,
      totalWorkOrders: workOrders.length,
      totalInvoices: invoices.length,

      // Conversion
      leadToProposal,
      proposalToClose,

      // Service breakdown
      revenueByService,

      // Job metrics
      completedJobs,
      activeJobs,
      completionRate,

      // Customer service (mock)
      avgResponseTime,
      customerSatisfaction,
      repeatCustomerRate,

      // Recent activity
      recentProposalsCount: recentProposals.length,
      recentInvoicesCount: recentInvoices.length,
    };
  },
});

/**
 * Get revenue trend data (last 12 months)
 */
export const getRevenueTrend = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Group by month
    const monthlyData: Record<string, { revenue: number; profit: number; jobs: number }> = {};

    projects.forEach(project => {
      if (project.status === "Invoice" && project.createdAt) {
        const date = new Date(project.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const proposal = proposals.find(p => p.projectId === project._id);
        const revenue = proposal?.finalPrice || 0;
        const cost = proposal?.totalCost || 0;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, profit: 0, jobs: 0 };
        }

        monthlyData[monthKey].revenue += revenue;
        monthlyData[monthKey].profit += (revenue - cost);
        monthlyData[monthKey].jobs += 1;
      }
    });

    // Convert to array and sort by date
    const trend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100) : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    return trend;
  },
});
