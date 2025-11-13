import { query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

/**
 * Get Hormozi-style dashboard metrics
 * Focus: MONEY, ACTIVITY, CONVERSION
 */
export const getMetrics = query({
  handler: async (ctx) => {
    let org;
    try {
      org = await getOrganization(ctx);
    } catch (error) {
      // Return empty metrics if org not found
      return {
        // THIS MONTH - Money metrics
        cashCollected: 0,
        pipelineValue: 0,
        closeRate: 0,

        // ACTIVITY (This Week)
        leadsThisWeek: 0,
        proposalsSentThisWeek: 0,
        avgDaysToClose: 0,

        // CONVERSION FUNNEL
        totalLeads: 0,
        totalProposals: 0,
        totalWon: 0,
        leadToProposalRate: 0,
        proposalToWonRate: 0,
        avgProposalValue: 0,

        // CAPACITY
        scheduledRevenue: 0,
        availableCapacityPercent: 0,
        nextOpenDate: null,
      };
    }

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

    // THIS MONTH - Cash Collected (Invoices paid this month)
    const now = Date.now();
    const firstOfMonth = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);
    const invoicesThisMonth = invoices.filter(inv => (inv.createdAt || 0) >= firstOfMonth);
    const cashCollected = invoicesThisMonth.reduce((sum, inv) => {
      const proposal = proposals.find(p => p.projectId === inv._id);
      return sum + (proposal?.finalPrice || 0);
    }, 0);

    // Pipeline Value (Proposals not yet won/lost)
    const pipelineValue = proposalsSent.reduce((sum, proj) => {
      const proposal = proposals.find(p => p.projectId === proj._id);
      return sum + (proposal?.finalPrice || 0);
    }, 0);

    // Close Rate (Proposals → Won)
    const totalWon = workOrders.length + invoices.length;
    const totalProposals = proposalsSent.length + totalWon;
    const closeRate = totalProposals > 0 ? (totalWon / totalProposals) * 100 : 0;

    // ACTIVITY - This Week
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const leadsThisWeek = leads.filter(l => (l.createdAt || 0) >= oneWeekAgo).length;
    const proposalsSentThisWeek = proposalsSent.filter(p => (p.createdAt || 0) >= oneWeekAgo).length;

    // Average Days to Close (from lead created to invoice)
    const closedDeals = invoices.filter(inv => inv.createdAt && inv._creationTime);
    const avgDaysToClose = closedDeals.length > 0
      ? closedDeals.reduce((sum, inv) => {
          const daysDiff = ((inv.createdAt || 0) - inv._creationTime) / (1000 * 60 * 60 * 24);
          return sum + daysDiff;
        }, 0) / closedDeals.length
      : 0;

    // CONVERSION FUNNEL
    const leadToProposalRate = leads.length > 0
      ? (proposalsSent.length / (leads.length + proposalsSent.length)) * 100
      : 0;

    const proposalToWonRate = totalProposals > 0
      ? (totalWon / totalProposals) * 100
      : 0;

    const avgProposalValue = proposalsSent.length > 0
      ? pipelineValue / proposalsSent.length
      : 0;

    // CAPACITY
    // Scheduled Revenue = Work Orders value
    const scheduledRevenue = workOrders.reduce((sum, wo) => {
      const proposal = proposals.find(p => p.projectId === wo._id);
      return sum + (proposal?.finalPrice || 0);
    }, 0);

    // Available Capacity (simplified: assumes 10 concurrent jobs max)
    const maxConcurrentJobs = 10;
    const availableCapacityPercent = ((maxConcurrentJobs - workOrders.length) / maxConcurrentJobs) * 100;

    // Next Open Date (mock - would need scheduling system)
    const nextOpenDate = workOrders.length < maxConcurrentJobs
      ? new Date(now).toISOString().split('T')[0]
      : new Date(now + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    return {
      // THIS MONTH - Money
      cashCollected,
      pipelineValue,
      closeRate,

      // ACTIVITY (This Week)
      leadsThisWeek,
      proposalsSentThisWeek,
      avgDaysToClose: Math.round(avgDaysToClose * 10) / 10,

      // CONVERSION FUNNEL
      totalLeads: leads.length,
      totalProposals: proposalsSent.length,
      totalWon,
      leadToProposalRate,
      proposalToWonRate,
      avgProposalValue,

      // CAPACITY
      scheduledRevenue,
      availableCapacityPercent: Math.max(0, Math.min(100, availableCapacityPercent)),
      nextOpenDate,
    };
  },
});

/**
 * Get revenue trend data (last 12 months)
 */
export const getRevenueTrend = query({
  handler: async (ctx) => {
    let org;
    try {
      org = await getOrganization(ctx);
    } catch (error) {
      // Return empty trend if org not found
      return [];
    }

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
